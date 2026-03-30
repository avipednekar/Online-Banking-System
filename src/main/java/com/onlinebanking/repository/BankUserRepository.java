package com.onlinebanking.repository;

import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankUserRepository extends JpaRepository<BankUser, Long> {

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailHash(String emailHash);

    Optional<BankUser> findByUsernameIgnoreCase(String username);

    long countByRole(UserRole role);
}
