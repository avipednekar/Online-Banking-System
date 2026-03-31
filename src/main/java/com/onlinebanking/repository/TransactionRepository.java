package com.onlinebanking.repository;

import com.onlinebanking.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountAccountNumberOrderByCreatedAtDesc(String accountNumber);

    Page<Transaction> findByAccountAccountNumber(String accountNumber, Pageable pageable);

    long countByAccountAccountNumber(String accountNumber);
}
