package com.onlinebanking.controller;

import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryResponse;
import com.onlinebanking.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse createBeneficiary(Authentication authentication,
                                                 @Valid @RequestBody BeneficiaryRequest request) {
        return beneficiaryService.createBeneficiary(authentication.getName(), request);
    }

    @GetMapping
    public List<BeneficiaryResponse> getBeneficiaries(Authentication authentication) {
        return beneficiaryService.getBeneficiaries(authentication.getName());
    }
}
