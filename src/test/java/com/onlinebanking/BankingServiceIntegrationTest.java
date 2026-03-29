package com.onlinebanking;

import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryLookupResponse;
import com.onlinebanking.dto.RegisterRequest;
import com.onlinebanking.dto.TransferRequest;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.AccountType;
import com.onlinebanking.repository.BankRepository;
import com.onlinebanking.repository.CustomerProfileRepository;
import com.onlinebanking.service.AuthService;
import com.onlinebanking.service.BankingService;
import com.onlinebanking.service.BeneficiaryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class BankingServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private BankingService bankingService;

    @Autowired
    private BeneficiaryService beneficiaryService;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private BankRepository bankRepository;

    @Test
    void depositIncreasesBalance() {
        authService.register(registerRequest("alice", "alice@example.com"));
        String accountNumber = bankingService.createAccount("alice", new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1000.00"))).accountNumber();

        BigDecimal balance = bankingService.deposit("alice", accountNumber, new BigDecimal("250.00")).balance();

        assertEquals(new BigDecimal("1250.00"), balance);
    }

    @Test
    void withdrawRespectsMinimumBalance() {
        authService.register(registerRequest("bob", "bob@example.com"));
        String accountNumber = bankingService.createAccount("bob", new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("500.00"))).accountNumber();

        assertThrows(BusinessException.class,
                () -> bankingService.withdraw("bob", accountNumber, new BigDecimal("450.01")));
    }

    @Test
    void transferMovesMoneyBetweenAccounts() {
        authService.register(registerRequest("charlie", "charlie@example.com"));
        authService.register(registerRequest("diana", "diana@example.com"));

        String senderAccount = bankingService.createAccount("charlie", new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1000.00"))).accountNumber();
        String receiverAccount = bankingService.createAccount("diana", new CreateAccountRequest(AccountType.CURRENT, new BigDecimal("800.00"))).accountNumber();
        beneficiaryService.createBeneficiary("charlie", new BeneficiaryRequest("Diana", "Internal Bank", receiverAccount));

        bankingService.transfer("charlie", new TransferRequest(senderAccount, receiverAccount, new BigDecimal("300.00")));

        assertEquals(new BigDecimal("700.00"), bankingService.getAccount("charlie", senderAccount).balance());
        assertEquals(new BigDecimal("1100.00"), bankingService.getAccount("diana", receiverAccount).balance());
    }

    @Test
    void transferRequiresApprovedBeneficiary() {
        authService.register(registerRequest("edgar", "edgar@example.com"));
        authService.register(registerRequest("fiona", "fiona@example.com"));

        String senderAccount = bankingService.createAccount("edgar", new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1200.00"))).accountNumber();
        String receiverAccount = bankingService.createAccount("fiona", new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("900.00"))).accountNumber();

        assertThrows(BusinessException.class,
                () -> bankingService.transfer("edgar", new TransferRequest(senderAccount, receiverAccount, new BigDecimal("100.00"))));
    }

    @Test
    void beneficiaryLookupReturnsVerifiedAccountDetails() {
        authService.register(registerRequest("harish", "harish@example.com"));
        authService.register(registerRequest("irene", "irene@example.com"));
        String receiverAccount = bankingService.createAccount("irene",
                new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("900.00"))).accountNumber();

        BeneficiaryLookupResponse lookup = beneficiaryService.lookupBeneficiary("harish", receiverAccount);

        assertEquals(receiverAccount, lookup.accountNumber());
        assertEquals("Test User irene", lookup.accountHolderName());
        assertEquals("ACTIVE", lookup.accountStatus());
    }

    @Test
    void beneficiaryCreationRejectsUnknownAccountNumber() {
        authService.register(registerRequest("jatin", "jatin@example.com"));

        assertThrows(ResourceNotFoundException.class,
                () -> beneficiaryService.createBeneficiary("jatin",
                        new BeneficiaryRequest("Ghost", "Internal Bank", "9123499999")));
    }

    @Test
    void registrationStoresAddressInSeparateRelation() {
        authService.register(registerRequest("kavya", "kavya@example.com"));

        var profile = customerProfileRepository.findByUserUsernameIgnoreCase("kavya").orElseThrow();

        assertNotNull(profile.getAddress());
        assertNotNull(profile.getAddress().getId());
        assertEquals("123 Main Street", profile.getAddress().getAddressLine1());
        assertEquals("Mumbai", profile.getAddress().getCity());
    }

    @Test
    void beneficiariesReuseCanonicalBankRelation() {
        authService.register(registerRequest("lina", "lina@example.com"));
        authService.register(registerRequest("mohan", "mohan@example.com"));
        authService.register(registerRequest("nita", "nita@example.com"));

        String firstAccount = bankingService.createAccount("mohan",
                new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("900.00"))).accountNumber();
        String secondAccount = bankingService.createAccount("nita",
                new CreateAccountRequest(AccountType.CURRENT, new BigDecimal("950.00"))).accountNumber();

        beneficiaryService.createBeneficiary("lina", new BeneficiaryRequest("Mohan", "Internal Bank", firstAccount));
        beneficiaryService.createBeneficiary("lina", new BeneficiaryRequest("Nita", "Internal Bank", secondAccount));

        assertEquals(1L, bankRepository.count());
    }

    @Test
    void generatedAccountNumberUsesExpectedPattern() {
        authService.register(registerRequest("geeta", "geeta@example.com"));

        String firstSavingsAccount = bankingService.createAccount("geeta",
                new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1000.00"))).accountNumber();
        String secondSavingsAccount = bankingService.createAccount("geeta",
                new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1200.00"))).accountNumber();
        String firstCurrentAccount = bankingService.createAccount("geeta",
                new CreateAccountRequest(AccountType.CURRENT, new BigDecimal("1500.00"))).accountNumber();
        String secondCurrentAccount = bankingService.createAccount("geeta",
                new CreateAccountRequest(AccountType.CURRENT, new BigDecimal("1700.00"))).accountNumber();

        assertTrue(firstSavingsAccount.matches("9\\d{9}"));
        assertTrue(secondSavingsAccount.matches("9\\d{9}"));
        assertTrue(firstCurrentAccount.matches("8\\d{9}"));
        assertTrue(secondCurrentAccount.matches("8\\d{9}"));
        assertEquals(extractSequence(firstSavingsAccount) + 1, extractSequence(secondSavingsAccount));
        assertEquals(extractSequence(firstCurrentAccount) + 1, extractSequence(secondCurrentAccount));
    }

    private long extractSequence(String accountNumber) {
        return Long.parseLong(accountNumber.substring(accountNumber.length() - 5));
    }

    private RegisterRequest registerRequest(String username, String email) {
        return new RegisterRequest(
                username,
                email,
                "Password@123",
                "Test User " + username,
                "9876543210",
                com.onlinebanking.model.Gender.OTHER,
                "Engineer",
                "123 Main Street",
                "Near Central Park",
                "Mumbai",
                "Maharashtra",
                "400001",
                "India",
                LocalDate.of(1998, 1, 15)
        );
    }
}
