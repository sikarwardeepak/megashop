package com.megashop.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.Stripe;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String apiKey;

    public PaymentIntent createPaymentIntent(Double amount, String currency, String description) throws StripeException {
        Stripe.apiKey = apiKey;
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long)(amount * 100)) // Convert to cents
                .setCurrency(currency)
                .setDescription(description)
                .build();
        return PaymentIntent.create(params);
    }
}