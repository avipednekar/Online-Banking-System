package com.onlinebanking.dto;

import com.onlinebanking.model.KycStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateKycStatusRequest(
        @NotNull KycStatus kycStatus
) {
}
