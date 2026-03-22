package com.onlinebanking.dto;

import com.onlinebanking.model.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 30) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(min = 3, max = 100) String fullName,
        @NotBlank @Size(min = 10, max = 20) String phoneNumber,
        @NotNull Gender gender,
        @NotBlank @Size(min = 2, max = 100) String occupation,
        @NotBlank @Size(min = 5, max = 150) String addressLine1,
        String addressLine2,
        @NotBlank @Size(min = 2, max = 80) String city,
        @NotBlank @Size(min = 2, max = 80) String state,
        @NotBlank @Size(min = 4, max = 12) String postalCode,
        @NotBlank @Size(min = 2, max = 80) String country,
        @NotNull @Past LocalDate dateOfBirth
) {
}
