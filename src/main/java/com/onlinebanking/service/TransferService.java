package com.onlinebanking.service;

import com.onlinebanking.dto.CreateTransferRequest;
import com.onlinebanking.dto.TransferReceiptResponse;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.Account;
import com.onlinebanking.model.AccountBalance;
import com.onlinebanking.model.AccountStatus;
import com.onlinebanking.model.Beneficiary;
import com.onlinebanking.model.LedgerEntry;
import com.onlinebanking.model.LedgerEntryType;
import com.onlinebanking.model.LedgerPosting;
import com.onlinebanking.model.PostingBatch;
import com.onlinebanking.model.Transaction;
import com.onlinebanking.model.TransactionChannel;
import com.onlinebanking.model.TransactionStatus;
import com.onlinebanking.model.TransactionType;
import com.onlinebanking.model.TransferRecord;
import com.onlinebanking.model.TransferStatus;
import com.onlinebanking.repository.AccountBalanceRepository;
import com.onlinebanking.repository.AccountRepository;
import com.onlinebanking.repository.BeneficiaryRepository;
import com.onlinebanking.repository.CustomerProfileRepository;
import com.onlinebanking.repository.LedgerEntryRepository;
import com.onlinebanking.repository.LedgerPostingRepository;
import com.onlinebanking.repository.PostingBatchRepository;
import com.onlinebanking.repository.TransactionRepository;
import com.onlinebanking.repository.TransferRecordRepository;
import com.onlinebanking.util.IndiaMarketPolicy;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
public class TransferService {

    private static final BigDecimal MIN_BALANCE = new BigDecimal("100.00");

    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final TransferRecordRepository transferRecordRepository;
    private final PostingBatchRepository postingBatchRepository;
    private final LedgerPostingRepository ledgerPostingRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final AuditService auditService;
    private final OutboxService outboxService;
    private final BigDecimal approvalThreshold;

    public TransferService(AccountRepository accountRepository,
                           BeneficiaryRepository beneficiaryRepository,
                           AccountBalanceRepository accountBalanceRepository,
                           TransferRecordRepository transferRecordRepository,
                           PostingBatchRepository postingBatchRepository,
                           LedgerPostingRepository ledgerPostingRepository,
                           TransactionRepository transactionRepository,
                           LedgerEntryRepository ledgerEntryRepository,
                           CustomerProfileRepository customerProfileRepository,
                           AuditService auditService,
                           OutboxService outboxService,
                           @Value("${app.transfer.approval-threshold:50000.00}") BigDecimal approvalThreshold) {
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.transferRecordRepository = transferRecordRepository;
        this.postingBatchRepository = postingBatchRepository;
        this.ledgerPostingRepository = ledgerPostingRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.auditService = auditService;
        this.outboxService = outboxService;
        this.approvalThreshold = approvalThreshold.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public TransferReceiptResponse initiateTransfer(String username, CreateTransferRequest request, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new BusinessException("Idempotency-Key header is required");
        }

        TransferRecord existing = transferRecordRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) {
            if (!existing.getRequestedBy().equalsIgnoreCase(username)) {
                throw new BusinessException("Idempotency key is already in use");
            }
            return toResponse(existing);
        }

        Account fromAccount = accountRepository.findByAccountId(request.fromAccountId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));
        if (!fromAccount.getOwner().getUsername().equalsIgnoreCase(username)) {
            throw new BusinessException("You are not allowed to transfer from this account");
        }
        Beneficiary beneficiary = beneficiaryRepository.findByBeneficiaryIdAndOwnerUsernameIgnoreCase(request.beneficiaryId().trim(), username)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        if (!beneficiary.isActive()) {
            throw new BusinessException("Beneficiary must be active before transfers");
        }
        Account toAccount = accountRepository.findByAccountNumber(beneficiary.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));

        ensureActiveAccount(fromAccount);
        ensureActiveAccount(toAccount);
        ensureIndiaOnlyTransfer(fromAccount, toAccount);

        String requestedCurrency = IndiaMarketPolicy.normalizeCurrency(request.currency());
        if (!IndiaMarketPolicy.isSupportedCurrency(requestedCurrency)) {
            throw new BusinessException("Transfers are supported only in INR");
        }
        if (!IndiaMarketPolicy.isSupportedCurrency(fromAccount.getCurrencyCode())
                || !IndiaMarketPolicy.isSupportedCurrency(toAccount.getCurrencyCode())) {
            throw new BusinessException("Transfers are supported only for INR accounts");
        }
        if (!fromAccount.getCurrencyCode().equalsIgnoreCase(requestedCurrency)) {
            throw new BusinessException("Transfer currency must match the source account currency");
        }

        BigDecimal amount = normalize(request.amount());
        TransferRecord transfer = transferRecordRepository.save(new TransferRecord(
                idempotencyKey.trim(),
                fromAccount,
                toAccount,
                beneficiary,
                request.channel(),
                amount,
                requestedCurrency,
                username,
                request.remarks().trim()
        ));

        if (amount.compareTo(approvalThreshold) >= 0) {
            transfer.markPendingApproval();
            transferRecordRepository.save(transfer);
            outboxService.enqueue("TransferRecord", transfer.getTransferId(), "TRANSFER_PENDING_APPROVAL",
                    "{\"transferId\":\"" + transfer.getTransferId() + "\"}");
            auditService.log(username, "TRANSFER_PENDING_APPROVAL", "TransferRecord", transfer.getTransferId(),
                    "Transfer pending approval for amount " + amount);
            return toResponse(transfer);
        }

        return postTransfer(transfer);
    }

    @Transactional
    public TransferReceiptResponse approveTransfer(String adminUsername, String transferId) {
        TransferRecord transfer = transferRecordRepository.findByTransferId(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found"));
        if (transfer.getStatus() != TransferStatus.PENDING_APPROVAL) {
            throw new BusinessException("Only pending transfers can be approved");
        }
        TransferReceiptResponse response = postTransfer(transfer);
        auditService.log(adminUsername, "TRANSFER_APPROVED", "TransferRecord", transfer.getTransferId(),
                "Approved transfer for amount " + transfer.getAmount());
        return response;
    }

    private TransferReceiptResponse postTransfer(TransferRecord transfer) {
        Account fromAccount = transfer.getFromAccount();
        Account toAccount = transfer.getToAccount();
        List<String> accountIds = List.of(fromAccount.getAccountId(), toAccount.getAccountId()).stream()
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
        List<AccountBalance> lockedBalances = accountBalanceRepository.findByAccountIdsForUpdate(accountIds);
        AccountBalance fromBalance = lockedBalances.stream()
                .filter(balance -> balance.getAccount().getAccountId().equals(fromAccount.getAccountId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Source account balance not found"));
        AccountBalance toBalance = lockedBalances.stream()
                .filter(balance -> balance.getAccount().getAccountId().equals(toAccount.getAccountId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Destination account balance not found"));

        BigDecimal nextSenderBalance = fromBalance.getAvailableBalance().subtract(transfer.getAmount());
        if (nextSenderBalance.compareTo(MIN_BALANCE) < 0) {
            throw new BusinessException("Insufficient funds. Minimum balance of " + MIN_BALANCE + " must be maintained");
        }

        PostingBatch postingBatch = postingBatchRepository.save(new PostingBatch(
                "Transfer " + transfer.getTransferId() + " from " + fromAccount.getAccountNumber() + " to " + toAccount.getAccountNumber()
        ));
        transfer.markPosting(postingBatch);
        transferRecordRepository.save(transfer);

        fromBalance.debit(transfer.getAmount());
        toBalance.credit(transfer.getAmount());
        accountBalanceRepository.save(fromBalance);
        accountBalanceRepository.save(toBalance);

        accountRepository.updateBalance(fromAccount.getAccountId(), fromBalance.getAvailableBalance());
        accountRepository.updateBalance(toAccount.getAccountId(), toBalance.getAvailableBalance());

        ledgerPostingRepository.save(new LedgerPosting(
                postingBatch,
                fromAccount,
                LedgerEntryType.DEBIT,
                transfer.getAmount(),
                fromBalance.getAvailableBalance(),
                transfer.getRemarks()
        ));
        ledgerPostingRepository.save(new LedgerPosting(
                postingBatch,
                toAccount,
                LedgerEntryType.CREDIT,
                transfer.getAmount(),
                toBalance.getAvailableBalance(),
                transfer.getRemarks()
        ));

        Transaction debitTransaction = transactionRepository.save(new Transaction(
                fromAccount,
                transfer.getTransferId() + "-DR",
                TransactionType.TRANSFER_OUT,
                TransactionStatus.POSTED,
                transfer.getChannel(),
                transfer.getAmount(),
                toAccount.getAccountNumber(),
                transfer.getRemarks()
        ));
        Transaction creditTransaction = transactionRepository.save(new Transaction(
                toAccount,
                transfer.getTransferId() + "-CR",
                TransactionType.TRANSFER_IN,
                TransactionStatus.POSTED,
                transfer.getChannel(),
                transfer.getAmount(),
                fromAccount.getAccountNumber(),
                transfer.getRemarks()
        ));

        ledgerEntryRepository.save(new LedgerEntry(
                debitTransaction,
                LedgerEntryType.DEBIT,
                transfer.getAmount(),
                fromBalance.getAvailableBalance(),
                transfer.getRemarks()
        ));
        ledgerEntryRepository.save(new LedgerEntry(
                creditTransaction,
                LedgerEntryType.CREDIT,
                transfer.getAmount(),
                toBalance.getAvailableBalance(),
                transfer.getRemarks()
        ));

        postingBatch.markPosted();
        postingBatchRepository.save(postingBatch);
        transfer.markPosted(postingBatch);
        transferRecordRepository.save(transfer);

        outboxService.enqueue("TransferRecord", transfer.getTransferId(), "TRANSFER_POSTED",
                "{\"transferId\":\"" + transfer.getTransferId() + "\",\"status\":\"POSTED\"}");
        auditService.log(transfer.getRequestedBy(), "TRANSFER_POSTED", "TransferRecord", transfer.getTransferId(),
                "Transfer posted from " + fromAccount.getAccountNumber() + " to " + toAccount.getAccountNumber());
        return toResponse(transfer);
    }

    private void ensureActiveAccount(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("Account is not active for transactions");
        }
    }

    private void ensureIndiaOnlyTransfer(Account fromAccount, Account toAccount) {
        if (!IndiaMarketPolicy.isSupportedCountry(resolveCountry(fromAccount))
                || !IndiaMarketPolicy.isSupportedCountry(resolveCountry(toAccount))) {
            throw new BusinessException("Transfers are restricted to accounts held in India");
        }
    }

    private String resolveCountry(Account account) {
        return customerProfileRepository.findByUserId(account.getOwner().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"))
                .getCountry();
    }

    private BigDecimal normalize(BigDecimal amount) {
        if (amount == null) {
            throw new BusinessException("Amount is required");
        }
        BigDecimal normalized = amount.setScale(2, RoundingMode.HALF_UP);
        if (normalized.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than zero");
        }
        return normalized;
    }

    private TransferReceiptResponse toResponse(TransferRecord transfer) {
        return new TransferReceiptResponse(
                transfer.getTransferId(),
                transfer.getPostingBatch() == null ? null : transfer.getPostingBatch().getPostingBatchId(),
                transfer.getFromAccount().getAccountId(),
                transfer.getToAccount().getAccountId(),
                transfer.getBeneficiary().getBeneficiaryId(),
                transfer.getAmount(),
                transfer.getCurrencyCode(),
                transfer.getChannel(),
                transfer.getStatus(),
                transfer.getRemarks(),
                transfer.getFailureCode(),
                transfer.getCreatedAt(),
                transfer.getCompletedAt()
        );
    }
}
