package com.onlinebanking.config;

import com.onlinebanking.model.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataResetBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataResetBootstrap.class);

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.reset-user-data-on-startup:true}")
    private boolean resetUserDataOnStartup;

    public DataResetBootstrap(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!resetUserDataOnStartup) {
            return;
        }

        jdbcTemplate.execute("delete from ledger_entries");
        jdbcTemplate.execute("delete from transactions");
        jdbcTemplate.execute("delete from beneficiaries");
        jdbcTemplate.execute("delete from accounts");
        jdbcTemplate.execute("delete from audit_logs");
        jdbcTemplate.execute("delete from customer_profiles");
        jdbcTemplate.execute("delete from customer_addresses");
        jdbcTemplate.execute("delete from account_number_sequences");
        jdbcTemplate.execute("delete from banks");
        jdbcTemplate.update("delete from bank_users where role <> ?", UserRole.ADMIN.name());

        log.warn("Reset all customer-owned data on startup. Set app.reset-user-data-on-startup=false after the clean restart.");
    }
}
