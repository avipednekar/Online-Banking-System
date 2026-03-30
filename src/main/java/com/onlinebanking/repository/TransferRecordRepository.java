package com.onlinebanking.repository;

import com.onlinebanking.model.TransferRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransferRecordRepository extends JpaRepository<TransferRecord, Long> {

    Optional<TransferRecord> findByIdempotencyKey(String idempotencyKey);

    Optional<TransferRecord> findByTransferId(String transferId);
}
