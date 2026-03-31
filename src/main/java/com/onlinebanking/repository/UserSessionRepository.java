package com.onlinebanking.repository;

import com.onlinebanking.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findByRefreshTokenHash(String refreshTokenHash);

    @Query("""
            select userSession
            from UserSession userSession
            join fetch userSession.user bankUser
            where userSession.sessionId = :sessionId
              and lower(bankUser.username) = lower(:username)
            """)
    Optional<UserSession> findBySessionIdAndUsername(@Param("sessionId") String sessionId,
                                                     @Param("username") String username);
}
