import {Product} from './product.model';

  export interface CartItemAdd {
    publicId: number;
    quantity: number;
  }

  export interface CartItem {
    id: number | null;
    product: Product;
    quantity: number;
  }
  
  export interface Cart {
    products: Array<CartItemAdd>;
  }
  
  export interface StripeSession {
    id: string;
    url: string;
  }