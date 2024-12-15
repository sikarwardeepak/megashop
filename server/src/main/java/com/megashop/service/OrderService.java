package com.megashop.service;

import com.megashop.entity.Cart;
import com.megashop.entity.CartItem;
import com.megashop.entity.Order;
import com.megashop.entity.User;
import com.megashop.entity.Product;
import com.megashop.repository.CartRepository;
import com.megashop.repository.OrderRepository;
import com.megashop.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    public List<CartItem> getCartForUser(User user) {
        // Fetch the cart items from the database for the user
        Cart cart = cartRepository.findByUser(user);
        if (cart != null) {
            return cart.getItems().stream()
                .map(item -> {
                    CartItem cartItem = new CartItem();
                    cartItem.setProduct(item.getProduct());
                    cartItem.setQuantity(item.getQuantity());
                    return cartItem;
                })
                .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    @Transactional
    public CartItem addToCart(User user, Long publicId, int quantity) {
        // Fetch the product
        Product product = productRepository.findById(publicId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Fetch or create the user's cart
        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart(user);
        }

        // Create a new CartItem
        CartItem cartItem = new CartItem(product, quantity);
        cart.addItem(cartItem);

        // Save the cart (cascade will save CartItem)
        cartRepository.save(cart);

        // After saving, CartItem's ID should be generated
        return cartItem;
    }

    public List<CartItem> removeFromCart(User user, String publicId) {
        Cart cart = cartRepository.findByUser(user);
        if (cart != null) {
            cart.getItems().removeIf(item -> item.getProduct().getId().equals(Long.valueOf(publicId)));
            cartRepository.save(cart);
        }
        return getCartForUser(user);
    }

    public void clearCart(User user) {
        Cart cart = cartRepository.findByUser(user);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }
    
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}