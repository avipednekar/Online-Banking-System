package com.onlinebanking;

import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.CreateTransferRequest;
import com.onlinebanking.dto.RegisterRequest;
import com.onlinebanking.dto.TransferReceiptResponse;
import com.onlinebanking.dto.UpdateKycStatusRequest;
import com.onlinebanking.model.AccountType;
import com.onlinebanking.model.KycStatus;
import com.onlinebanking.model.TransactionChannel;
import com.onlinebanking.model.TransferStatus;
import com.onlinebanking.repository.TransferRecordRepository;
import com.onlinebanking.service.AdminService;
import com.onlinebanking.service.AuthService;
import com.onlinebanking.service.BankingService;
import com.onlinebanking.service.BeneficiaryService;
import com.onlinebanking.service.TransferService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class TransferServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private BankingService bankingService;

    @Autowired
    private BeneficiaryService beneficiaryService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private TransferRecordRepository transferRecordRepository;

    @Test
    void idempotentTransferReplaysWithoutDoublePosting() {
        Long senderId = authService.register(registerRequest("tara", "tara@example.com")).userId();
        Long receiverId = authService.register(registerRequest("uma", "uma@example.com")).userId();

        String senderAccount = submitAndApproveAccount("tara", senderId, AccountType.SAVINGS, "5000.00");
        String receiverAccount = submitAndApproveAccount("uma", receiverId, AccountType.SAVINGS, "1000.00");
        var beneficiary = beneficiaryService.createBeneficiary("tara", new BeneficiaryRequest("Uma", "Internal Bank", receiverAccount));
        String senderAccountId = bankingService.getAccount("tara", senderAccount).accountId();

        CreateTransferRequest request = new CreateTransferRequest(
                senderAccountId,
                beneficiary.beneficiaryId(),
                new BigDecimal("750.00"),
                "INR",
                "Rent payment",
                TransactionChannel.ONLINE_BANKING
        );

        TransferReceiptResponse first = transferService.initiateTransfer("tara", request, "idem-001");
        TransferReceiptResponse second = transferService.initiateTransfer("tara", request, "idem-001");

        assertEquals(first.transferId(), second.transferId());
        assertTrue(transferRecordRepository.findByIdempotencyKey("idem-001").isPresent());
        assertEquals(new BigDecimal("4250.00"), bankingService.getAccount("tara", senderAccount).balance());
        assertEquals(new BigDecimal("1750.00"), bankingService.getAccount("uma", receiverAccount).balance());
    }

    @Test
    void highValueTransferRequiresAdminApprovalBeforePosting() {
        Long senderId = authService.register(registerRequest("vivek", "vivek@example.com")).userId();
        Long receiverId = authService.register(registerRequest("wafa", "wafa@example.com")).userId();

        String senderAccount = submitAndApproveAccount("vivek", senderId, AccountType.SAVINGS, "100000.00");
        String receiverAccount = submitAndApproveAccount("wafa", receiverId, AccountType.SAVINGS, "5000.00");
        var beneficiary = beneficiaryService.createBeneficiary("vivek", new BeneficiaryRequest("Wafa", "Internal Bank", receiverAccount));
        String senderAccountId = bankingService.getAccount("vivek", senderAccount).accountId();

        TransferReceiptResponse pending = transferService.initiateTransfer(
                "vivek",
                new CreateTransferRequest(
                        senderAccountId,
                        beneficiary.beneficiaryId(),
                        new BigDecimal("60000.00"),
                        "INR",
                        "High value transfer",
                        TransactionChannel.ONLINE_BANKING
                ),
                "idem-high-001"
        );

        assertEquals(TransferStatus.PENDING_APPROVAL, pending.status());
        assertEquals(new BigDecimal("100000.00"), bankingService.getAccount("vivek", senderAccount).balance());
        assertEquals(new BigDecimal("5000.00"), bankingService.getAccount("wafa", receiverAccount).balance());

        TransferReceiptResponse approved = transferService.approveTransfer("admin", pending.transferId());

        assertEquals(TransferStatus.POSTED, approved.status());
        assertEquals(new BigDecimal("40000.00"), bankingService.getAccount("vivek", senderAccount).balance());
        assertEquals(new BigDecimal("65000.00"), bankingService.getAccount("wafa", receiverAccount).balance());
    }

    @Test
    void parallelTransfersDoNotOverdrawBelowMinimumBalance() throws Exception {
        Long senderId = authService.register(registerRequest("xena", "xena@example.com")).userId();
        Long receiverId = authService.register(registerRequest("yash", "yash@example.com")).userId();

        String senderAccount = submitAndApproveAccount("xena", senderId, AccountType.SAVINGS, "1500.00");
        String receiverAccount = submitAndApproveAccount("yash", receiverId, AccountType.SAVINGS, "900.00");
        var beneficiary = beneficiaryService.createBeneficiary("xena", new BeneficiaryRequest("Yash", "Internal Bank", receiverAccount));
        String senderAccountId = bankingService.getAccount("xena", senderAccount).accountId();

        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        Callable<String> task = () -> {
            start.await();
            try {
                transferService.initiateTransfer(
                        "xena",
                        new CreateTransferRequest(
                                senderAccountId,
                                beneficiary.beneficiaryId(),
                                new BigDecimal("701.00"),
                                "INR",
                                "Parallel transfer",
                                TransactionChannel.ONLINE_BANKING
                        ),
                        "idem-" + Thread.currentThread().getId()
                );
                return "SUCCESS";
            } catch (Exception exception) {
                return "FAILED";
            }
        };

        Future<String> first = executorService.submit(task);
        Future<String> second = executorService.submit(task);
        start.countDown();

        List<String> outcomes = List.of(first.get(), second.get());
        executorService.shutdownNow();

        assertNotEquals(outcomes.get(0), outcomes.get(1));
        assertEquals(new BigDecimal("799.00"), bankingService.getAccount("xena", senderAccount).balance());
        assertEquals(new BigDecimal("1601.00"), bankingService.getAccount("yash", receiverAccount).balance());
    }

    private String submitAndApproveAccount(String username,
                                           Long userId,
                                           AccountType accountType,
                                           String openingBalance) {
        adminService.updateKycStatus("admin", userId, new UpdateKycStatusRequest(KycStatus.VERIFIED));
        var request = bankingService.submitAccountOpeningRequest(
                username,
                new CreateAccountRequest(accountType, new BigDecimal(openingBalance))
        );
        return adminService.approveAccountRequest("admin", request.id()).approvedAccountNumber();
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
