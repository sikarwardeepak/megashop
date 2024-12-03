import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';  // Import AppRoutingModule
import { appConfig } from './app/app.config';  // Assuming appConfig includes necessary configurations
import { routes } from './app/app.routes'; 

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,  // Include your existing appConfig providers
    provideRouter(routes)
    // AppRoutingModule  // Ensure AppRoutingModule is used for routing
  ]
})
  .catch((err) => console.error('Bootstrap error:', err));