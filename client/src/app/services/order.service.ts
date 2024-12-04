import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, from } from 'rxjs';

export interface Order {
  id: number;
  user: any;
  totalAmount: number;
  orderDate: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:8081/api/orders';

  constructor() {}

  getOrders(): Observable<Order[]> {
    return from(axios.get<Order[]>(`${this.apiUrl}/all`).then(response => response.data));
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return from(axios.put<Order>(`${this.apiUrl}/${id}`, { status }).then(response => response.data));
  }
}