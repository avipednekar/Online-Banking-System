package com.onlinebanking.util;

import java.util.UUID;

public final class IdentifierGenerator {

    private IdentifierGenerator() {
    }

    public static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }
}
