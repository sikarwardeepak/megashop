import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  welcomeMessage: string = 'Welcome to Our E-Commerce Store!';
  featuredProducts: { name: string; description: string; price: number; image: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    // Mock data for demonstration; replace with API call or dynamic data
    this.featuredProducts = [
      {
        name: 'Smartphone',
        description: 'Latest model with advanced features.',
        price: 299.99,
        image: 'assets/images/smartphone.jpg',
      },
      {
        name: 'Laptop',
        description: 'High-performance laptop for professionals.',
        price: 799.99,
        image: 'assets/images/laptop.jpg',
      },
      {
        name: 'Headphones',
        description: 'Noise-cancelling headphones with superior sound quality.',
        price: 199.99,
        image: 'assets/images/headphones.jpg',
      },
    ];
  }
}