package com.onlinebanking.controller;

import com.onlinebanking.dto.AdminCustomerResponse;
import com.onlinebanking.dto.AdminOverviewResponse;
import com.onlinebanking.dto.AccountOpeningRequestResponse;
import com.onlinebanking.dto.ApiResponse;
import com.onlinebanking.dto.TransferReceiptResponse;
import com.onlinebanking.dto.UpdateKycStatusRequest;
import com.onlinebanking.service.AdminService;
import com.onlinebanking.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final TransferService transferService;

    public AdminController(AdminService adminService, TransferService transferService) {
        this.adminService = adminService;
        this.transferService = transferService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success("Admin overview fetched successfully", adminService.getOverview()));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<AdminCustomerResponse>>> getCustomers() {
        return ResponseEntity.ok(ApiResponse.success("Customers fetched successfully", adminService.getCustomers()));
    }

    @GetMapping("/account-requests")
    public ResponseEntity<ApiResponse<List<AccountOpeningRequestResponse>>> getPendingAccountRequests() {
        return ResponseEntity.ok(ApiResponse.success(
                "Pending account opening requests fetched successfully",
                adminService.getPendingAccountRequests()
        ));
    }

    @PatchMapping("/customers/{userId}/kyc")
    public ResponseEntity<ApiResponse<AdminCustomerResponse>> updateKycStatus(Authentication authentication,
                                                                             @PathVariable Long userId,
                                                                             @Valid @RequestBody UpdateKycStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "KYC status updated successfully",
                adminService.updateKycStatus(authentication.getName(), userId, request)
        ));
    }

    @PatchMapping("/account-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<AccountOpeningRequestResponse>> approveAccountRequest(Authentication authentication,
                                                                                           @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Account opening request approved successfully",
                adminService.approveAccountRequest(authentication.getName(), requestId)
        ));
    }

    @PatchMapping("/transfers/{transferId}/approve")
    public ResponseEntity<ApiResponse<TransferReceiptResponse>> approveTransfer(Authentication authentication,
                                                                               @PathVariable String transferId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Transfer approved successfully",
                transferService.approveTransfer(authentication.getName(), transferId)
        ));
    }
}
