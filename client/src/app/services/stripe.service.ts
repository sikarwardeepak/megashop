import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = 'http://localhost:8081/api/stripe';
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

  createCheckoutSession(cartItems: any[], totalAmount: number): Observable<any> {
    return from(
      this.axiosInstance.post<any>(`${this.apiUrl}/create-checkout-session`, { cartItems, totalAmount })
        .then((response: AxiosResponse<any>) => response.data)
    );
  }
}