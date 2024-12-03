package com.megashop.controller;

import com.megashop.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/pay")
    public String pay(@RequestParam("sum") Double sum) {
        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(sum, "usd", "Payment description");
            return paymentIntent.toJson();
        } catch (StripeException e) {
            e.printStackTrace();
            return "Error creating payment intent";
        }
    }
}