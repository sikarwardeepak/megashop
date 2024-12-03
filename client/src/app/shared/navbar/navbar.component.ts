import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    // Replace this logic with your actual authentication service
    this.isLoggedIn = !!localStorage.getItem('authToken'); // Example: Check for token
  }

  async onSearch(event: any) {
    const query = event.target.value;
    if (query.length > 2) { // Start searching after 3 characters
      try {
        const response = await axios.get(`/api/search?q=${query}`);
        const products = response.data;
        // Handle the search results, e.g., navigate to a search results page
        this.router.navigate(['/search'], { queryParams: { q: query } });
      } catch (error) {
        console.error('Error fetching search results', error);
      }
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      this.cdr.detectChanges(); // Trigger change detection
    });
  }
}