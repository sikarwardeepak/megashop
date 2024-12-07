import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Cart, CartItemAdd, StripeSession } from '../models/cart.model';
import { Product, ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  platformId = inject(PLATFORM_ID);
  private productService = inject(ProductService);
  
  private keyCartStorage = 'cart';

  private addedToCart$ = new BehaviorSubject<Array<CartItemAdd>>([]);
  addedToCart = this.addedToCart$.asObservable();

  constructor() {
    const cartFromLocalStorage = this.getCartFromLocalStorage();
    this.addedToCart$.next(cartFromLocalStorage);
  }

  private getCartFromLocalStorage(): Array<CartItemAdd> {
    if (isPlatformBrowser(this.platformId)) {
      const cartProducts = localStorage.getItem(this.keyCartStorage);
      if (cartProducts) {
        return JSON.parse(cartProducts) as CartItemAdd[];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  addToCart(publicId: string, command: 'add' | 'remove'): void {
    if (isPlatformBrowser(this.platformId)) {
      const itemToAdd: CartItemAdd = { publicId, quantity: 1 };
      const cartFromLocalStorage = this.getCartFromLocalStorage();
      const productExist = cartFromLocalStorage.find(
        (item) => item.publicId === publicId
      );
      if (productExist) {
        if (command === 'add') {
          if (this.getProductQuantity(publicId) > 0) {
            productExist.quantity++;
            this.productService.updateProductQuantity(Number(publicId), -1);
          } else {
            alert('No more stock available for this product.');
          }
        } else if (command === 'remove') {
          productExist.quantity--;
          if (productExist.quantity == 0) {
            this.removeFromCart(publicId);
            return;
          } else {
            this.productService.updateProductQuantity(Number(publicId), 1);
          }
        }
      } else {
        if (this.getProductQuantity(publicId) > 0) {
          cartFromLocalStorage.push(itemToAdd);
          this.productService.updateProductQuantity(Number(publicId), -1);
        } else {
          alert('Product is out of stock.');
        }
      }
      this.saveCartToLocalStorage(cartFromLocalStorage);
    }
  }

  private saveCartToLocalStorage(cart: Array<CartItemAdd>): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.keyCartStorage, JSON.stringify(cart));
      this.addedToCart$.next(cart);
    }
  }

  private getProductQuantity(publicId: string): number {
    const productId = Number(publicId);
    const product = this.productService.getProductByPublicId(productId);
    return product ? product.quantity : 0;
  }

  removeFromCart(publicId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const cartFromLocalStorage = this.getCartFromLocalStorage();
      const productExist = cartFromLocalStorage.find(
        (item) => item.publicId === publicId
      );
      if (productExist) {
        cartFromLocalStorage.splice(
          cartFromLocalStorage.indexOf(productExist),
          1
        );
        this.productService.updateProductQuantity(Number(publicId), productExist.quantity);
        this.saveCartToLocalStorage(cartFromLocalStorage);
      }
    }
  }

  getTotalPrice(): number {
    const cartItems = this.getCartItemsSnapshot();
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  getCartItems(): Observable<{ product: Product; quantity: number }[]> {
    return this.addedToCart$.pipe(
      map(items => items.map(item => {
        const product = this.productService.getProductByPublicId(Number(item.publicId));
        if (!product) {
          throw new Error(`Product with ID ${item.publicId} not found`);
        }
        return {
          product,
          quantity: item.quantity
        };
      }))
    );
  }

  getCartItemsSnapshot(): { product: Product; quantity: number }[] {
    return this.addedToCart$.getValue().map(item => {
      const product = this.productService.getProductByPublicId(Number(item.publicId));
      if (!product) {
        throw new Error(`Product with ID ${item.publicId} not found`);
      }
      return {
        product,
        quantity: item.quantity
      };
    });
  }

  clearCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.keyCartStorage);
      this.addedToCart$.next([]);
    }
  }
}