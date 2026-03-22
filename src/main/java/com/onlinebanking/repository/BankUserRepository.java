package com.onlinebanking.repository;

import com.onlinebanking.model.BankUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankUserRepository extends JpaRepository<BankUser, Long> {

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    Optional<BankUser> findByUsernameIgnoreCase(String username);
}
