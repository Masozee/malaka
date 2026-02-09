-- +goose Up
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    module VARCHAR(50),
    resource VARCHAR(100),
    action VARCHAR(50),
    status_code INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    request_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_module ON audit_log(module);

-- +goose Down
DROP TABLE IF EXISTS audit_log;
