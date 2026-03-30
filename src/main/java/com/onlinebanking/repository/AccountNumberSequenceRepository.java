package com.onlinebanking.repository;

import com.onlinebanking.model.AccountNumberSequence;
import com.onlinebanking.model.AccountType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface AccountNumberSequenceRepository extends JpaRepository<AccountNumberSequence, AccountType> {

    @Override
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<AccountNumberSequence> findById(AccountType accountType);
}
