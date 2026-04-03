package com.onlinebanking.util;

import java.util.Locale;

public final class IndiaMarketPolicy {

    public static final String SUPPORTED_CURRENCY = "INR";
    public static final String SUPPORTED_COUNTRY = "India";

    private IndiaMarketPolicy() {
    }

    public static String normalizeCurrency(String currencyCode) {
        return currencyCode == null ? null : currencyCode.trim().toUpperCase(Locale.ROOT);
    }

    public static String normalizeCountry(String country) {
        if (country == null) {
            return null;
        }

        String trimmed = country.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }

        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT)
                + trimmed.substring(1).toLowerCase(Locale.ROOT);
    }

    public static boolean isSupportedCurrency(String currencyCode) {
        return SUPPORTED_CURRENCY.equals(normalizeCurrency(currencyCode));
    }

    public static boolean isSupportedCountry(String country) {
        return "INDIA".equals(
                country == null ? null : country.trim().toUpperCase(Locale.ROOT)
        );
    }
}
