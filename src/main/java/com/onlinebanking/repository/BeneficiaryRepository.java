package com.onlinebanking.repository;

import com.onlinebanking.model.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    boolean existsByOwnerUsernameIgnoreCaseAndAccountNumber(String username, String accountNumber);

    Optional<Beneficiary> findByOwnerUsernameIgnoreCaseAndAccountNumberAndActiveTrue(String username, String accountNumber);

    List<Beneficiary> findByOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
}
