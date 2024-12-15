package com.megashop.entity;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.megashop.entity.CartItem;

@Entity
@Table(name = "carts") // Ensure the table name is plural to match naming conventions
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-one relationship with User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // One-to-many relationship with CartItemEntity
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CartItem> items = new ArrayList<>();
    // Constructors
    public Cart() {}

    public Cart(User user) {
        this.user = user;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    // No setter for 'id' as it's auto-generated

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    // Helper methods to manage bidirectional relationship

    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
    }
}