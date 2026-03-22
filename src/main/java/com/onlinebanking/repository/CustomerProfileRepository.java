package com.onlinebanking.repository;

import com.onlinebanking.model.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findByUserUsernameIgnoreCase(String username);
}
