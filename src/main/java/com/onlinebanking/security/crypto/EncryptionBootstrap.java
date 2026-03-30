package com.onlinebanking.security.crypto;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
public class EncryptionBootstrap {

    private final String masterKey;

    public EncryptionBootstrap(@Value("${app.encryption.master-key}") String masterKey) {
        this.masterKey = masterKey;
    }

    @PostConstruct
    void initialize() {
        SensitiveDataCrypto.initialize(Base64.getDecoder().decode(masterKey));
    }
}
