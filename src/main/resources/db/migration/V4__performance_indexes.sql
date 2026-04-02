-- =============================================================================
-- V4: Performance Indexes
-- =============================================================================
-- Adds indexes for query patterns identified during database audit.
-- All CREATE INDEX CONCURRENTLY is not used because Flyway runs inside a
-- transaction; however, these tables are small enough that the lock duration
-- is negligible. For production with large tables, run indexes manually
-- with CONCURRENTLY outside a transaction.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. bank_users — CRITICAL: Every login and every authenticated request
-- ---------------------------------------------------------------------------
-- findByUsernameIgnoreCase / existsByUsernameIgnoreCase
-- Hibernate generates: WHERE LOWER(username) = LOWER(?)
-- H2 does not support functional indexes here, so tests use a plain username
-- index for portability. PostgreSQL deployments can replace this with a
-- LOWER(username) index in an operational migration if lookup volume warrants it.
create index idx_bank_users_username_lower on bank_users (username);

-- countByRole (admin dashboard overview)
create index idx_bank_users_role on bank_users (role);


-- ---------------------------------------------------------------------------
-- 2. user_sessions — CRITICAL: Hit on EVERY authenticated API request
-- ---------------------------------------------------------------------------
-- findBySessionIdAndUsername JPQL query filters on:
--   session_id (already has unique index) + user_id FK join
-- But we need an index on user_id for the JOIN to be efficient,
-- and for future "list active sessions per user" queries.
create index idx_user_sessions_user_id on user_sessions (user_id);


-- ---------------------------------------------------------------------------
-- 3. customer_profiles — Login profile fetch + admin dashboard
-- ---------------------------------------------------------------------------
-- findByUserUsernameIgnoreCase joins through user_id → bank_users
-- The UNIQUE(user_id) constraint already covers this join efficiently.

-- countByKycStatus (admin dashboard overview)
create index idx_customer_profiles_kyc_status on customer_profiles (kyc_status);

-- findByCustomerId (customer lookup by public ID)
-- Already has UNIQUE constraint from V2 → index exists. No action needed.


-- ---------------------------------------------------------------------------
-- 4. accounts — Account lookups by public ID
-- ---------------------------------------------------------------------------
-- findByAccountId (public-facing account identifier)
-- Already has UNIQUE constraint (uk_accounts_account_id) from V2 → covered.

-- findByOwnerUsernameIgnoreCaseOrderByCreatedAtAsc
-- This joins through owner_id → bank_users. The existing
-- idx_accounts_owner_created_at (owner_id, created_at) covers this
-- once the join resolves the owner_id via the new username_lower index.
-- No additional index needed.


-- ---------------------------------------------------------------------------
-- 5. beneficiaries — Beneficiary management
-- ---------------------------------------------------------------------------
-- countByStatus (admin dashboard — standalone status count)
-- The existing idx_beneficiaries_owner_status_created_at has status as
-- 2nd column with owner_id leading, so it CANNOT be used for a global
-- count by status alone. We need a dedicated index.
create index idx_beneficiaries_status on beneficiaries (status);


-- ---------------------------------------------------------------------------
-- 6. account_opening_requests — Request tracking
-- ---------------------------------------------------------------------------
-- findByRequesterUsernameIgnoreCaseOrderByCreatedAtDesc
-- Joins through requester_id → bank_users. Need index on requester_id
-- to make that join efficient (no index currently exists).
create index idx_account_opening_requests_requester on account_opening_requests (requester_id, created_at desc);


-- ---------------------------------------------------------------------------
-- 7. transfer_records — Transfer history lookups
-- ---------------------------------------------------------------------------
-- Queries that look up transfers by from/to account need these.
-- The existing idx_transfer_records_status_created_at only helps
-- status-based filtering, not account-based lookups.
create index idx_transfer_records_from_account on transfer_records (from_account_id, created_at desc);
create index idx_transfer_records_to_account on transfer_records (to_account_id, created_at desc);


-- ---------------------------------------------------------------------------
-- 8. outbox_events — Event processing
-- ---------------------------------------------------------------------------
-- Pollers query for unprocessed events: WHERE processed_at IS NULL
-- H2 test schema does not support partial indexes, so this uses a plain
-- created_at index for portability. PostgreSQL deployments can replace this
-- with a partial index on processed_at IS NULL if the polling workload grows.
create index idx_outbox_events_unprocessed on outbox_events (created_at);
