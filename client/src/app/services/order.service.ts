import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { CartItem } from '../models/cart.model';

export interface Order {
  id: number;
  email: string;
  totalAmount: number;
  orderDate: Date;
  status: string;
  items: any[]; // Replace 'any' with your actual item type/interface
  user: User;
  paymentSuccessful: boolean;
  paymentIntentId: string;
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8081/api/orders';
  private axiosInstance: AxiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create();

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  createOrder(order: any): Observable<Order> {
    return from(this.axiosInstance.post<Order>(`${this.apiUrl}`, order).then((response: AxiosResponse<Order>) => response.data));
  }

  getOrders(): Observable<Order[]> {
    return from(this.axiosInstance.get<Order[]>(`${this.apiUrl}/all`).then((response: AxiosResponse<Order[]>) => response.data));
  }

  getOrderHistory(): Observable<Order[]> {
    return from(
      this.axiosInstance
        .get<Order[]>(`${this.apiUrl}/history`)
        .then((response: AxiosResponse<Order[]>) => response.data)
    );
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return from(this.axiosInstance.put<Order>(`${this.apiUrl}/${id}`, { status }).then((response: AxiosResponse<Order>) => response.data));
  }
}