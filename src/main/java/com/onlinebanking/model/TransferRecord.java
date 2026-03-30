package com.onlinebanking.model;

import com.onlinebanking.util.IdentifierGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_records")
public class TransferRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String transferId;

    @Column(nullable = false, unique = true, length = 128)
    private String idempotencyKey;

    @ManyToOne(optional = false)
    @JoinColumn(name = "from_account_id")
    private Account fromAccount;

    @ManyToOne(optional = false)
    @JoinColumn(name = "to_account_id")
    private Account toAccount;

    @ManyToOne(optional = false)
    @JoinColumn(name = "beneficiary_id")
    private Beneficiary beneficiary;

    @OneToOne
    @JoinColumn(name = "posting_batch_id", unique = true)
    private PostingBatch postingBatch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransferStatus status;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currencyCode;

    @Column(nullable = false)
    private String requestedBy;

    @Column(nullable = false)
    private String remarks;

    private String failureCode;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @Version
    private Long version;

    public TransferRecord() {
    }

    public TransferRecord(String idempotencyKey,
                          Account fromAccount,
                          Account toAccount,
                          Beneficiary beneficiary,
                          TransactionChannel channel,
                          BigDecimal amount,
                          String currencyCode,
                          String requestedBy,
                          String remarks) {
        this.transferId = IdentifierGenerator.newId("TRF");
        this.idempotencyKey = idempotencyKey;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.beneficiary = beneficiary;
        this.channel = channel;
        this.amount = amount;
        this.currencyCode = currencyCode;
        this.requestedBy = requestedBy;
        this.remarks = remarks;
        this.status = TransferStatus.INITIATED;
        this.createdAt = LocalDateTime.now();
    }

    public String getTransferId() {
        return transferId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public Account getFromAccount() {
        return fromAccount;
    }

    public Account getToAccount() {
        return toAccount;
    }

    public Beneficiary getBeneficiary() {
        return beneficiary;
    }

    public PostingBatch getPostingBatch() {
        return postingBatch;
    }

    public TransactionChannel getChannel() {
        return channel;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getFailureCode() {
        return failureCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void markPendingApproval() {
        this.status = TransferStatus.PENDING_APPROVAL;
    }

    public void markPosting(PostingBatch postingBatch) {
        this.status = TransferStatus.POSTING;
        this.postingBatch = postingBatch;
    }

    public void markPosted(PostingBatch postingBatch) {
        this.status = TransferStatus.POSTED;
        this.postingBatch = postingBatch;
        this.completedAt = LocalDateTime.now();
    }

    public void markFailed(String failureCode) {
        this.status = TransferStatus.FAILED;
        this.failureCode = failureCode;
        this.completedAt = LocalDateTime.now();
    }
}
