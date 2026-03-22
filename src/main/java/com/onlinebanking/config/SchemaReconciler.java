package com.onlinebanking.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Locale;

@Component
public class SchemaReconciler {

    private static final Logger log = LoggerFactory.getLogger(SchemaReconciler.class);

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public SchemaReconciler(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void reconcile() {
        ensureColumn("accounts", "status", "varchar(20) not null default 'ACTIVE'");
        ensureColumn("accounts", "currency_code", "varchar(3) not null default 'INR'");
        ensureColumn("accounts", "updated_at", "timestamp not null default current_timestamp");
        ensureColumn("customer_profiles", "kyc_status", "varchar(20) not null default 'PENDING'");
        ensureColumn("customer_profiles", "updated_at", "timestamp not null default current_timestamp");
        ensureColumn("transactions", "transaction_reference", "varchar(255) not null default 'LEGACY-TXN'");
        ensureColumn("transactions", "status", "varchar(20) not null default 'POSTED'");
        ensureColumn("transactions", "channel", "varchar(30) not null default 'SYSTEM'");
        ensureColumn("transactions", "counterparty_account_number", "varchar(255)");
        ensureColumn("transactions", "completed_at", "timestamp");
        ensureColumn("ledger_entries", "transaction_id", "bigint");
        ensureColumn("ledger_entries", "entry_type", "varchar(20) not null default 'CREDIT'");
        ensureColumn("ledger_entries", "running_balance", "numeric(19,2) not null default 0");
        ensureColumn("ledger_entries", "narrative", "varchar(255) not null default 'Legacy ledger entry'");
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
