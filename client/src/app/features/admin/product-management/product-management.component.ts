import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-product-management',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  newProduct: ProductRequest = { name: '', description: '', price: 0, quantity: 0, categoryName: '', imageUrl: '' };
  selectedProduct: ProductRequest | null = null;
  view: string = 'view';

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
      this.filteredProducts = data;
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  setView(view: string): void {
    this.view = view;
    if (view === 'create') {
      this.selectedProduct = null;
    }
  }

  saveProduct(): void {
    this.productService.createProduct(this.newProduct).subscribe(() => {
      this.loadProducts();
      this.setView('view');
    });
  }

  updateProduct(productRequest: ProductRequest): void {
    const product: Product = {
      id: productRequest.id ?? 0,
      name: productRequest.name,
      description: productRequest.description,
      price: productRequest.price,
      quantity: productRequest.quantity,
      category: { id: 0, name: productRequest.categoryName }, // Assuming category ID is not needed for update
      imageUrl: productRequest.imageUrl
    };
  
    productRequest.id = product.id;
    productRequest.name = product.name;
    productRequest.description = product.description;
    productRequest.price = product.price;
    productRequest.quantity = product.quantity;
    productRequest.categoryName = product.category.name;
    productRequest.imageUrl = product.imageUrl;

    this.productService.updateProduct(product.id!, productRequest).subscribe(() => {
      this.loadProducts();
      this.setView('view');
    });
  }

  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product.id).subscribe(() => {
      this.loadProducts();
    });
  }

  cancel(): void {
    this.setView('view');
  }

  selectProduct(product: Product): void {
    this.selectedProduct = { ...product, categoryName: product.category.name };
    this.setView('edit');
  }

  mapToProductRequest(product: Product): ProductRequest {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      categoryName: product.category.name,
      imageUrl: product.imageUrl
    };
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