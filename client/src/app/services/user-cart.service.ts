import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class UserCartService {
  private readonly apiUrl = 'http://localhost:8081/api/cart';
  private axiosInstance: AxiosInstance;
  
  private cartSubject$ = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject$.asObservable();

  private readonly localStorageKey = 'cartSnapshot';

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
  
  getRegisteredCart(): Observable<CartItem[]> {
    return from(
      this.axiosInstance
        .get<CartItem[]>(`${this.apiUrl}`)
        .then((response: AxiosResponse<CartItem[]>) => response.data)
    );
  }

  // Add an item to registered user's cart using axiosInstance
  addToRegisteredCart(item: { publicId: number; quantity: number }): Observable<CartItem> {
    return from(
      this.axiosInstance
        .post<CartItem>(`${this.apiUrl}/add`, item)
        .then((response: AxiosResponse<CartItem>) => {
          this.updateCartSnapshot([...this.cartSubject$.getValue(), response.data]);
          return response.data;
        })
    );
  }

  updateCartItemQuantity(publicId: number, quantity: number): Observable<void> {
    return from(
      this.axiosInstance
        .put<void>(`${this.apiUrl}/update`, { publicId, quantity })
        .then((response: AxiosResponse<void>) => {
          const updatedCart = this.cartSubject$.getValue().map(item =>
            item.product.id === publicId ? { ...item, quantity } : item
          );
          this.updateCartSnapshot(updatedCart);
          return response.data;
        })
    );
  }

  // Remove an item from registered user's cart using axiosInstance
  removeFromRegisteredCart(publicId: number): Observable<void> {
    return from(
      this.axiosInstance
        .delete<void>(`${this.apiUrl}/remove/${publicId}`)
        .then((response: AxiosResponse<void>) => {
          const updatedCart = this.cartSubject$.getValue().filter(item => item.product.id !== publicId);
          this.updateCartSnapshot(updatedCart);
          return response.data;
        })
    );
  }

  // Clear registered user's cart using axiosInstance
  clearRegisteredCart(): Observable<void> {
    return from(
      this.axiosInstance
        .delete<void>(`${this.apiUrl}/clear`)
        .then((response: AxiosResponse<void>) => {
          this.clearCartSnapshot();
          return response.data;
        })
    );
  }

  /**
   * Retrieves a snapshot of the registered user's cart from Local Storage.
   *
   * @returns An Observable of CartItemAdd array.
   */
  getRegisteredCartSnapshot(): Observable<CartItem[]> {
    return from(
      this.axiosInstance
        .get<CartItem[]>(`${this.apiUrl}`)
        .then((response: AxiosResponse<CartItem[]>) => {
          this.cartSubject$.next(response.data);
          return response.data;
        })
    ).pipe(
      catchError((error) => {
        console.error('Error fetching registered user cart:', error);
        return of([]);
      })
    );
  }

  /**
   * Saves the current cart as a snapshot to Local Storage.
   *
   * @param cartItems The current cart items to snapshot.
   */
  private saveCartSnapshot(cartItems: CartItem[]): void {
    try {
      const snapshot = JSON.stringify(cartItems);
      localStorage.setItem(this.localStorageKey, snapshot);
      this.cartSubject$.next(cartItems);
    } catch (error) {
      console.error('Error saving cart snapshot to Local Storage:', error);
    }
  }

  /**
   * Clears the cart snapshot from Local Storage.
   */
  clearCartSnapshot(): void {
    localStorage.removeItem(this.localStorageKey);
    this.cartSubject$.next([]);
  }

  /**
   * Updates the cart snapshot in Local Storage.
   *
   * @param cartItems The updated cart items.
   */
  private updateCartSnapshot(cartItems: CartItem[]): void {
    this.saveCartSnapshot(cartItems);
  }
}