import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrderService, Order } from '../../services/order.service';
import { StripeService } from '../../services/stripe.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { StripeElementsOptions, StripeCardElementOptions, StripeCardElement } from '@stripe/stripe-js';
import { PaymentGuard } from '../../core/guards/payment.guard';
import { OrderDTO } from '../../models/order-dto.model';
import { environment } from '../../../environments/environment';
import { GoogleMapsModule } from '@angular/google-maps';
// declare var google: any;

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe, GoogleMapsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  totalAmount: number = 0;
  stripePromise = loadStripe(environment.stripePublishableKey); // Replace with your Stripe publishable key
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  checkoutForm: FormGroup;
  isMapsLoaded: boolean = false;
  mapsLoadError: boolean = false;

  @ViewChild('addressInput', { static: false }) addressInput!: ElementRef<HTMLInputElement>;

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map: google.maps.Map | undefined;
  marker: google.maps.Marker | undefined;
  currentLocation: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  markerPosition: { lat: number; lng: number } | undefined;
  
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private router: Router,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private paymentGuard: PaymentGuard,
  ) {
    this.checkoutForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      // Add other form controls as needed
    });
  }

  async ngOnInit(): Promise<void> {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.totalAmount = this.cartService.getTotalPrice();
    });
  }

  ngAfterViewInit(): void {
    this.initializeStripe();
    try {
      this.isMapsLoaded = true;
      this.initAutocomplete();
    } catch (error) {
      this.mapsLoadError = true;
      console.error('Error loading Google Maps script:', error);
    }
  }

  async initializeStripe() {
    this.stripe = await this.stripePromise;
    const elements = this.stripe!.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount('#card-element');
    console.log('Stripe Element mounted successfully.');
  }

  initAutocomplete() {
    if (!this.addressInput) {
      console.error('Address input element not found.');
      return;
    }

    console.log('Initializing Places Autocomplete...');
    const autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      {
        types: ['address'],
        componentRestrictions: { country: ['us', 'ca', 'in'] }, // Adjust as needed
      }
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = autocomplete.getPlace();

        if (!place.geometry) {
          // User did not select a prediction; reset address field
          this.checkoutForm.get('address')?.setValue('');
          console.warn('No geometry found for the selected place.');
          return;
        }

        // Update form with the selected address
        const address = place.formatted_address || '';
        this.checkoutForm.patchValue({ address });
        console.log('Address updated via autocomplete:', address);

        if (place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          this.currentLocation = { lat, lng };
          this.markerPosition = { lat, lng };
          console.log('Map center updated:', this.currentLocation);
        }
      });
    });
    console.log('Places Autocomplete initialized.');
  }

  /**
   * Event handler for marker drag end.
   * Updates the address field based on the new marker position.
   */

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.currentLocation = { lat: 37.7749, lng: -122.4194 };
      this.markerPosition = { lat, lng };
      console.log('Marker dragged to:', this.currentLocation);
      this.updateAddress(lat, lng);
    }
  }

  /**
   * Reverse geocodes the provided latitude and longitude to get the formatted address.
   * @param lat Latitude
   * @param lng Longitude
   */
  updateAddress(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        this.ngZone.run(() => {
          this.checkoutForm.patchValue({ address: results[0].formatted_address });
          console.log('Address updated via geocoding:', results[0].formatted_address);
        });
      } else {
        console.warn('Geocoder failed due to:', status);
      }
    });
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
      email: this.checkoutForm.get('email')?.value,
      address: this.checkoutForm.get('address')?.value,
      paymentSuccessful: paymentSuccessful,
      paymentIntentId: paymentIntentId,
      // address: address
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