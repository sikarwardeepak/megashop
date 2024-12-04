import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Observable, from } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:8081/api/categories';
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

  getCategories(): Observable<Category[]> {
    return from(this.axiosInstance.get<Category[]>(this.apiUrl).then(response => response.data));
  }

  createCategory(category: Category): Observable<Category> {
    return from(this.axiosInstance.post<Category>(this.apiUrl, category).then(response => response.data));
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return from(this.axiosInstance.put<Category>(`${this.apiUrl}/${id}`, category).then(response => response.data));
  }

  deleteCategory(id: number): Observable<void> {
    return from(this.axiosInstance.delete<void>(`${this.apiUrl}/${id}`).then(response => response.data));
  }
}