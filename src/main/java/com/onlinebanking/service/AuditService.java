package com.onlinebanking.service;

import com.onlinebanking.model.AuditLog;
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
}
