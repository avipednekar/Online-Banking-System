package com.onlinebanking.repository;

import com.onlinebanking.model.Bank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankRepository extends JpaRepository<Bank, Long> {

    Optional<Bank> findByBankNameIgnoreCase(String bankName);
}
