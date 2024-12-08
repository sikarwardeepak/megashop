// src/app/models/order-dto.model.ts
export interface OrderDTO {
    // user_id?: string; // Uncomment and define if needed
    email: string;
    totalAmount: number;
    orderDate: Date;
    status: string;
    items: any[]; // Replace 'any' with your actual item type/interface
    paymentSuccessful: boolean;
    paymentIntentId: string;
    address: string;
  }