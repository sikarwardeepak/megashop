import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import axios from 'axios';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  searchQuery: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    // this.route.queryParams.subscribe(params => {
    //   this.searchQuery = params['name'] || '';
    // });
  }

  checkLoginStatus(): void {
    // Replace this logic with your actual authentication service
    this.isLoggedIn = !!localStorage.getItem('authToken'); // Example: Check for token
  }

  async onSearch(event: any) {
    const searchQuery = event.target.value.toLowerCase().trim();
    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams: any = {};
    if (this.searchQuery) {
      queryParams.name = this.searchQuery;
    } else {
      queryParams.name = null; // Remove the query parameter if the search query is empty
    }
    this.router.navigate(['/products'], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
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