package com.onlinebanking.model;

import com.onlinebanking.util.IdentifierGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "posting_batches")
public class PostingBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String postingBatchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostingBatchStatus status;

    @Column(nullable = false)
    private String narrative;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public PostingBatch() {
    }

    public PostingBatch(String narrative) {
        this.postingBatchId = IdentifierGenerator.newId("PST");
        this.status = PostingBatchStatus.INITIATED;
        this.narrative = narrative;
        this.createdAt = LocalDateTime.now();
    }

    public String getPostingBatchId() {
        return postingBatchId;
    }

    public void markPosted() {
        this.status = PostingBatchStatus.POSTED;
        this.completedAt = LocalDateTime.now();
    }

    public void markFailed() {
        this.status = PostingBatchStatus.FAILED;
        this.completedAt = LocalDateTime.now();
    }
}
