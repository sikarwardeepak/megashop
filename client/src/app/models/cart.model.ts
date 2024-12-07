export interface CartItemAdd {
    publicId: string;
    quantity: number;
  }
  
  export interface Cart {
    products: Array<CartItemAdd>;
  }
  
  export interface StripeSession {
    id: string;
    url: string;
  }