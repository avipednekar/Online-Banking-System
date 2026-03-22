package com.onlinebanking.controller;

import com.onlinebanking.dto.AdminCustomerResponse;
import com.onlinebanking.dto.AdminOverviewResponse;
import com.onlinebanking.dto.UpdateKycStatusRequest;
import com.onlinebanking.service.AdminService;
import jakarta.validation.Valid;
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

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public AdminOverviewResponse getOverview() {
        return adminService.getOverview();
    }

    @GetMapping("/customers")
    public List<AdminCustomerResponse> getCustomers() {
        return adminService.getCustomers();
    }

    @PatchMapping("/customers/{userId}/kyc")
    public AdminCustomerResponse updateKycStatus(Authentication authentication,
                                                 @PathVariable Long userId,
                                                 @Valid @RequestBody UpdateKycStatusRequest request) {
        return adminService.updateKycStatus(authentication.getName(), userId, request);
    }
}
