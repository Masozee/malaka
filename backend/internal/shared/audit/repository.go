package audit

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
)

// AuditLogEntry represents a single audit log record.
type AuditLogEntry struct {
	ID          string    `json:"id" db:"id"`
	UserID      *string   `json:"user_id,omitempty" db:"user_id"`
	Method      string    `json:"method" db:"method"`
	Path        string    `json:"path" db:"path"`
	Module      string    `json:"module" db:"module"`
	Resource    string    `json:"resource" db:"resource"`
	Action      string    `json:"action" db:"action"`
	StatusCode  int       `json:"status_code" db:"status_code"`
	IPAddress   string    `json:"ip_address" db:"ip_address"`
	UserAgent   string    `json:"user_agent" db:"user_agent"`
	RequestBody *string   `json:"request_body,omitempty" db:"request_body"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// Repository provides access to audit log data.
type Repository struct {
	db *sqlx.DB
}

// NewRepository creates a new audit repository.
func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// Insert adds a new audit log entry.
func (r *Repository) Insert(ctx context.Context, entry *AuditLogEntry) error {
	query := `
		INSERT INTO audit_log (user_id, method, path, module, resource, action, status_code, ip_address, user_agent, request_body)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		entry.UserID, entry.Method, entry.Path, entry.Module, entry.Resource,
		entry.Action, entry.StatusCode, entry.IPAddress, entry.UserAgent, entry.RequestBody,
	)
	return err
}

// GetByUserID returns audit log entries for a specific user.
func (r *Repository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]AuditLogEntry, error) {
	var entries []AuditLogEntry
	query := `
		SELECT id, user_id, method, path, module, resource, action, status_code,
		       COALESCE(ip_address, '') as ip_address, COALESCE(user_agent, '') as user_agent,
		       request_body, created_at
		FROM audit_log
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	err := r.db.SelectContext(ctx, &entries, query, userID, limit, offset)
	return entries, err
}

// GetAll returns all audit log entries.
func (r *Repository) GetAll(ctx context.Context, limit, offset int) ([]AuditLogEntry, error) {
	var entries []AuditLogEntry
	query := `
		SELECT id, user_id, method, path, module, resource, action, status_code,
		       COALESCE(ip_address, '') as ip_address, COALESCE(user_agent, '') as user_agent,
		       request_body, created_at
		FROM audit_log
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	err := r.db.SelectContext(ctx, &entries, query, limit, offset)
	return entries, err
}
