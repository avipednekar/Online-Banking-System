package com.onlinebanking.repository;

import com.onlinebanking.model.AccountNumberSequence;
import com.onlinebanking.model.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountNumberSequenceRepository extends JpaRepository<AccountNumberSequence, AccountType> {
}
