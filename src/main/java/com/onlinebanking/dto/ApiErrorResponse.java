package com.onlinebanking.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorResponse(
        boolean success,
        String message,
        int status,
        String path,
        LocalDateTime timestamp,
        Map<String, String> fields
) {

    public static ApiErrorResponse of(int status, String path, String message, Map<String, String> fields) {
        return new ApiErrorResponse(false, message, status, path, LocalDateTime.now(), fields);
    }
}
