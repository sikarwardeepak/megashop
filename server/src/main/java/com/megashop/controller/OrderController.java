package com.megashop.controller;

import com.megashop.entity.Order;
import com.megashop.entity.User;
import com.megashop.service.OrderService;
import com.megashop.service.UserService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.megashop.entity.CartItem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Order createOrder(@RequestBody Map<String, Object> orderData, Authentication authentication) throws StripeException {
        String paymentIntentId = (String) orderData.get("paymentIntentId");
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new IllegalArgumentException("Payment not successful. Cannot create order.");
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username);

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(((Number) orderData.get("totalAmount")).doubleValue()); // Convert to Double
        order.setOrderDate(LocalDateTime.now());
        order.setAddress(orderData.get("address").toString());
        order.setEmail(orderData.get("email").toString());
        order.setStatus((String) orderData.get("status"));
        order.setPaymentSuccessful((Boolean) orderData.get("paymentSuccessful"));
        return orderService.saveOrder(order);
    }

    @GetMapping("/cart")
    @PreAuthorize("isAuthenticated()")
    public List<CartItem> getRegisteredCart(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return orderService.getCartForUser(user);
    }

    @PostMapping("/cart/add")
    @PreAuthorize("isAuthenticated()")
    public CartItem addToRegisteredCart(@RequestBody Map<String, Object> itemData, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        Long itemId = ((Number) itemData.get("publicId")).longValue();
        int quantity = (int) itemData.get("quantity");

        // Check if the item already exists in the cart
        CartItem existingCartItem = orderService.findCartItemByUserAndProduct(user, itemId);
        if (existingCartItem != null) {
            // Update the quantity if the item already exists
            existingCartItem.setQuantity(existingCartItem.getQuantity() + quantity);
            return orderService.saveCartItem(existingCartItem);
        } else {
            // Add new item to the cart
            return orderService.addToCart(user, itemId, quantity);
        }
    }

    @PutMapping("/cart/update")
    @PreAuthorize("isAuthenticated()")
    public CartItem updateCartItemQuantity(@RequestBody Map<String, Object> itemData, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        Long itemId = ((Number) itemData.get("publicId")).longValue();
        int quantity = (int) itemData.get("quantity");

        CartItem cartItem = orderService.findCartItemByUserAndProduct(user, itemId);
        if (cartItem != null) {
            cartItem.setQuantity(quantity);
            return orderService.saveCartItem(cartItem);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
        }
    }

    @DeleteMapping("/cart/remove/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public List<CartItem> removeFromRegisteredCart(@PathVariable String publicId, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return orderService.removeFromCart(user, publicId);
    }

    @DeleteMapping("/cart/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> clearRegisteredCart(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        orderService.clearCart(user);
        return ResponseEntity.ok().build();
    }
}
