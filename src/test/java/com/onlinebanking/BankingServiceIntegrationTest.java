package com.onlinebanking;

import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.AccountOpeningRequestResponse;
import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryLookupResponse;
import com.onlinebanking.dto.RegisterRequest;
import com.onlinebanking.dto.TransferRequest;
import com.onlinebanking.dto.UpdateKycStatusRequest;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.AccountType;
import com.onlinebanking.model.KycStatus;
import com.onlinebanking.repository.CustomerProfileRepository;
import com.onlinebanking.service.AdminService;
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
    private AdminService adminService;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Test
    void depositIncreasesBalance() {
        Long aliceId = authService.register(registerRequest("alice", "alice@example.com")).userId();
        String accountNumber = submitAndApproveAccount("alice", aliceId, AccountType.SAVINGS, "1000.00").approvedAccountNumber();

        BigDecimal balance = bankingService.deposit("alice", accountNumber, new BigDecimal("250.00")).balance();

        assertEquals(new BigDecimal("1250.00"), balance);
    }

    @Test
    void withdrawRespectsMinimumBalance() {
        Long bobId = authService.register(registerRequest("bob", "bob@example.com")).userId();
        String accountNumber = submitAndApproveAccount("bob", bobId, AccountType.SAVINGS, "500.00").approvedAccountNumber();

        assertThrows(BusinessException.class,
                () -> bankingService.withdraw("bob", accountNumber, new BigDecimal("450.01")));
    }

    @Test
    void transferMovesMoneyBetweenAccounts() {
        Long charlieId = authService.register(registerRequest("charlie", "charlie@example.com")).userId();
        Long dianaId = authService.register(registerRequest("diana", "diana@example.com")).userId();

        String senderAccount = submitAndApproveAccount("charlie", charlieId, AccountType.SAVINGS, "1000.00").approvedAccountNumber();
        String receiverAccount = submitAndApproveAccount("diana", dianaId, AccountType.CURRENT, "800.00").approvedAccountNumber();
        beneficiaryService.createBeneficiary("charlie", new BeneficiaryRequest("Diana", "Internal Bank", receiverAccount));

        bankingService.transfer("charlie", new TransferRequest(senderAccount, receiverAccount, new BigDecimal("300.00")));

        assertEquals(new BigDecimal("700.00"), bankingService.getAccount("charlie", senderAccount).balance());
        assertEquals(new BigDecimal("1100.00"), bankingService.getAccount("diana", receiverAccount).balance());
    }

    @Test
    void transferRequiresApprovedBeneficiary() {
        Long edgarId = authService.register(registerRequest("edgar", "edgar@example.com")).userId();
        Long fionaId = authService.register(registerRequest("fiona", "fiona@example.com")).userId();

        String senderAccount = submitAndApproveAccount("edgar", edgarId, AccountType.SAVINGS, "1200.00").approvedAccountNumber();
        String receiverAccount = submitAndApproveAccount("fiona", fionaId, AccountType.SAVINGS, "900.00").approvedAccountNumber();

        assertThrows(BusinessException.class,
                () -> bankingService.transfer("edgar", new TransferRequest(senderAccount, receiverAccount, new BigDecimal("100.00"))));
    }

    @Test
    void beneficiaryLookupReturnsVerifiedAccountDetails() {
        authService.register(registerRequest("harish", "harish@example.com"));
        Long ireneId = authService.register(registerRequest("irene", "irene@example.com")).userId();
        String receiverAccount = submitAndApproveAccount("irene", ireneId, AccountType.SAVINGS, "900.00").approvedAccountNumber();

        BeneficiaryLookupResponse lookup = beneficiaryService.lookupBeneficiary("harish", receiverAccount);

        assertEquals(receiverAccount, lookup.accountNumber());
        assertEquals("Test User irene", lookup.accountHolderName());
        assertEquals("ACTIVE", lookup.accountStatus());
    }

    @Test
    void beneficiaryCreationActivatesImmediatelyWithoutOtp() {
        authService.register(registerRequest("jia", "jia@example.com"));
        Long karanId = authService.register(registerRequest("karan", "karan@example.com")).userId();
        String receiverAccount = submitAndApproveAccount("karan", karanId, AccountType.SAVINGS, "900.00").approvedAccountNumber();

        var beneficiary = beneficiaryService.createBeneficiary(
                "jia",
                new BeneficiaryRequest("Karan", "Internal Bank", receiverAccount)
        );

        assertTrue(beneficiary.active());
        assertEquals("ACTIVE", beneficiary.status());
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
        Long mohanId = authService.register(registerRequest("mohan", "mohan@example.com")).userId();
        Long nitaId = authService.register(registerRequest("nita", "nita@example.com")).userId();

        String firstAccount = submitAndApproveAccount("mohan", mohanId, AccountType.SAVINGS, "900.00").approvedAccountNumber();
        String secondAccount = submitAndApproveAccount("nita", nitaId, AccountType.CURRENT, "950.00").approvedAccountNumber();

        beneficiaryService.createBeneficiary("lina", new BeneficiaryRequest("Mohan", "Internal Bank", firstAccount));
        beneficiaryService.createBeneficiary("lina", new BeneficiaryRequest("Nita", "Internal Bank", secondAccount));

        assertEquals("Internal Bank", beneficiaryService.getBeneficiaries("lina").get(0).bankName());
    }

    @Test
    void generatedAccountNumberUsesExpectedPattern() {
        Long geetaId = authService.register(registerRequest("geeta", "geeta@example.com")).userId();

        String firstSavingsAccount = submitAndApproveAccount("geeta", geetaId, AccountType.SAVINGS, "1000.00").approvedAccountNumber();
        String secondSavingsAccount = submitAndApproveAccount("geeta", geetaId, AccountType.SAVINGS, "1200.00").approvedAccountNumber();
        String firstCurrentAccount = submitAndApproveAccount("geeta", geetaId, AccountType.CURRENT, "1500.00").approvedAccountNumber();
        String secondCurrentAccount = submitAndApproveAccount("geeta", geetaId, AccountType.CURRENT, "1700.00").approvedAccountNumber();

        assertTrue(firstSavingsAccount.matches("9\\d{9}"));
        assertTrue(secondSavingsAccount.matches("9\\d{9}"));
        assertTrue(firstCurrentAccount.matches("8\\d{9}"));
        assertTrue(secondCurrentAccount.matches("8\\d{9}"));
        assertEquals(extractSequence(firstSavingsAccount) + 1, extractSequence(secondSavingsAccount));
        assertEquals(extractSequence(firstCurrentAccount) + 1, extractSequence(secondCurrentAccount));
    }

    @Test
    void accountOpeningRequestRequiresVerifiedKyc() {
        authService.register(registerRequest("omkar", "omkar@example.com"));

        assertThrows(BusinessException.class,
                () -> bankingService.submitAccountOpeningRequest("omkar",
                        new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1000.00"))));
    }

    @Test
    void accountNumberIsGeneratedOnlyAfterAdminApproval() {
        Long priyaId = authService.register(registerRequest("priya", "priya@example.com")).userId();
        adminService.updateKycStatus("admin", priyaId, new UpdateKycStatusRequest(KycStatus.VERIFIED));

        AccountOpeningRequestResponse submitted = bankingService.submitAccountOpeningRequest(
                "priya",
                new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("1400.00"))
        );

        assertEquals(null, submitted.approvedAccountNumber());
        assertEquals(0, bankingService.getAccountsForUser("priya").size());

        AccountOpeningRequestResponse approved = adminService.approveAccountRequest("admin", submitted.id());

        assertTrue(approved.approvedAccountNumber().matches("9\\d{9}"));
        assertEquals(1, bankingService.getAccountsForUser("priya").size());
    }

    @Test
    void registrationRejectsNonIndiaCountry() {
        assertThrows(BusinessException.class,
                () -> authService.register(registerRequest("rhea", "rhea@example.com", "United States")));
    }

    @Test
    void depositRejectsLegacyNonIndiaProfile() {
        Long samirId = authService.register(registerRequest("samir", "samir@example.com")).userId();
        String accountNumber = submitAndApproveAccount("samir", samirId, AccountType.SAVINGS, "1200.00").approvedAccountNumber();

        var profile = customerProfileRepository.findByUserUsernameIgnoreCase("samir").orElseThrow();
        profile.setCountry("Singapore");
        customerProfileRepository.save(profile);

        assertThrows(BusinessException.class,
                () -> bankingService.deposit("samir", accountNumber, new BigDecimal("100.00")));
    }

    private long extractSequence(String accountNumber) {
        return Long.parseLong(accountNumber.substring(accountNumber.length() - 5));
    }

    private AccountOpeningRequestResponse submitAndApproveAccount(String username,
                                                                  Long userId,
                                                                  AccountType accountType,
                                                                  String openingBalance) {
        adminService.updateKycStatus("admin", userId, new UpdateKycStatusRequest(KycStatus.VERIFIED));
        AccountOpeningRequestResponse request = bankingService.submitAccountOpeningRequest(
                username,
                new CreateAccountRequest(accountType, new BigDecimal(openingBalance))
        );
        return adminService.approveAccountRequest("admin", request.id());
    }

    private RegisterRequest registerRequest(String username, String email) {
        return registerRequest(username, email, "India");
    }

    private RegisterRequest registerRequest(String username, String email, String country) {
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
                country,
                LocalDate.of(1998, 1, 15)
        );
    }
}
