package com.onlinebanking.model;

public enum TransferStatus {
    INITIATED,
    PENDING_APPROVAL,
    POSTING,
    POSTED,
    FAILED,
    REVERSED,
    CANCELLED
}
