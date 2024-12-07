import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PaymentGuard implements CanActivate {

  private paymentCompleted = false;

  constructor(private router: Router) {}

  setPaymentCompleted(completed: boolean) {
    this.paymentCompleted = completed;
  }

  canActivate(): boolean {
    if (this.paymentCompleted) {
      return true;
    } else {
      this.router.navigate(['/checkout']);
      return false;
    }
  }
}