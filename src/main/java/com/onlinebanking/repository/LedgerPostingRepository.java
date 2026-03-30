package com.onlinebanking.repository;

import com.onlinebanking.model.LedgerPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerPostingRepository extends JpaRepository<LedgerPosting, Long> {

    List<LedgerPosting> findByAccountAccountIdOrderByCreatedAtDesc(String accountId);
}
