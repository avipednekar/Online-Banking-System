package com.onlinebanking.repository;

import com.onlinebanking.model.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    List<OutboxEvent> findTop50ByProcessedAtIsNullOrderByCreatedAtAsc();

    long countByProcessedAtIsNull();

    @Modifying
    @Query("DELETE FROM OutboxEvent e WHERE e.processedAt IS NOT NULL AND e.processedAt < :cutoff")
    int deleteProcessedBefore(@Param("cutoff") LocalDateTime cutoff);
}

