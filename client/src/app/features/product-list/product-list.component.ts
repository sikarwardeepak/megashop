import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product, Category } from '../../services/product.service';
import { NgModel, FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  categoryName: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  filterProducts(): void {
    this.productService.getProductsByFilters(this.categoryName ?? undefined, this.minPrice ?? undefined, this.maxPrice ?? undefined).subscribe((data) => {
      this.products = data;
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }
}