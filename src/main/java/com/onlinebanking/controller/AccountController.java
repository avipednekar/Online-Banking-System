package com.onlinebanking.controller;

import com.onlinebanking.dto.AccountOpeningRequestResponse;
import com.onlinebanking.dto.AccountResponse;
import com.onlinebanking.dto.AmountRequest;
import com.onlinebanking.dto.ApiResponse;
import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.TransactionResponse;
import com.onlinebanking.dto.TransferRequest;
import com.onlinebanking.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AccountController {

    private final BankingService bankingService;

    public AccountController(BankingService bankingService) {
        this.bankingService = bankingService;
    }

    @PostMapping("/accounts")
    public ResponseEntity<ApiResponse<AccountOpeningRequestResponse>> createAccount(Authentication authentication,
                                                                                   @Valid @RequestBody CreateAccountRequest request) {
        AccountOpeningRequestResponse response = bankingService.submitAccountOpeningRequest(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Account opening request submitted successfully", response));
    }

    @GetMapping("/accounts/requests")
    public ResponseEntity<ApiResponse<List<AccountOpeningRequestResponse>>> getAccountRequests(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Account opening requests fetched successfully",
                bankingService.getAccountOpeningRequestsForUser(authentication.getName())
        ));
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getUserAccounts(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Accounts fetched successfully",
                bankingService.getAccountsForUser(authentication.getName())
        ));
    }

    @GetMapping("/accounts/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(Authentication authentication,
                                                                  @PathVariable String accountNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                "Account fetched successfully",
                bankingService.getAccount(authentication.getName(), accountNumber)
        ));
    }

    @PostMapping("/accounts/{accountNumber}/deposit")
    public ResponseEntity<ApiResponse<AccountResponse>> deposit(Authentication authentication,
                                                               @PathVariable String accountNumber,
                                                               @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Deposit completed successfully",
                bankingService.deposit(authentication.getName(), accountNumber, request.amount())
        ));
    }

    @PostMapping("/accounts/{accountNumber}/withdraw")
    public ResponseEntity<ApiResponse<AccountResponse>> withdraw(Authentication authentication,
                                                                @PathVariable String accountNumber,
                                                                @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Withdrawal completed successfully",
                bankingService.withdraw(authentication.getName(), accountNumber, request.amount())
        ));
    }

    @PostMapping("/accounts/transfer")
    public ResponseEntity<ApiResponse<Void>> transfer(Authentication authentication,
                                                      @Valid @RequestBody TransferRequest request) {
        bankingService.transfer(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", null));
    }

    @GetMapping("/accounts/{accountNumber}/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(Authentication authentication,
                                                                                 @PathVariable String accountNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                "Transactions fetched successfully",
                bankingService.getTransactions(authentication.getName(), accountNumber)
        ));
    }
}
