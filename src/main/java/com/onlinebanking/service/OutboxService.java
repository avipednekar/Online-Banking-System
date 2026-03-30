package com.onlinebanking.service;

import com.onlinebanking.model.OutboxEvent;
import com.onlinebanking.repository.OutboxEventRepository;
import org.springframework.stereotype.Service;

@Service
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;

    public OutboxService(OutboxEventRepository outboxEventRepository) {
        this.outboxEventRepository = outboxEventRepository;
    }

    public void enqueue(String aggregateType, String aggregateId, String eventType, String payload) {
        outboxEventRepository.save(new OutboxEvent(aggregateType, aggregateId, eventType, payload));
    }
}
