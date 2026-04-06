package com.onlinebanking.repository;

import com.onlinebanking.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    boolean existsByAccountNumber(String accountNumber);

    Optional<Account> findByAccountNumber(String accountNumber);

    Optional<Account> findByAccountId(String accountId);

    List<Account> findByOwnerIdOrderByCreatedAtAsc(Long ownerId);

    List<Account> findByOwnerUsernameIgnoreCaseOrderByCreatedAtAsc(String username);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Account a SET a.balance = :balance, a.updatedAt = CURRENT_TIMESTAMP WHERE a.accountId = :accountId")
    void updateBalance(@org.springframework.data.repository.query.Param("accountId") String accountId, @org.springframework.data.repository.query.Param("balance") java.math.BigDecimal balance);
}
