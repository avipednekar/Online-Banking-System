package com.onlinebanking.controller;

import com.onlinebanking.dto.ApiResponse;
import com.onlinebanking.dto.CreateTransferRequest;
import com.onlinebanking.dto.TransferReceiptResponse;
import com.onlinebanking.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransferReceiptResponse>> createTransfer(Authentication authentication,
                                                                              @RequestHeader("Idempotency-Key") String idempotencyKey,
                                                                              @Valid @RequestBody CreateTransferRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Transfer request accepted successfully",
                transferService.initiateTransfer(authentication.getName(), request, idempotencyKey)
        ));
    }
}
