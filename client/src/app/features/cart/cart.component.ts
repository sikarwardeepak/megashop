import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Product, ProductService } from '../../services/product.service';
import { CartItemAdd } from '../../models/cart.model';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItemAdd[] = [];
  private cartSubscription!: Subscription;

  constructor(private cartService: CartService, private productService: ProductService) { }

  ngOnInit(): void {
    // Subscribe to cart items observable
    this.cartSubscription = this.cartService.addedToCart.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  increaseQuantity(publicId: string): void {
    this.cartService.addToCart(publicId, 'add');
  }

  decreaseQuantity(publicId: string): void {
    this.cartService.addToCart(publicId, 'remove');
  }

  removeFromCart(publicId: string): void {
    this.cartService.removeFromCart(publicId);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    // Assuming you have a method to get product details by publicId
    return this.cartItems.reduce((total, item) => {
      const product = this.getProductByPublicId(item.publicId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  getProductByPublicId(publicId: string): Product | undefined {
    const productId = Number(publicId);
    return this.productService.getProductByPublicId(productId);
  }
}