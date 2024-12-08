import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../../../services/order.service';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  statuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
  selectedOrder: Order | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
      },
      (error: any) => {
        console.error('Error loading orders:', error);
      }
    );
  }

  resetStatus(order: Order): void {
    // Reset the order status to its original value
    const originalOrder = this.orders.find(o => o.id === order.id);
    if (originalOrder) {
      order.status = originalOrder.status;
    }
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  updateStatus(order: Order): void {
    this.orderService.updateOrderStatus(order.id, order.status).subscribe((updatedOrder) => {
      order.status = updatedOrder.status;
    });
  }
}