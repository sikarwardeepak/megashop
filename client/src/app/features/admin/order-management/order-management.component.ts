import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../../../services/order.service';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './order-management.component.html',
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  statuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe((data) => (this.orders = data));
  }

  updateStatus(order: Order): void {
    this.orderService.updateOrderStatus(order.id, order.status).subscribe((updatedOrder) => {
      order.status = updatedOrder.status;
    });
  }
}