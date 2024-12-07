import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { CategoryService, Category } from '../../../services/category.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoubleSliderComponent } from '../../../shared/double-slider/double-slider.component';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule, DoubleSliderComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  // Slider properties
  maxPriceDisplay: string = '1000+';

  filters: any = {
    name: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.filters.name = params['name'] || '';
      this.filters.category = params['category'] || '';
      this.filters.minPrice = params['minPrice'] !== undefined ? +params['minPrice'] : 0;
      this.filters.maxPrice = params['maxPrice'] !== undefined ? +params['maxPrice'] : 1000;

      this.updateMaxPriceDisplay();
      this.applyFilters();
    });
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      this.updateProductQuantitiesFromCart();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  updateProductQuantitiesFromCart(): void {
    const cartItems = this.cartService.getCartItemsSnapshot();
    this.products.forEach(product => {
      const cartItem = cartItems.find((item: { product: Product; quantity: number }) => item.product.id === product.id);
      if (cartItem) {
        product.quantity -= cartItem.quantity;
      }
    });
  }

  onRangeChange(range: number[]): void {
    this.filters.minPrice = range[0];
    this.filters.maxPrice = range[1];
    this.updateMaxPriceDisplay();
  }

  updateMaxPriceDisplay(): void {
    if (this.filters.maxPrice >= 1000) {
      this.maxPriceDisplay = '1000+';
    } else {
      this.maxPriceDisplay = this.filters.maxPrice.toString();
    }
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
      const selectedCategory = this.categories.find(
        (cat) => cat.name === this.filters.category
      );
      if (selectedCategory) {
        params.categoryId = selectedCategory.id;
      }
    }

    params.minPrice = this.filters.minPrice;

    if (this.filters.maxPrice < 1000) {
      params.maxPrice = this.filters.maxPrice;
    }

    this.productService.getProductsByFilters(params).subscribe((data) => {
      this.products = data;
      this.updateProductQuantitiesFromCart();
    });

    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams: any = {};

    queryParams.name = this.filters.name || null;
    queryParams.category = this.filters.category || null;
    queryParams.minPrice = this.filters.minPrice || null;
    queryParams.maxPrice = this.filters.maxPrice < 1000 ? this.filters.maxPrice : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  addToCart(product: Product): void {
    if (product.quantity > 0) {
      this.cartService.addToCart(product.id.toString(), 'add');
      product.quantity--;
      console.log('Product added to cart:', product);
    } else {
      alert('Product is out of stock.');
    }
  }

  getProductByPublicId(publicId: Number): Product | undefined {
    const productId = Number(publicId);
    return this.productService.getProductByPublicId(productId);
  }
}