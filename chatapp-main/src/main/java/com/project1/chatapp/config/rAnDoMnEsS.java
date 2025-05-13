package com.project1.chatapp.config;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class rAnDoMnEsS {
    private static final SecureRandom secureRandom = new SecureRandom();

    public static String generateRandom(int length) {
        byte[] key = new byte[length];
        secureRandom.nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }

    public static int generateRandomInt(int min, int max) {
        return secureRandom.nextInt((max - min) + 1) + min;
    }
}

