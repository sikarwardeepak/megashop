package com.megashop.controller;

import com.megashop.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody Map<String, Object> data) {
        try {
            // Convert totalAmount to Double
            Double totalAmount = ((Number) data.get("totalAmount")).doubleValue();
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(totalAmount, "usd", "Payment description");
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            return response;
        } catch (StripeException e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error creating payment intent");
            return errorResponse;
        }
    }
}