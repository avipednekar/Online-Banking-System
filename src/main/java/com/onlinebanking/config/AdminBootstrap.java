package com.onlinebanking.config;

import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.UserRole;
import com.onlinebanking.repository.BankUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final BankUserRepository bankUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.email:admin@onlinebanking.local}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    public AdminBootstrap(BankUserRepository bankUserRepository, PasswordEncoder passwordEncoder) {
        this.bankUserRepository = bankUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (bankUserRepository.findByUsernameIgnoreCase(adminUsername).isPresent()) {
            return;
        }

        BankUser adminUser = new BankUser(
                adminUsername.trim(),
                adminEmail.trim(),
                passwordEncoder.encode(adminPassword)
        );
        adminUser.setRole(UserRole.ADMIN);
        bankUserRepository.save(adminUser);
        log.info("Bootstrapped central admin user '{}'. Override app.admin.* in environment for non-demo usage.", adminUsername);
    }
}
