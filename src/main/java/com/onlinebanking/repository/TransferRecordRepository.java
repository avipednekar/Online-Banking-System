package com.onlinebanking.repository;

import com.onlinebanking.model.TransferRecord;
import com.onlinebanking.model.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransferRecordRepository extends JpaRepository<TransferRecord, Long> {

    Optional<TransferRecord> findByIdempotencyKey(String idempotencyKey);

    Optional<TransferRecord> findByTransferId(String transferId);

    Page<TransferRecord> findByStatusOrderByCreatedAtDesc(TransferStatus status, Pageable pageable);

    long countByStatus(TransferStatus status);
}

