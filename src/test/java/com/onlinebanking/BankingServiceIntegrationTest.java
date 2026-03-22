package com.onlinebanking;

import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.RegisterRequest;
import com.onlinebanking.dto.TransferRequest;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.model.AccountType;
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
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class BankingServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private BankingService bankingService;

    @Autowired
    private BeneficiaryService beneficiaryService;

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
    void generatedAccountNumberUsesExpectedPattern() {
        authService.register(registerRequest("geeta", "geeta@example.com"));

        String accountNumber = bankingService.createAccount("geeta", new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1000.00"))).accountNumber();

        assertEquals(true, accountNumber.startsWith("SAV-"));
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
