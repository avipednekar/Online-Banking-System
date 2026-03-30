package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_postings")
public class LedgerPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "posting_batch_id")
    private PostingBatch postingBatch;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LedgerEntryType entryType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal resultingBalance;

    @Column(nullable = false)
    private String narrative;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public LedgerPosting() {
    }

    public LedgerPosting(PostingBatch postingBatch,
                         Account account,
                         LedgerEntryType entryType,
                         BigDecimal amount,
                         BigDecimal resultingBalance,
                         String narrative) {
        this.postingBatch = postingBatch;
        this.account = account;
        this.entryType = entryType;
        this.amount = amount;
        this.resultingBalance = resultingBalance;
        this.narrative = narrative;
        this.createdAt = LocalDateTime.now();
    }
}
