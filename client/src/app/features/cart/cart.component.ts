import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Product, ProductService } from '../../services/product.service';
import { CartItemAdd } from '../../models/cart.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItemAdd[] = [];
  private cartSubscription!: Subscription;

  constructor(
    private cartService: CartService, 
    private productService: ProductService,
    private router: Router) { }

    ngOnInit(): void {
      // Subscribe to the public Observable
      this.cartSubscription = this.cartService.addedToCart$.subscribe(
        (items) => {
          this.cartItems = items.map(item => ({
            publicId: item.product.id,
            quantity: item.quantity
          }));
        },
        (error) => {
          console.error('Error fetching cart items:', error);
        }
      );
    }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  increaseQuantity(publicId: number): void {
    this.cartService.addToCart(publicId, 'add');
  }

  decreaseQuantity(publicId: number): void {
    this.cartService.addToCart(publicId, 'remove');
  }

  removeFromCart(publicId: number): void {
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

  getProductByPublicId(publicId: number): Product | undefined {
    const productId = Number(publicId);
    return this.productService.getProductByPublicId(productId);
  }

  navigateToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}