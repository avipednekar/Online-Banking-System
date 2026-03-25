package com.onlinebanking.dto;

import com.onlinebanking.model.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 30)
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Username may contain only letters, numbers, dots, underscores, and hyphens")
        String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(min = 3, max = 100) String fullName,
        @NotBlank @Size(min = 10, max = 20)
        @Pattern(regexp = "^[0-9+()\\- ]+$", message = "Phone number contains invalid characters")
        String phoneNumber,
        @NotNull Gender gender,
        @NotBlank @Size(min = 2, max = 100) String occupation,
        @NotBlank @Size(min = 5, max = 150) String addressLine1,
        String addressLine2,
        @NotBlank @Size(min = 2, max = 80) String city,
        @NotBlank @Size(min = 2, max = 80) String state,
        @NotBlank @Size(min = 4, max = 12)
        @Pattern(regexp = "^[A-Za-z0-9 -]+$", message = "Postal code contains invalid characters")
        String postalCode,
        @NotBlank @Size(min = 2, max = 80) String country,
        @NotNull @Past LocalDate dateOfBirth
) {
}
