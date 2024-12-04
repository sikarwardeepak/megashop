package com.megashop.controller;

import com.megashop.entity.Product;
import com.megashop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody ProductRequest productRequest) {
        Product product = productRequest.toProduct();
        return productService.saveProduct(product, productRequest.getCategoryName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(@PathVariable Long id, @RequestBody ProductRequest productRequest) {
        Product product = productRequest.toProduct();
        product.setId(id);
        return productService.saveProduct(product, productRequest.getCategoryName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping("/search")
    public List<Product> searchProductsByName(@RequestParam String name) {
        return productService.searchProductsByName(name);
    }

    @GetMapping("/filter")
    public List<Product> getProductsByFilters(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        return productService.getProductsByFilters(categoryId, minPrice, maxPrice);
    }
}
