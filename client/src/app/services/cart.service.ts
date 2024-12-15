import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Cart, CartItemAdd, CartItem, StripeSession } from '../models/cart.model';
import { Product, ProductService } from './product.service';
import { AuthService } from '../core/auth/auth.service'; 
import { UserCartService } from './user-cart.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly guestCartKey = 'guestCart';
  private readonly registeredCartKey = 'registeredCart';

  private addedToCartSubject$ = new BehaviorSubject<Array<CartItem>>([]);
  public addedToCart$ = this.addedToCartSubject$.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productService: ProductService,
    private authService: AuthService, 
    private userCartService: UserCartService
  ) {
    this.loadInitialCart();

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.loadInitialCart();
    });
  }

  private loadInitialCart(): void {
    if (this.authService.isAuthenticated()) {
      // Load registered cart from backend
      this.userCartService.getRegisteredCartSnapshot().subscribe(
        (cart) => {
          this.addedToCartSubject$.next(cart);
        },
        (error) => {
          console.error('Failed to load registered cart:', error);
          this.addedToCartSubject$.next([]);
        }
      );
    } else {
      // Load guest cart from localStorage
      const cartFromLocalStorage = this.getCartFromLocalStorage(this.guestCartKey);
      this.addedToCartSubject$.next(cartFromLocalStorage);
    }
  }

  private getCartFromLocalStorage(key: string): CartItem[] {
    if (isPlatformBrowser(this.platformId)) {
      const cartData = localStorage.getItem(key);
      return cartData ? JSON.parse(cartData) as CartItem[] : [];
    } else {
      return [];
    }
  }

  addToCart(publicId: number, command: 'add' | 'remove'): void {
    if (isPlatformBrowser(this.platformId)) {
      let cartFromLocalStorage: CartItem[];

      if (this.authService.isAuthenticated()) {
        // Handle registered cart via backend
        this.userCartService.getRegisteredCartSnapshot().subscribe((cartItems) => {
          const existingCartItem = cartItems.find(item => item.product.id === publicId);
  
          if (existingCartItem) {
            // Check available quantity before updating
            const availableQuantity = this.productService.getProductByPublicId(publicId)?.quantity || 0;
            const updatedQuantity = command === 'add' ? existingCartItem.quantity + 1 : existingCartItem.quantity - 1;
  
            if (command === 'add' && availableQuantity < 1) {
              alert('No more stock available for this product.');
              return;
            }
  
            if (updatedQuantity < 0) {
              alert('Quantity cannot be less than zero.');
              return;
            }
  
            this.userCartService.updateCartItemQuantity(publicId, updatedQuantity).subscribe(
              () => {
                // Update the cart items by fetching the latest snapshot
                this.userCartService.getRegisteredCartSnapshot().subscribe((items) => {
                  this.addedToCartSubject$.next(items);
                });
                this.productService.updateProductQuantity(publicId, command === 'add' ? -1 : 1);
              },
              (error) => {
                console.error('Failed to update cart item quantity:', error);
              }
            );
          } else if (command === 'add') {
            // Check available quantity before adding new product
            const availableQuantity = this.productService.getProductByPublicId(publicId)?.quantity || 0;
  
            if (availableQuantity <= 0) {
              alert('Product is out of stock.');
              return;
            }
  
            // Add new product to the cart
            this.userCartService.addToRegisteredCart({ publicId, quantity: 1 }).subscribe(
              (cartItem: CartItem) => {
                // Update the cart items by fetching the latest snapshot
                this.userCartService.getRegisteredCartSnapshot().subscribe((items) => {
                  this.addedToCartSubject$.next(items);
                });
                this.productService.updateProductQuantity(publicId, -1);
              },
              (error) => {
                console.error('Failed to add to registered cart:', error);
              }
            );
          }
        });
      } else {
        // Handle guest cart via localStorage
        cartFromLocalStorage = this.getCartFromLocalStorage(this.guestCartKey);

        const product = this.productService.getProductByPublicId(publicId);
        if (!product) {
          console.error(`Product with ID ${publicId} not found.`);
          return;
        }

        let cartItem = cartFromLocalStorage.find(item => item.product.id === publicId);

        if (cartItem) {
          if (command === 'add') {
            if (this.getProductQuantity(publicId) > 0) {
              cartItem.quantity++;
              this.productService.updateProductQuantity(publicId, -1);
            } else {
              alert('No more stock available for this product.');
            }
          } else if (command === 'remove') {
            cartItem.quantity--;
            if (cartItem.quantity < 1) {
              this.removeFromCart(publicId);
              return;
            } else {
              this.productService.updateProductQuantity(publicId, 1);
            }
          }
        } else {
          if (command === 'add') {
            if (this.getProductQuantity(publicId) > 0) {
              cartItem = { id: null, product, quantity: 1 };
              cartFromLocalStorage.push(cartItem);
              this.productService.updateProductQuantity(publicId, -1);
            } else {
              alert('Product is out of stock.');
            }
          }
        }
        this.saveCartToLocalStorage(this.guestCartKey, cartFromLocalStorage);
      }
    }
  }

private saveCartToLocalStorage(key: string, cart: CartItem[]): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem(key, JSON.stringify(cart));
    this.addedToCartSubject$.next(cart);
  }
}

  private getProductQuantity(publicId: number): number {
    const productId = Number(publicId);
    const product = this.productService.getProductByPublicId(productId);
    return product ? product.quantity : 0;
  }

  removeFromCart(publicId: number): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.isAuthenticated()) {
        // Remove from registered cart via backend
        this.userCartService.removeFromRegisteredCart(publicId).subscribe(
          () => {
            // Update the cart items by fetching the latest snapshot
            this.userCartService.getRegisteredCartSnapshot().subscribe((items) => {
              this.addedToCartSubject$.next(items);
            });
            this.productService.updateProductQuantity(publicId, 1);
          },
          (error) => {
            console.error('Failed to remove from registered cart:', error);
          }
        );
      } else {
        // Remove from guest cart in localStorage
        const cartFromLocalStorage = this.getCartFromLocalStorage(this.guestCartKey);
        const updatedCart = cartFromLocalStorage.filter(item => item.product.id !== publicId);
        this.saveCartToLocalStorage(this.guestCartKey, updatedCart);
        this.productService.updateProductQuantity(publicId, 1);
      }
    }
  }

  getTotalPrice(): number {
    let totalPrice = 0;
    this.getCartItemsSnapshot().subscribe(cartItems => {
      totalPrice = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    });
    return totalPrice;
  }

  getCartItems(): Observable<CartItem[]> {
    if (this.authService.isAuthenticated()) {
      // For registered users, fetch cart from backend via userCartService
      return this.userCartService.getRegisteredCartSnapshot();
    } else {
      // For guests, transform CartItemAdd to CartItem
      const cartItemsData = this.addedToCartSubject$.getValue() as CartItem[];
      const cartItems: CartItem[] = cartItemsData.map((item) => {
        const product = this.productService.getProductByPublicId(item.product.id);
        if (!product) {
          throw new Error(`Product with ID ${item.product.id} not found`);
        }
        return {
          id: null, // No ID for guest cart items
          product,
          quantity: item.quantity,
        };
      });
      return of(cartItems);
    }
  }

  getCartItemsSnapshot(): Observable<CartItem[]> {
    if (this.authService.isAuthenticated()) {
      // For registered users, fetch cart from backend via userCartService
      return this.userCartService.getRegisteredCartSnapshot();
    } else {
      // For guests, transform CartItemAdd to CartItem
      const cartItemsData = this.addedToCartSubject$.getValue() as CartItem[];
      const cartItems: CartItem[] = cartItemsData.map((item) => {
        const product = this.productService.getProductByPublicId(item.product.id);
        if (!product) {
          throw new Error(`Product with ID ${item.product.id} not found`);
        }
        return {
          id: null, // No ID for guest cart items
          product,
          quantity: item.quantity,
        };
      });
      return of(cartItems);
    }
  }

  clearCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.isAuthenticated()) {
        // Clear registered cart via backend
        this.userCartService.clearRegisteredCart().subscribe(
          () => {
            this.addedToCartSubject$.next([]);
          },
          (error) => {
            console.error('Failed to clear registered cart:', error);
          }
        );
      } else {
        // Clear guest cart in localStorage
        localStorage.removeItem(this.guestCartKey);
        this.addedToCartSubject$.next([]);
      }
    }
  }
  
}