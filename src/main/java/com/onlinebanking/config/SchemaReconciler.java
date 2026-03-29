package com.onlinebanking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;
import java.util.Map;

import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

@Component
@Order(0)
public class SchemaReconciler implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaReconciler.class);

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public SchemaReconciler(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureColumn("accounts", "status", "varchar(20) not null default 'ACTIVE'");
        ensureColumn("accounts", "currency_code", "varchar(3) not null default 'INR'");
        ensureColumn("accounts", "updated_at", "timestamp not null default current_timestamp");
        ensureColumn("customer_profiles", "kyc_status", "varchar(20) not null default 'PENDING'");
        ensureColumn("customer_profiles", "updated_at", "timestamp not null default current_timestamp");
        ensureColumn("customer_profiles", "address_id", "bigint");
        relaxLegacyColumn("customer_profiles", "address_line1");
        relaxLegacyColumn("customer_profiles", "city");
        relaxLegacyColumn("customer_profiles", "state");
        relaxLegacyColumn("customer_profiles", "postal_code");
        relaxLegacyColumn("customer_profiles", "country");
        ensureColumn("transactions", "transaction_reference", "varchar(255) not null default 'LEGACY-TXN'");
        ensureColumn("transactions", "status", "varchar(20) not null default 'POSTED'");
        ensureColumn("transactions", "channel", "varchar(30) not null default 'SYSTEM'");
        ensureColumn("transactions", "counterparty_account_number", "varchar(255)");
        ensureColumn("transactions", "completed_at", "timestamp");
        ensureColumn("ledger_entries", "transaction_id", "bigint");
        ensureColumn("ledger_entries", "entry_type", "varchar(20) not null default 'CREDIT'");
        ensureColumn("ledger_entries", "running_balance", "numeric(19,2) not null default 0");
        ensureColumn("ledger_entries", "narrative", "varchar(255) not null default 'Legacy ledger entry'");
        relaxLegacyColumn("ledger_entries", "account_id");
        relaxLegacyColumn("beneficiaries", "bank_name");
        migrateCustomerAddresses();
    }

    private void ensureColumn(String tableName, String columnName, String definition) {
        try (Connection connection = dataSource.getConnection()) {
            if (!tableExists(connection, tableName)) {
                return;
            }
            if (columnExists(connection, tableName, columnName)) {
                return;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to inspect schema for " + tableName + "." + columnName, exception);
        }

        String statement = "alter table " + tableName + " add column " + columnName + " " + definition;
        jdbcTemplate.execute(statement);
        log.info("Applied legacy schema patch: {}", statement);
    }

    private void relaxLegacyColumn(String tableName, String columnName) {
        try (Connection connection = dataSource.getConnection()) {
            if (!tableExists(connection, tableName) || !columnExists(connection, tableName, columnName)) {
                return;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to inspect legacy column constraint for " + tableName + "." + columnName, exception);
        }

        String statement = "alter table " + tableName + " alter column " + columnName + " drop not null";
        try {
            jdbcTemplate.execute(statement);
            log.info("Relaxed legacy not-null constraint: {}", statement);
        } catch (RuntimeException exception) {
            log.debug("Legacy not-null relaxation skipped for {}.{}: {}", tableName, columnName, exception.getMessage());
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        String catalog = connection.getCatalog();
        String schema = connection.getSchema();

        return hasTable(metaData, catalog, schema, tableName)
                || hasTable(metaData, catalog, schema, tableName.toUpperCase(Locale.ROOT))
                || hasTable(metaData, catalog, schema, tableName.toLowerCase(Locale.ROOT));
    }

    private boolean columnExists(Connection connection, String tableName, String columnName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        String catalog = connection.getCatalog();
        String schema = connection.getSchema();

        return hasColumn(metaData, catalog, schema, tableName, columnName)
                || hasColumn(metaData, catalog, schema,
                tableName.toUpperCase(Locale.ROOT), columnName.toUpperCase(Locale.ROOT))
                || hasColumn(metaData, catalog, schema,
                tableName.toLowerCase(Locale.ROOT), columnName.toLowerCase(Locale.ROOT));
    }

    private void migrateCustomerAddresses() {
        try (Connection connection = dataSource.getConnection()) {
            if (!tableExists(connection, "customer_profiles")
                    || !tableExists(connection, "customer_addresses")
                    || !columnExists(connection, "customer_profiles", "address_id")
                    || !columnExists(connection, "customer_profiles", "address_line1")
                    || !columnExists(connection, "customer_profiles", "city")
                    || !columnExists(connection, "customer_profiles", "state")
                    || !columnExists(connection, "customer_profiles", "postal_code")
                    || !columnExists(connection, "customer_profiles", "country")) {
                return;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to inspect legacy customer profile address columns", exception);
        }

        for (Map<String, Object> row : jdbcTemplate.queryForList("""
                select id, address_line1, address_line2, city, state, postal_code, country
                from customer_profiles
                where address_id is null
                  and address_line1 is not null
                  and city is not null
                  and state is not null
                  and postal_code is not null
                  and country is not null
                """)) {
            Long addressId = insertCustomerAddress(row);
            jdbcTemplate.update("update customer_profiles set address_id = ? where id = ?", addressId, row.get("id"));
        }
    }

    private Long insertCustomerAddress(Map<String, Object> row) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    insert into customer_addresses (
                        address_line1, address_line2, city, state, postal_code, country, created_at, updated_at
                    ) values (?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, getTrimmedValue(row.get("address_line1")));
            statement.setString(2, getTrimmedValue(row.get("address_line2")));
            statement.setString(3, getTrimmedValue(row.get("city")));
            statement.setString(4, getTrimmedValue(row.get("state")));
            statement.setString(5, getTrimmedValue(row.get("postal_code")));
            statement.setString(6, getTrimmedValue(row.get("country")));
            return statement;
        }, keyHolder);
        return extractGeneratedId(keyHolder, "customer address");
    }

    private Long extractGeneratedId(KeyHolder keyHolder, String entityName) {
        Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            Object id = keys.get("id");
            if (id == null) {
                id = keys.get("ID");
            }
            if (id instanceof Number number) {
                return number.longValue();
            }
        }

        Number key;
        try {
            key = keyHolder.getKey();
        } catch (org.springframework.dao.InvalidDataAccessApiUsageException exception) {
            throw new IllegalStateException("Failed to resolve generated id for legacy " + entityName + " row", exception);
        }

        if (key == null) {
            throw new IllegalStateException("Failed to create legacy " + entityName + " row");
        }
        return key.longValue();
    }

    private String getTrimmedValue(Object value) {
        return value == null ? null : value.toString().trim();
    }

    private boolean hasTable(DatabaseMetaData metaData,
                             String catalog,
                             String schema,
                             String tableName) throws SQLException {
        try (ResultSet tables = metaData.getTables(catalog, schema, tableName, new String[]{"TABLE"})) {
            return tables.next();
        }
    }

    private boolean hasColumn(DatabaseMetaData metaData,
                              String catalog,
                              String schema,
                              String tableName,
                              String columnName) throws SQLException {
        try (ResultSet columns = metaData.getColumns(catalog, schema, tableName, columnName)) {
            return columns.next();
        }
    }
}
