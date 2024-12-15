import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users'; // Replace with your actual API URL
  private axiosInstance: AxiosInstance;

  constructor(private authService: AuthService) {
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add a request interceptor to include the Bearer token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.authService.getToken();
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

  getUserProfile(): Observable<any> {
    return from(this.axiosInstance.get('/profile').then((response: AxiosResponse) => response.data));
  }

  //implement getUserId() method
  getUserId(): Observable<any> {
    return from(this.axiosInstance.get('/profile/id').then((response: AxiosResponse) => response.data));
  }

  updateUserProfile(user: any): Observable<any> {
    return from(this.axiosInstance.put('/profile', user).then((response: AxiosResponse) => response.data));
  }
}