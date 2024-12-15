package com.megashop.service;

import com.megashop.entity.Cart;
import com.megashop.entity.CartItem;
import com.megashop.entity.Product;
import com.megashop.entity.User;
import com.megashop.repository.CartRepository;
import com.megashop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartForUser(User user) {
        Cart cart = cartRepository.findByUser(user);
        return cart != null ? cart.getItems() : List.of();
    }

    @Transactional
    public CartItem addToCart(User user, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart(user);
        }

        Optional<CartItem> existingCartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingCartItem.isPresent()) {
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartItem;
        } else {
            CartItem cartItem = new CartItem(product, quantity);
            cart.addItem(cartItem);
            cartRepository.save(cart);
            return cartItem;
        }
    }

    @Transactional
    public void updateCartItemQuantity(User user, Long productId, int quantity) {
        Cart cart = cartRepository.findByUser(user);
        if (cart != null) {
            Optional<CartItem> existingCartItem = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst();

            if (existingCartItem.isPresent()) {
                CartItem cartItem = existingCartItem.get();
                cartItem.setQuantity(quantity);
                cartRepository.save(cart);
            } else {
                throw new RuntimeException("Cart item not found");
            }
        } else {
            throw new RuntimeException("Cart not found");
        }
    }

    @Transactional
    public void removeFromCart(User user, Long productId) {
        Cart cart = cartRepository.findByUser(user);
        if (cart != null) {
            cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
            cartRepository.save(cart);
        }
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = cartRepository.findByUser(user);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }
}