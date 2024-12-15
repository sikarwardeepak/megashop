package com.megashop.controller;

import com.megashop.entity.CartItem;
import com.megashop.entity.User;
import com.megashop.service.CartService;
import com.megashop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<CartItem> getRegisteredCart(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return cartService.getCartForUser(user);
    }

    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public CartItem addToRegisteredCart(@RequestBody Map<String, Object> itemData, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        Long productId = ((Number) itemData.get("publicId")).longValue();
        int quantity = (int) itemData.get("quantity");
        return cartService.addToCart(user, productId, quantity);
    }

    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public void updateCartItemQuantity(@RequestBody Map<String, Object> itemData, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        Long productId = ((Number) itemData.get("publicId")).longValue();
        int quantity = (int) itemData.get("quantity");
        cartService.updateCartItemQuantity(user, productId, quantity);
    }

    @DeleteMapping("/remove/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public void removeFromRegisteredCart(@PathVariable Long publicId, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        cartService.removeFromCart(user, publicId);
    }

    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public void clearRegisteredCart(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        cartService.clearCart(user);
    }
}