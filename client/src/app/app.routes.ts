import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { ProductListComponent } from './features/home/product-list/product-list.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { AdminPanelComponent } from './features/admin/admin-panel/admin-panel.component';
import { AuthGuard } from './core/auth/auth.guard'; // Import your AuthGuard
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';
import { CategoryManagementComponent } from './features/admin/category-management/category-management.component';
import { ProductManagementComponent } from './features/admin/product-management/product-management.component';
import { PaymentSuccessComponent } from './features/checkout/payment-success/payment-success.component';
import { PaymentFailComponent } from './features/checkout/payment-fail/payment-fail.component';
import { PaymentGuard } from './core/guards/payment.guard';

export const routes: Routes = [
  // { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [PaymentGuard] },
  { path: 'payment-fail', component: PaymentFailComponent, canActivate: [PaymentGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'manage-products', component: ProductManagementComponent },
      { path: 'manage-categories', component: CategoryManagementComponent },
      { path: 'manage-orders', component: OrderManagementComponent },
    ],
  },
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: 'products' }, // Fallback route
];