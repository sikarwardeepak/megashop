import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrderService, Order } from '../../services/order.service';
import { StripeService } from '../../services/stripe.service';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { StripeElementsOptions, StripeCardElementOptions, StripeCardElement } from '@stripe/stripe-js';
import { PaymentGuard } from '../../core/guards/payment.guard';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  totalAmount: number = 0;
  stripePromise = loadStripe('pk_test_51QRsKZ4ZQljoeXBBMnkVrcmZM6MFdpe95fus1iShS6IegHIE4SeH5yAaChdQ5dGK04tP0BUFe1ONZ9FPCBRSByPi00os4Af35g'); // Replace with your Stripe publishable key
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private router: Router,
    private paymentGuard: PaymentGuard
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.totalAmount = this.cartService.getTotalPrice();
    });
  }

  ngAfterViewInit(): void {
    this.initializeStripe();
  }

  async initializeStripe() {
    this.stripe = await this.stripePromise;
    const elements = this.stripe!.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount('#card-element');
    console.log('Stripe Element mounted successfully.');
  }

  async checkout() {
    if (!this.stripe || !this.cardElement) {
      console.error('Stripe.js has not loaded properly.');
      return;
    }

    const { error, paymentMethod } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
    });

    if (error) {
      console.error('Error creating payment method:', error);
      return;
    }

    const session = await this.stripeService.createCheckoutSession(this.cartItems, this.totalAmount).toPromise();

    if (session && session.clientSecret) {
      const { error: confirmError, paymentIntent } = await this.stripe.confirmCardPayment(session.clientSecret, {
        payment_method: paymentMethod!.id,
      });

      if (confirmError) {
        console.error('Stripe checkout error:', confirmError);
        this.paymentGuard.setPaymentCompleted(true);
        this.router.navigate(['/payment-fail']);
      } else {
        this.createOrder(true, paymentIntent!.id); // Set paymentSuccessful to true
        this.paymentGuard.setPaymentCompleted(true);
        this.router.navigate(['/payment-success']);
      }
    }
  }

  createOrder(paymentSuccessful: boolean, paymentIntentId: string) {
    const order = {
      // user_id: '7', // Replace with the actual user ID
      totalAmount: this.totalAmount,
      orderDate: new Date(),
      status: 'Pending',
      items: this.cartItems,
      paymentSuccessful: paymentSuccessful,
      paymentIntentId: paymentIntentId
    };
    this.orderService.createOrder(order).subscribe(
      (response: Order) => {
        console.log('Order created successfully:', response);
      },
      (error: any) => {
        console.error('Error creating order:', error);
      }
    );
  }
}