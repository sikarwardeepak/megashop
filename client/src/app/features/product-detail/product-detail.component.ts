import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  productId!: number;
  product?: Product;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    // Retrieve the product ID from the route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id; // Convert id to number
        this.fetchProductDetails(this.productId);
      } else {
        this.isLoading = false;
        this.errorMessage = 'No product ID provided.';
      }
    });
  }

  fetchProductDetails(productId: number): void {
    this.productService.getProductById(productId).subscribe(
      (product) => {
        this.product = product;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Product not found.';
        this.isLoading = false;
      }
    );
  }
}