import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../services/order.service';
import { CurrencyPipe, CommonModule, DatePipe } from '@angular/common';
@Component({
  selector: 'app-order-history',
  imports: [CurrencyPipe, CommonModule, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  
  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.orderService.getOrderHistory().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
      },
      (error: any) => {
        console.error('Error loading order history:', error);
      }
    );
  }

  onRowClick(order: Order): void {
    if (this.selectedOrder && this.selectedOrder.id === order.id) {
      // Deselect if the same row is clicked
      this.selectedOrder = null;
    } else {
      this.selectedOrder = order;
    }
  }
}