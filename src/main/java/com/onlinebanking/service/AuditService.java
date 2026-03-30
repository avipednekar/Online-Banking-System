package com.onlinebanking.service;

import com.onlinebanking.model.AuditLog;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String actorUsername, String action, String entityType, String entityId, String details) {
        auditLogRepository.save(new AuditLog(actorUsername, action, entityType, entityId, details));
    }

    public void log(BankUser actor,
                    CustomerProfile customerProfile,
                    String accountId,
                    String action,
                    String entityType,
                    String entityId,
                    String details,
                    String outcome,
                    String ipAddress,
                    String deviceFingerprint,
                    String reasonCode,
                    String beforeSnapshot,
                    String afterSnapshot) {
        AuditLog auditLog = new AuditLog(actor.getUsername(), action, entityType, entityId, details);
        auditLog.enrich(
                String.valueOf(actor.getId()),
                actor.getRole().name(),
                customerProfile == null ? null : customerProfile.getCustomerId(),
                accountId,
                null,
                outcome,
                ipAddress,
                deviceFingerprint,
                reasonCode,
                beforeSnapshot,
                afterSnapshot
        );
        auditLogRepository.save(auditLog);
    }
}
