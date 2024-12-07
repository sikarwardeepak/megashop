import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private keyProductStorage = 'products';

  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

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

    this.loadProducts();
  }

  private loadProducts(): void {
    const savedProducts = localStorage.getItem(this.keyProductStorage);
    if (savedProducts) {
      const products = JSON.parse(savedProducts) as Product[];
      this.productsSubject.next(products);
    } else {
      this.getProductsFromServer().subscribe((products) => {
        this.productsSubject.next(products);
        localStorage.setItem(this.keyProductStorage, JSON.stringify(products));
      });
    }
  }

  updateProductQuantity(productId: number, quantityChange: number): number {
    const products = this.productsSubject.getValue();
    const index = products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      const product = products[index];
      const updatedQuantity = product.quantity + quantityChange;
      product.quantity = Math.max(0, updatedQuantity);
      products[index] = product;
      this.productsSubject.next(products);
      localStorage.setItem(this.keyProductStorage, JSON.stringify(products));
      return product.quantity; // Return updated quantity
    }
    return 0; // Return 0 if product not found
  }

  private getProductsFromServer(): Observable<Product[]> {
    return from(
      this.axiosInstance
        .get<Product[]>(`${this.apiUrl}/all`)
        .then((response) => response.data)
    );
  }

  getProductByPublicId(publicId: number): Product | undefined {
    return this.productsSubject.getValue().find((product) => product.id === publicId);
  }

  getProducts(): Observable<Product[]> {
    return from(this.axiosInstance.get<Product[]>(`${this.apiUrl}/all`).then(response => response.data));
  }

  getProductById(id: number): Observable<Product> {
    return from(this.axiosInstance.get<Product>(`${this.apiUrl}/${id}`).then(response => response.data));
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