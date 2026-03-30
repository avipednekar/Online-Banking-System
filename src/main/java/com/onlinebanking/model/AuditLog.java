package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.onlinebanking.util.IdentifierGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String auditEventId;

    @Column(nullable = false)
    private String actorUsername;

    private String actorId;

    private String actorRole;

    private String customerId;

    private String accountId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    private String entityId;

    @Column(nullable = false, length = 1000)
    private String details;

    private String correlationId;

    private String outcome;

    private String ipAddress;

    private String deviceFingerprint;

    private String reasonCode;

    @Column(length = 2000)
    private String beforeSnapshot;

    @Column(length = 2000)
    private String afterSnapshot;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AuditLog() {
    }

    public AuditLog(String actorUsername, String action, String entityType, String entityId, String details) {
        this.auditEventId = IdentifierGenerator.newId("AUD");
        this.actorUsername = actorUsername;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.details = details;
        this.outcome = "SUCCESS";
        this.createdAt = LocalDateTime.now();
    }

    public void enrich(String actorId,
                       String actorRole,
                       String customerId,
                       String accountId,
                       String correlationId,
                       String outcome,
                       String ipAddress,
                       String deviceFingerprint,
                       String reasonCode,
                       String beforeSnapshot,
                       String afterSnapshot) {
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.customerId = customerId;
        this.accountId = accountId;
        this.correlationId = correlationId;
        this.outcome = outcome;
        this.ipAddress = ipAddress;
        this.deviceFingerprint = deviceFingerprint;
        this.reasonCode = reasonCode;
        this.beforeSnapshot = beforeSnapshot;
        this.afterSnapshot = afterSnapshot;
    }
}
