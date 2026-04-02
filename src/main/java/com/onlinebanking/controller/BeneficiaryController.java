package com.onlinebanking.controller;

import com.onlinebanking.dto.ApiResponse;
import com.onlinebanking.dto.BeneficiaryLookupResponse;
import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryResponse;
import com.onlinebanking.service.BeneficiaryService;
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
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> createBeneficiary(Authentication authentication,
                                                                             @Valid @RequestBody BeneficiaryRequest request) {
        BeneficiaryResponse response = beneficiaryService.createBeneficiary(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Beneficiary created successfully", response));
    }

    @GetMapping("/lookup/{accountNumber}")
    public ResponseEntity<ApiResponse<BeneficiaryLookupResponse>> lookupBeneficiary(Authentication authentication,
                                                                                    @PathVariable String accountNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                "Beneficiary account verified successfully",
                beneficiaryService.lookupBeneficiary(authentication.getName(), accountNumber)
        ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Beneficiaries fetched successfully",
                beneficiaryService.getBeneficiaries(authentication.getName())
        ));
    }
}
