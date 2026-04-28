package com.crisis.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInfoLogger implements CommandLineRunner {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    public void run(String... args) throws Exception {
        if (mongoUri != null && mongoUri.length() > 20) {
            String masked = mongoUri.substring(0, 15) + "..." + mongoUri.substring(mongoUri.length() - 5);
            System.out.println(">>> Backend starting with MongoDB URI: " + masked);
        } else {
            System.out.println(">>> Backend starting with MongoDB URI: " + mongoUri);
        }
    }
}
