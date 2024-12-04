import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { Category, CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filters: any = {
    name: '',
    category: '',
    minPrice: null,
    maxPrice: null
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filters.name = params['name'] || '';
      this.filters.category = params['category'] || '';
      this.filters.minPrice = params['minPrice'] || null;
      this.filters.maxPrice = params['maxPrice'] || null;
      this.applyFilters();
    });
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  onSearch(event: any): void {
    this.filters.name = event.target.value.toLowerCase();
    this.updateUrl();
    this.applyFilters();
  }

  applyFilters(): void {
    const params: any = {};
    if (this.filters.name) {
      params.name = this.filters.name;
    }
    if (this.filters.category) {
      const selectedCategory = this.categories.find(cat => cat.name === this.filters.category);
      if (selectedCategory) {
        params.categoryId = selectedCategory.id;
      }
    }
    if (this.filters.minPrice !== null) {
      params.minPrice = this.filters.minPrice;
    }
    if (this.filters.maxPrice !== null) {
      params.maxPrice = this.filters.maxPrice;
    }
    this.productService.getProductsByFilters(params).subscribe((data) => {
      this.products = data;
    });
    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams: any = {};
    if (this.filters.name) {
      queryParams.name = this.filters.name;
    }
    if (this.filters.category) {
      queryParams.category = this.filters.category;
    }
    if (this.filters.minPrice !== null) {
      queryParams.minPrice = this.filters.minPrice;
    }
    if (this.filters.maxPrice !== null) {
      queryParams.maxPrice = this.filters.maxPrice;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  addToCart(product: Product): void {
    // Implement add to cart logic here
    console.log('Product added to cart:', product);
  }
}