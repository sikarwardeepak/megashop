import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Observable, from } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: Category;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8081/api/products';
  private categoryUrl = 'http://localhost:8081/api/categories';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create();

    // Add a request interceptor to include the token in the headers
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

  getProducts(): Observable<Product[]> {
    return from(this.axiosInstance.get<Product[]>(`${this.apiUrl}/all`).then(response => response.data));
  }

  createProduct(product: ProductRequest): Observable<Product> {
    return from(this.axiosInstance.post<Product>(`${this.apiUrl}/create`, product).then(response => response.data));
  }

  updateProduct(id: number, product: ProductRequest): Observable<Product> {
    return from(this.axiosInstance.put<Product>(`${this.apiUrl}/${id}`, product).then(response => response.data));
  }

  deleteProduct(id: number): Observable<void> {
    return from(this.axiosInstance.delete<void>(`${this.apiUrl}/${id}`).then(response => response.data));
  }

  getProductsByFilters(params: any): Observable<Product[]> {
    return from(this.axiosInstance.get<Product[]>(`${this.apiUrl}/search`, { params }).then(response => response.data));
  }
  
  getCategories(): Observable<Category[]> {
    return from(this.axiosInstance.get<Category[]>(this.categoryUrl).then(response => response.data));
  }
}

interface ProductRequest {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryName: string;
  imageUrl: string;
}