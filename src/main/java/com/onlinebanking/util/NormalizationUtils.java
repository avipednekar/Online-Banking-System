package com.onlinebanking.util;

import com.onlinebanking.security.crypto.SensitiveDataCrypto;

import java.util.Locale;

public final class NormalizationUtils {

    private NormalizationUtils() {
    }

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizePhone(String phone) {
        return phone == null ? null : phone.replaceAll("[^0-9]", "");
    }

    public static String hashEmail(String email) {
        return SensitiveDataCrypto.lookupHash(normalizeEmail(email));
    }

    public static String hashPhone(String phone) {
        return SensitiveDataCrypto.lookupHash(normalizePhone(phone));
    }
}
