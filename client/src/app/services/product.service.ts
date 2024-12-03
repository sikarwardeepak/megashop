import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Category;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8081/api/products';

  constructor() {}

  getProducts(): Observable<Product[]> {
    return from(axios.get<Product[]>(`${this.apiUrl}`).then(response => response.data));
  }

  getProduct(id: number): Observable<Product> {
    return from(axios.get<Product>(`${this.apiUrl}/${id}`).then(response => response.data));
  }

  createProduct(product: Product): Observable<Product> {
    return from(axios.post<Product>(`${this.apiUrl}`, product).then(response => response.data));
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return from(axios.put<Product>(`${this.apiUrl}/${id}`, product).then(response => response.data));
  }

  deleteProduct(id: number): Observable<void> {
    return from(axios.delete<void>(`${this.apiUrl}/${id}`).then(response => response.data));
  }

  getProductsByFilters(categoryId?: number, minPrice?: number, maxPrice?: number): Observable<Product[]> {
    let params = new URLSearchParams();
    if (categoryId) {
      params.append('categoryId', categoryId.toString());
    }
    if (minPrice) {
      params.append('minPrice', minPrice.toString());
    }
    if (maxPrice) {
      params.append('maxPrice', maxPrice.toString());
    }
    return from(axios.get<Product[]>(`${this.apiUrl}/filter`, { params }).then(response => response.data));
  }
}