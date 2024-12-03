package com.megashop.controller;

import com.megashop.entity.Order;
import com.megashop.entity.User;
import com.megashop.service.OrderService;
import com.megashop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    // Get order history for the authenticated user
    @GetMapping("/history")
    public List<Order> getOrderHistory(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return orderService.getOrdersByUser(user);
    }

    // Get all orders (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Update order status (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody Order order) {
        return orderService.updateOrderStatus(id, order.getStatus());
    }
}
