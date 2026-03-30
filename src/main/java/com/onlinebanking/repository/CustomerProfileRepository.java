package com.onlinebanking.repository;

import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.model.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findByUserUsernameIgnoreCase(String username);

    Optional<CustomerProfile> findByUserId(Long userId);

    Optional<CustomerProfile> findByCustomerId(String customerId);

    List<CustomerProfile> findAllByOrderByCreatedAtDesc();

    long countByKycStatus(KycStatus kycStatus);
}
