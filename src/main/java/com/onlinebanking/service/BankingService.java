package com.onlinebanking.service;

import com.onlinebanking.dto.AccountResponse;
import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.TransactionResponse;
import com.onlinebanking.dto.TransferRequest;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.Account;
import com.onlinebanking.model.AccountNumberSequence;
import com.onlinebanking.model.AccountStatus;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.LedgerEntry;
import com.onlinebanking.model.LedgerEntryType;
import com.onlinebanking.model.Transaction;
import com.onlinebanking.model.TransactionChannel;
import com.onlinebanking.model.TransactionStatus;
import com.onlinebanking.model.TransactionType;
import com.onlinebanking.repository.AccountNumberSequenceRepository;
import com.onlinebanking.repository.AccountRepository;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.repository.LedgerEntryRepository;
import com.onlinebanking.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;
import java.util.List;

@Service
public class BankingService {

    private static final BigDecimal MIN_BALANCE = new BigDecimal("100.00");
    private static final Logger log = LoggerFactory.getLogger(BankingService.class);

    private final AccountNumberSequenceRepository accountNumberSequenceRepository;
    private final AccountRepository accountRepository;
    private final BankUserRepository bankUserRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final BeneficiaryService beneficiaryService;
    private final AuditService auditService;

    public BankingService(AccountNumberSequenceRepository accountNumberSequenceRepository,
                          AccountRepository accountRepository,
                          BankUserRepository bankUserRepository,
                          TransactionRepository transactionRepository,
                          LedgerEntryRepository ledgerEntryRepository,
                          BeneficiaryService beneficiaryService,
                          AuditService auditService) {
        this.accountNumberSequenceRepository = accountNumberSequenceRepository;
        this.accountRepository = accountRepository;
        this.bankUserRepository = bankUserRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.beneficiaryService = beneficiaryService;
        this.auditService = auditService;
    }

    @Transactional
    public AccountResponse createAccount(String username, CreateAccountRequest request) {
        BankUser owner = getAuthenticatedUser(username);

        BigDecimal openingBalance = normalize(request.openingBalance());
        if (openingBalance.compareTo(MIN_BALANCE) < 0) {
            throw new BusinessException("Opening balance must be at least " + MIN_BALANCE);
        }

        String generatedAccountNumber = generateAccountNumber(request.accountType());
        Account account = new Account(
                generatedAccountNumber,
                request.accountType(),
                openingBalance,
                owner
        );

        Account savedAccount = accountRepository.save(account);
        Transaction transaction = saveTransaction(
                savedAccount,
                TransactionType.DEPOSIT,
                TransactionStatus.POSTED,
                TransactionChannel.SYSTEM,
                openingBalance,
                null,
                "Account opened with initial funding"
        );
        saveLedgerEntry(savedAccount, transaction, LedgerEntryType.CREDIT, openingBalance, "Account opening balance");
        auditService.log(username, "ACCOUNT_CREATED", "Account", savedAccount.getAccountNumber(),
                "Account opened with status " + savedAccount.getStatus());
        log.info("Account {} created for user {}", savedAccount.getAccountNumber(), username);
        return toAccountResponse(savedAccount);
    }

    public List<AccountResponse> getAccountsForUser(String username) {
        getAuthenticatedUser(username);
        return accountRepository.findByOwnerUsernameIgnoreCaseOrderByCreatedAtAsc(username).stream()
                .map(this::toAccountResponse)
                .toList();
    }

    public AccountResponse getAccount(String username, String accountNumber) {
        return toAccountResponse(getOwnedAccount(username, accountNumber));
    }

    @Transactional
    public AccountResponse deposit(String username, String accountNumber, BigDecimal amount) {
        Account account = getOwnedAccount(username, accountNumber);
        ensureActiveAccount(account);
        BigDecimal normalizedAmount = validatePositiveAmount(amount);
        account.setBalance(account.getBalance().add(normalizedAmount));
        Account saved = accountRepository.save(account);
        Transaction transaction = saveTransaction(
                saved,
                TransactionType.DEPOSIT,
                TransactionStatus.POSTED,
                TransactionChannel.ONLINE_BANKING,
                normalizedAmount,
                null,
                "Customer deposit"
        );
        saveLedgerEntry(saved, transaction, LedgerEntryType.CREDIT, normalizedAmount, "Deposit posted");
        auditService.log(username, "DEPOSIT_POSTED", "Account", saved.getAccountNumber(),
                "Deposit amount " + normalizedAmount);
        log.info("Deposit posted for account {} by user {}", saved.getAccountNumber(), username);
        return toAccountResponse(saved);
    }

    @Transactional
    public AccountResponse withdraw(String username, String accountNumber, BigDecimal amount) {
        Account account = getOwnedAccount(username, accountNumber);
        ensureActiveAccount(account);
        BigDecimal normalizedAmount = validatePositiveAmount(amount);
        BigDecimal newBalance = account.getBalance().subtract(normalizedAmount);
        if (newBalance.compareTo(MIN_BALANCE) < 0) {
            throw new BusinessException("Insufficient funds. Minimum balance of " + MIN_BALANCE + " must be maintained");
        }

        account.setBalance(newBalance);
        Account saved = accountRepository.save(account);
        Transaction transaction = saveTransaction(
                saved,
                TransactionType.WITHDRAWAL,
                TransactionStatus.POSTED,
                TransactionChannel.ONLINE_BANKING,
                normalizedAmount,
                null,
                "Customer withdrawal"
        );
        saveLedgerEntry(saved, transaction, LedgerEntryType.DEBIT, normalizedAmount, "Withdrawal posted");
        auditService.log(username, "WITHDRAWAL_POSTED", "Account", saved.getAccountNumber(),
                "Withdrawal amount " + normalizedAmount);
        log.info("Withdrawal posted for account {} by user {}", saved.getAccountNumber(), username);
        return toAccountResponse(saved);
    }

    @Transactional
    public void transfer(String username, TransferRequest request) {
        if (request.fromAccountNumber().equals(request.toAccountNumber())) {
            throw new BusinessException("Source and destination accounts must be different");
        }

        Account fromAccount = getOwnedAccount(username, request.fromAccountNumber());
        Account toAccount = getAccountEntity(request.toAccountNumber());
        ensureActiveAccount(fromAccount);
        ensureActiveAccount(toAccount);
        if (!fromAccount.getOwner().getUsername().equalsIgnoreCase(toAccount.getOwner().getUsername())) {
            beneficiaryService.ensureActiveBeneficiary(username, request.toAccountNumber());
        }
        BigDecimal normalizedAmount = validatePositiveAmount(request.amount());

        BigDecimal newSenderBalance = fromAccount.getBalance().subtract(normalizedAmount);
        if (newSenderBalance.compareTo(MIN_BALANCE) < 0) {
            throw new BusinessException("Insufficient funds. Minimum balance of " + MIN_BALANCE + " must be maintained");
        }

        fromAccount.setBalance(newSenderBalance);
        toAccount.setBalance(toAccount.getBalance().add(normalizedAmount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        Transaction debitTransaction = saveTransaction(
                fromAccount,
                TransactionType.TRANSFER_OUT,
                TransactionStatus.POSTED,
                TransactionChannel.ONLINE_BANKING,
                normalizedAmount,
                toAccount.getAccountNumber(),
                "Transfer to " + toAccount.getAccountNumber()
        );
        Transaction creditTransaction = saveTransaction(
                toAccount,
                TransactionType.TRANSFER_IN,
                TransactionStatus.POSTED,
                TransactionChannel.ONLINE_BANKING,
                normalizedAmount,
                fromAccount.getAccountNumber(),
                "Transfer from " + fromAccount.getAccountNumber()
        );

        saveLedgerEntry(fromAccount, debitTransaction, LedgerEntryType.DEBIT, normalizedAmount,
                "Transfer to " + toAccount.getAccountNumber());
        saveLedgerEntry(toAccount, creditTransaction, LedgerEntryType.CREDIT, normalizedAmount,
                "Transfer from " + fromAccount.getAccountNumber());
        auditService.log(username, "TRANSFER_POSTED", "Account", fromAccount.getAccountNumber(),
                "Transfer of " + normalizedAmount + " to " + toAccount.getAccountNumber());
        log.info("Transfer posted from {} to {} by user {}", fromAccount.getAccountNumber(), toAccount.getAccountNumber(), username);
    }

    public List<TransactionResponse> getTransactions(String username, String accountNumber) {
        getOwnedAccount(username, accountNumber);
        return transactionRepository.findByAccountAccountNumberOrderByCreatedAtDesc(accountNumber).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    private BankUser getAuthenticatedUser(String username) {
        return bankUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Account getAccountEntity(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
    }

    private Account getOwnedAccount(String username, String accountNumber) {
        Account account = getAccountEntity(accountNumber);
        if (!account.getOwner().getUsername().equalsIgnoreCase(username)) {
            throw new BusinessException("You are not allowed to access this account");
        }
        return account;
    }

    private void ensureActiveAccount(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("Account is not active for transactions");
        }
    }

    private BigDecimal validatePositiveAmount(BigDecimal amount) {
        BigDecimal normalizedAmount = normalize(amount);
        if (normalizedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than zero");
        }
        return normalizedAmount;
    }

    private BigDecimal normalize(BigDecimal value) {
        if (value == null) {
            throw new BusinessException("Amount is required");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private Transaction saveTransaction(Account account,
                                        TransactionType transactionType,
                                        TransactionStatus transactionStatus,
                                        TransactionChannel transactionChannel,
                                        BigDecimal amount,
                                        String counterpartyAccountNumber,
                                        String description) {
        return transactionRepository.save(new Transaction(
                account,
                buildTransactionReference(account.getAccountNumber()),
                transactionType,
                transactionStatus,
                transactionChannel,
                amount,
                counterpartyAccountNumber,
                description
        ));
    }

    private void saveLedgerEntry(Account account,
                                 Transaction transaction,
                                 LedgerEntryType entryType,
                                 BigDecimal amount,
                                 String narrative) {
        ledgerEntryRepository.save(new LedgerEntry(
                transaction,
                entryType,
                amount,
                account.getBalance(),
                narrative
        ));
    }

    private String buildTransactionReference(String accountNumber) {
        long sequence = transactionRepository.countByAccountAccountNumber(accountNumber) + 1;
        return accountNumber + "-" + sequence + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private synchronized String generateAccountNumber(com.onlinebanking.model.AccountType accountType) {
        AccountNumberSequence accountNumberSequence = accountNumberSequenceRepository.findById(accountType)
                .orElseGet(() -> new AccountNumberSequence(accountType));

        long nextSequence = accountNumberSequence.nextValue();
        if (nextSequence > 99_999) {
            throw new BusinessException("Account number sequence limit reached for " + accountType.name());
        }

        accountNumberSequenceRepository.save(accountNumberSequence);

        String leadingDigit = switch (accountType) {
            case SAVINGS -> "9";
            case CURRENT -> "8";
        };
        String randomDigits = String.format("%04d", ThreadLocalRandom.current().nextInt(10_000));
        return leadingDigit + randomDigits + String.format("%05d", nextSequence);
    }

    private AccountResponse toAccountResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getStatus(),
                account.getCurrencyCode(),
                account.getBalance(),
                account.getOwner().getId(),
                account.getOwner().getUsername(),
                account.getCreatedAt()
        );
    }

    private TransactionResponse toTransactionResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getTransactionReference(),
                transaction.getAccount().getAccountNumber(),
                transaction.getType(),
                transaction.getStatus(),
                transaction.getChannel(),
                transaction.getAmount(),
                transaction.getCounterpartyAccountNumber(),
                transaction.getDescription(),
                transaction.getCreatedAt(),
                transaction.getCompletedAt()
        );
    }
}
