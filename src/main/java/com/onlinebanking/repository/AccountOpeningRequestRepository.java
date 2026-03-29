package com.onlinebanking.repository;

import com.onlinebanking.model.AccountOpeningRequest;
import com.onlinebanking.model.AccountOpeningRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountOpeningRequestRepository extends JpaRepository<AccountOpeningRequest, Long> {

    List<AccountOpeningRequest> findByRequesterUsernameIgnoreCaseOrderByCreatedAtDesc(String username);

    List<AccountOpeningRequest> findByStatusOrderByCreatedAtAsc(AccountOpeningRequestStatus status);

    long countByStatus(AccountOpeningRequestStatus status);
}
