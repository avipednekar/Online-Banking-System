package com.onlinebanking.repository;

import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.model.KycStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findByUserUsernameIgnoreCase(String username);

    Optional<CustomerProfile> findByUserId(Long userId);

    Optional<CustomerProfile> findByCustomerId(String customerId);

    List<CustomerProfile> findAllByOrderByCreatedAtDesc();

    Page<CustomerProfile> findAll(Pageable pageable);

    long countByKycStatus(KycStatus kycStatus);

    @Query("""
            select cp
            from CustomerProfile cp
            join cp.user u
            where (:kycStatus is null or cp.kycStatus = :kycStatus)
              and (
                    :queryBlank = true
                    or lower(u.username) like lower(concat('%', :query, '%'))
                    or lower(cp.customerId) like lower(concat('%', :query, '%'))
                    or (:emailHash is not null and u.emailHash = :emailHash)
                    or (:phoneHash is not null and cp.phoneNumberHash = :phoneHash)
              )
            """)
    Page<CustomerProfile> searchAdminCustomers(
            @Param("query") String query,
            @Param("queryBlank") boolean queryBlank,
            @Param("emailHash") String emailHash,
            @Param("phoneHash") String phoneHash,
            @Param("kycStatus") KycStatus kycStatus,
            Pageable pageable
    );
}
