package com.onlinebanking.service;

import com.onlinebanking.model.OutboxEvent;
import com.onlinebanking.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OutboxService {

    private static final Logger log = LoggerFactory.getLogger(OutboxService.class);

    private final OutboxEventRepository outboxEventRepository;

    public OutboxService(OutboxEventRepository outboxEventRepository) {
        this.outboxEventRepository = outboxEventRepository;
    }

    public void enqueue(String aggregateType, String aggregateId, String eventType, String payload) {
        outboxEventRepository.save(new OutboxEvent(aggregateType, aggregateId, eventType, payload));
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:5000}")
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pending = outboxEventRepository.findTop50ByProcessedAtIsNullOrderByCreatedAtAsc();
        if (pending.isEmpty()) {
            return;
        }

        log.info("Processing {} pending outbox event(s)", pending.size());
        for (OutboxEvent event : pending) {
            try {
                dispatchEvent(event);
                event.markProcessed();
                outboxEventRepository.save(event);
                log.info("Successfully processed outbox event {} of type {} for aggregate {}",
                        event.getEventId(), event.getEventType(), event.getAggregateId());
            } catch (Exception ex) {
                log.error("Failed to process outbox event {}: {}", event.getEventId(), ex.getMessage(), ex);
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2:00 AM
    @Transactional
    public void purgeOldProcessedEvents() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        int deleted = outboxEventRepository.deleteProcessedBefore(cutoff);
        if (deleted > 0) {
            log.info("Purged {} processed outbox event(s) older than {}", deleted, cutoff);
        }
    }

    public long getPendingEventCount() {
        return outboxEventRepository.countByProcessedAtIsNull();
    }

    private void dispatchEvent(OutboxEvent event) {
        // Dispatches event to domain log / messaging integration
        log.debug("Dispatching event [{}]: aggregateType={}, aggregateId={}, eventType={}, payload={}",
                event.getEventId(), event.getAggregateType(), event.getAggregateId(), event.getEventType(), event.getPayload());
    }
}

