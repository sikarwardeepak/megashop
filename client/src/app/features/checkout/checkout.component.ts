import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrderService, Order } from '../../services/order.service';
import { UserService} from '../../services/user.service';
import { User } from '../../models/user.model';
import { StripeService } from '../../services/stripe.service';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { StripeElementsOptions, StripeCardElementOptions, StripeCardElement } from '@stripe/stripe-js';
import { PaymentGuard } from '../../core/guards/payment.guard';
import { OrderDTO } from '../../models/order-dto.model';
import { environment } from '../../../environments/environment';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
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

  @ViewChild(GoogleMap, { static: false }) googleMap!: GoogleMap;
  @ViewChild('addressInput', { static: false }) addressInput!: ElementRef<HTMLInputElement>;
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  
  map: google.maps.Map | undefined;
  currentLocation: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  mapOptions: google.maps.MapOptions = {
    center: this.currentLocation,
    zoom: 12,
  };
  advancedMarker: google.maps.marker.AdvancedMarkerElement | null = null;
  
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private userService: UserService,
    private authService: AuthService,
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
    if (this.authService.isAuthenticated()) {
      this.prefillUserAddress();
    }
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

  prefillUserAddress(): void {
    this.userService.getUserProfile().subscribe((user: User | null) => {
      if (user) {
        this.checkoutForm.patchValue({
          email: user.email || '',
          address: user.address || ''
        });
      }
    });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.currentLocation = { lat, lng };
          this.updateAdvancedMarker(lat, lng);
          this.updateAddress(lat, lng);
        },
        error => {
          console.warn('Geolocation is not available or permission denied.', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  }

  initAutocomplete() {
    const map = this.googleMap.googleMap;
  
    if (!map) {
      console.error('Google Map instance is not available.');
      return;
    }

    // Optional: Set additional map options if needed
    map.setOptions({
      mapId: '587cbd2e1f1d1b41', // Ensure this matches the Map ID in index.html
    });

    this.updateAdvancedMarker(this.currentLocation.lat, this.currentLocation.lng);

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
          this.updateAdvancedMarker(lat, lng);
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

  updateAdvancedMarker(lat: number, lng: number): void {
    const map = this.googleMap.googleMap; // Access the underlying google.maps.Map instance

    if (!map) {
      console.error('Google Map instance is not available.');
      return;
    }

    // Remove existing marker if any
    if (this.advancedMarker) {
      this.advancedMarker.map = null;
    }

    // Create a new AdvancedMarkerElement
    this.advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      position: new google.maps.LatLng(lat, lng),
      map: map,
      gmpDraggable: true,
      title: 'Drag me!',
      
      // Additional customization options can be added here
    });

    // Add event listener for drag end
    this.advancedMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      const newPosition = this.advancedMarker!.position;
      if (newPosition) {
        const updatedLat = typeof newPosition.lat === 'function' ? newPosition.lat() : newPosition.lat;
        const updatedLng = typeof newPosition.lng === 'function' ? newPosition.lng() : newPosition.lng;
        this.currentLocation = { lat: updatedLat, lng: updatedLng };
        console.log('AdvancedMarker dragged to:', this.currentLocation);
        this.updateAddress(updatedLat, updatedLng);
      }
    });
  }

  moveMarkerToCenter(): void {
    const map = this.googleMap.googleMap;

    if (!map) {
      console.error('Google Map instance is not available.');
      return;
    }

    const center = map.getCenter();
    if (center) {
      const lat = center.lat();
      const lng = center.lng();
      console.log('Moving marker to map center:', { lat, lng });
      this.updateAdvancedMarker(lat, lng);
      this.updateAddress(lat, lng);
    }
  }

  useSavedAddress(): void {
    this.userService.getUserProfile().subscribe(
      (user: User | null) => {
        if (user && user.address) {
          this.checkoutForm.patchValue({ address: user.address });

          // Geocode the saved address to get latitude and longitude
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: user.address }, (results, status) => {
            if (status === 'OK' && results && results[0].geometry) {
              const location = results[0].geometry.location;
              this.currentLocation = { lat: location.lat(), lng: location.lng() };
              this.updateAdvancedMarker(this.currentLocation.lat, this.currentLocation.lng);
            } else {
              console.error('Geocoding failed:', status);
            }
          });
        } else {
          console.warn('No saved address found for the user.');
        }
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  /**
   * Uses the browser's geolocation to set the current location, update the map marker, and fill the address field.
   */
  useCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.currentLocation = { lat, lng };
          this.updateAdvancedMarker(lat, lng);
          this.updateAddress(lat, lng);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
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