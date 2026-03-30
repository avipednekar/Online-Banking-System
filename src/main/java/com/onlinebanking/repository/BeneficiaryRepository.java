package com.onlinebanking.repository;

import com.onlinebanking.model.Beneficiary;
import com.onlinebanking.model.BeneficiaryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    boolean existsByOwnerUsernameIgnoreCaseAndAccountNumber(String username, String accountNumber);

    Optional<Beneficiary> findByOwnerUsernameIgnoreCaseAndAccountNumberAndStatus(String username,
                                                                                String accountNumber,
                                                                                BeneficiaryStatus status);

    List<Beneficiary> findByOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(String username);

    Optional<Beneficiary> findByBeneficiaryIdAndOwnerUsernameIgnoreCase(String beneficiaryId, String username);

    long countByStatus(BeneficiaryStatus status);
}
