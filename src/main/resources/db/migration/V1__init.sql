CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_cost NUMERIC(12,2),
    location VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    assignee_user_id BIGINT NOT NULL,
    assigned_by BIGINT,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP,
    notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON asset_assignments(assignee_user_id);
-- enforce only one ACTIVE (returned_at IS NULL) assignment per asset
CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_active_asset
    ON asset_assignments(asset_id) WHERE returned_at IS NULL;

CREATE TABLE IF NOT EXISTS asset_status_log (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by BIGINT,
    reason TEXT,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_status_log_asset ON asset_status_log(asset_id);
