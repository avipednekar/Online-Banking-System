package com.onlinebanking.controller;

import com.onlinebanking.dto.AccountResponse;
import com.onlinebanking.dto.AmountRequest;
import com.onlinebanking.dto.CreateAccountRequest;
import com.onlinebanking.dto.TransactionResponse;
import com.onlinebanking.dto.TransferRequest;
import com.onlinebanking.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(Authentication authentication,
                                         @Valid @RequestBody CreateAccountRequest request) {
        return bankingService.createAccount(authentication.getName(), request);
    }

    @GetMapping("/accounts")
    public List<AccountResponse> getUserAccounts(Authentication authentication) {
        return bankingService.getAccountsForUser(authentication.getName());
    }

    @GetMapping("/accounts/{accountNumber}")
    public AccountResponse getAccount(Authentication authentication,
                                      @PathVariable String accountNumber) {
        return bankingService.getAccount(authentication.getName(), accountNumber);
    }

    @PostMapping("/accounts/{accountNumber}/deposit")
    public AccountResponse deposit(Authentication authentication,
                                   @PathVariable String accountNumber,
                                   @Valid @RequestBody AmountRequest request) {
        return bankingService.deposit(authentication.getName(), accountNumber, request.amount());
    }

    @PostMapping("/accounts/{accountNumber}/withdraw")
    public AccountResponse withdraw(Authentication authentication,
                                    @PathVariable String accountNumber,
                                    @Valid @RequestBody AmountRequest request) {
        return bankingService.withdraw(authentication.getName(), accountNumber, request.amount());
    }

    @PostMapping("/accounts/transfer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void transfer(Authentication authentication,
                         @Valid @RequestBody TransferRequest request) {
        bankingService.transfer(authentication.getName(), request);
    }

    @GetMapping("/accounts/{accountNumber}/transactions")
    public List<TransactionResponse> getTransactions(Authentication authentication,
                                                     @PathVariable String accountNumber) {
        return bankingService.getTransactions(authentication.getName(), accountNumber);
    }
}
