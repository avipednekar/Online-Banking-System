package com.onlinebanking.repository;

import com.onlinebanking.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountAccountNumberOrderByCreatedAtDesc(String accountNumber);

    long countByAccountAccountNumber(String accountNumber);
}
