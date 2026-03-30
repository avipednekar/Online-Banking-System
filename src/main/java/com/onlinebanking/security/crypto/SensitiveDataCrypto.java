package com.onlinebanking.security.crypto;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

public final class SensitiveDataCrypto {

    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static volatile byte[] encryptionKey;
    private static volatile byte[] lookupKey;

    private SensitiveDataCrypto() {
    }

    public static void initialize(byte[] masterKey) {
        if (masterKey == null || masterKey.length < 32) {
            throw new IllegalArgumentException("Encryption master key must be at least 32 bytes");
        }
        byte[] normalizedKey = new byte[32];
        System.arraycopy(masterKey, 0, normalizedKey, 0, 32);
        encryptionKey = normalizedKey;
        lookupKey = normalizedKey;
    }

    public static String encrypt(String value) {
        if (value == null) {
            return null;
        }
        byte[] iv = new byte[12];
        SECURE_RANDOM.nextBytes(iv);
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(requiredKey(), "AES"), new GCMParameterSpec(128, iv));
            byte[] cipherText = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + cipherText.length);
            buffer.put(iv);
            buffer.put(cipherText);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Failed to encrypt sensitive value", exception);
        }
    }

    public static String decrypt(String value) {
        if (value == null) {
            return null;
        }
        byte[] payload = Base64.getDecoder().decode(value);
        ByteBuffer buffer = ByteBuffer.wrap(payload);
        byte[] iv = new byte[12];
        buffer.get(iv);
        byte[] cipherText = new byte[buffer.remaining()];
        buffer.get(cipherText);
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(requiredKey(), "AES"), new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Failed to decrypt sensitive value", exception);
        }
    }

    public static String lookupHash(String normalizedValue) {
        if (normalizedValue == null) {
            return null;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(requiredLookupKey(), HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(normalizedValue.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Failed to derive lookup hash", exception);
        }
    }

    private static byte[] requiredKey() {
        if (encryptionKey == null) {
            throw new IllegalStateException("Sensitive data crypto has not been initialized");
        }
        return encryptionKey;
    }

    private static byte[] requiredLookupKey() {
        if (lookupKey == null) {
            throw new IllegalStateException("Sensitive data crypto has not been initialized");
        }
        return lookupKey;
    }
}
