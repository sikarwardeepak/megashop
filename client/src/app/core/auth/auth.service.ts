import { Injectable } from '@angular/core';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/users'; // Replace with your backend API URL

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  constructor() {}

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const payload = this.parseJwt(token);
      return payload.role === 'ADMIN' || payload.role === 'ROLE_ADMIN';
    }
    return false;
  }

  private parseJwt(token: string): any {
    return jwtDecode(token);
  }

  // Login method
  async login(credentials: { username: string; password: string }): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/login`, credentials);
      return response.data; // Ensure the response contains the token
    } catch (error) {
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const payload = {
      currentPassword: currentPassword,
      newPassword: newPassword
    };
    try {
      const token = this.getToken();
      const headers: { [key: string]: string } = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.post(`${this.apiUrl}/changePassword`, payload, {
        headers: headers
      });
      return response.data; // Return response data
    } catch (error) {
      throw error;
    }
  }

  // Register method
  async register(user: { username: string; password: string }): Promise<any> {
    try {
      // Automatically add the role "USER"
      const userWithRole = { ...user, role: 'USER' };
      const response = await axios.post(`${this.apiUrl}/register`, userWithRole);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Save JWT token to local storage
  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true);
  }

  // Get saved JWT token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated (i.e., has a token)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }
}