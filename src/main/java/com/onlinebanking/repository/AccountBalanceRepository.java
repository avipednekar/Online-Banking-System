package com.onlinebanking.repository;

import com.onlinebanking.model.AccountBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface AccountBalanceRepository extends JpaRepository<AccountBalance, Long> {

    Optional<AccountBalance> findByAccountAccountId(String accountId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select balance from AccountBalance balance join fetch balance.account account where account.accountId in :accountIds order by account.accountId asc")
    List<AccountBalance> findByAccountIdsForUpdate(List<String> accountIds);
}
