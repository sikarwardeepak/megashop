import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Import other standalone components and necessary modules
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { ProductListComponent } from './features/home/product-list/product-list.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { AdminPanelComponent } from './features/admin/admin-panel/admin-panel.component';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { DoubleSliderComponent } from './shared/double-slider/double-slider.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CategoryManagementComponent } from './features/admin/category-management/category-management.component';
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { SettingsComponent } from './features/settings/settings.component';

@NgModule({
  declarations: [
    // No need to declare AppComponent here, as it's standalone
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    ReactiveFormsModule,
    HttpClientModule,
    GoogleMapsModule,
    NavbarComponent,
    HomeComponent,
    AboutComponent,
    DoubleSliderComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    AdminPanelComponent,
    LoginComponent,
    RegisterComponent,
    CategoryManagementComponent,
    OrderManagementComponent,
    ProductDetailComponent,
    SettingsComponent
  ],
  providers: [],
  // No need to bootstrap AppComponent here, since it's handled in main.ts
})
export class AppModule { }