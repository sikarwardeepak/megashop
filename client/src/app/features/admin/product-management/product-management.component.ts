import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../../services/product.service';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, CurrencyPipe, FormsModule],
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  isNewProduct = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((data) => (this.products = data));
  }

  selectProduct(product: Product): void {
    this.selectedProduct = { ...product };
    this.isNewProduct = false;
  }

  createNewProduct(): void {
    this.selectedProduct = { id: 0, name: '', price: 0 } as Product;
    this.isNewProduct = true;
  }

  saveProduct(): void {
    if (this.selectedProduct) {
      if (this.isNewProduct) {
        this.productService.createProduct(this.selectedProduct).subscribe(() => {
          this.loadProducts();
          this.selectedProduct = null;
        });
      } else {
        this.productService.updateProduct(this.selectedProduct.id, this.selectedProduct).subscribe(() => {
          this.loadProducts();
          this.selectedProduct = null;
        });
      }
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  cancel(): void {
    this.selectedProduct = null;
  }
}