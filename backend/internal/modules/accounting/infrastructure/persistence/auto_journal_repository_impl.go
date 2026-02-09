package persistence

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

type autoJournalRepositoryImpl struct {
	db *sql.DB
}

// NewAutoJournalConfigRepository creates a new auto journal config repository
func NewAutoJournalConfigRepository(db *sql.DB) repositories.AutoJournalConfigRepository {
	return &autoJournalRepositoryImpl{db: db}
}

// Configuration CRUD operations

// Create creates a new auto journal configuration
func (r *autoJournalRepositoryImpl) Create(ctx context.Context, config *entities.AutoJournalConfig) error {
	if config.ID == uuid.Nil {
		config.ID = uuid.New()
	}
	
	now := time.Now()
	config.CreatedAt = now
	config.UpdatedAt = now
	
	// Convert account mapping to JSON
	mappingJSON, err := json.Marshal(config.AccountMapping)
	if err != nil {
		return err
	}
	
	query := `
		INSERT INTO auto_journal_config (
			id, source_module, transaction_type, account_mapping, is_active,
			description, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	
	_, err = r.db.ExecContext(ctx, query,
		config.ID, config.SourceModule, config.TransactionType, string(mappingJSON),
		config.IsActive, config.Description, config.CreatedAt, config.UpdatedAt,
	)
	
	return err
}

// GetByID retrieves an auto journal configuration by ID
func (r *autoJournalRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.AutoJournalConfig, error) {
	config := &entities.AutoJournalConfig{}
	var mappingJSON string
	
	query := `
		SELECT id, source_module, transaction_type, account_mapping, is_active,
			   description, created_at, updated_at
		FROM auto_journal_config WHERE id = $1`
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&config.ID, &config.SourceModule, &config.TransactionType, &mappingJSON,
		&config.IsActive, &config.Description, &config.CreatedAt, &config.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	// Parse account mapping JSON
	err = json.Unmarshal([]byte(mappingJSON), &config.AccountMapping)
	if err != nil {
		return nil, err
	}
	
	return config, nil
}

// GetBySourceAndType retrieves an auto journal configuration by source module and transaction type
func (r *autoJournalRepositoryImpl) GetBySourceAndType(ctx context.Context, sourceModule, transactionType string) (*entities.AutoJournalConfig, error) {
	config := &entities.AutoJournalConfig{}
	var mappingJSON string
	
	query := `
		SELECT id, source_module, transaction_type, account_mapping, is_active,
			   description, created_at, updated_at
		FROM auto_journal_config 
		WHERE source_module = $1 AND transaction_type = $2`
	
	err := r.db.QueryRowContext(ctx, query, sourceModule, transactionType).Scan(
		&config.ID, &config.SourceModule, &config.TransactionType, &mappingJSON,
		&config.IsActive, &config.Description, &config.CreatedAt, &config.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	// Parse account mapping JSON
	err = json.Unmarshal([]byte(mappingJSON), &config.AccountMapping)
	if err != nil {
		return nil, err
	}
	
	return config, nil
}

// GetAll retrieves all auto journal configurations
func (r *autoJournalRepositoryImpl) GetAll(ctx context.Context) ([]*entities.AutoJournalConfig, error) {
	query := `
		SELECT id, source_module, transaction_type, account_mapping, is_active,
			   description, created_at, updated_at
		FROM auto_journal_config 
		ORDER BY source_module, transaction_type`
	
	return r.queryConfigs(ctx, query)
}

// GetBySourceModule retrieves all configurations for a source module
func (r *autoJournalRepositoryImpl) GetBySourceModule(ctx context.Context, sourceModule string) ([]*entities.AutoJournalConfig, error) {
	query := `
		SELECT id, source_module, transaction_type, account_mapping, is_active,
			   description, created_at, updated_at
		FROM auto_journal_config 
		WHERE source_module = $1
		ORDER BY transaction_type`
	
	return r.queryConfigs(ctx, query, sourceModule)
}

// GetActiveConfigs retrieves all active auto journal configurations  
func (r *autoJournalRepositoryImpl) GetActiveConfigs(ctx context.Context) ([]*entities.AutoJournalConfig, error) {
	query := `
		SELECT id, source_module, transaction_type, account_mapping, is_active,
			   description, created_at, updated_at
		FROM auto_journal_config 
		WHERE is_active = true
		ORDER BY source_module, transaction_type`
	
	return r.queryConfigs(ctx, query)
}

// Update updates an auto journal configuration
func (r *autoJournalRepositoryImpl) Update(ctx context.Context, config *entities.AutoJournalConfig) error {
	config.UpdatedAt = time.Now()
	
	// Convert account mapping to JSON
	mappingJSON, err := json.Marshal(config.AccountMapping)
	if err != nil {
		return err
	}
	
	query := `
		UPDATE auto_journal_config SET
			account_mapping = $2, is_active = $3, description = $4, updated_at = $5
		WHERE id = $1`
	
	_, err = r.db.ExecContext(ctx, query,
		config.ID, string(mappingJSON), config.IsActive, config.Description, config.UpdatedAt,
	)
	
	return err
}

// Delete deletes an auto journal configuration
func (r *autoJournalRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM auto_journal_config WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// Upsert creates or updates an auto journal configuration
func (r *autoJournalRepositoryImpl) Upsert(ctx context.Context, config *entities.AutoJournalConfig) error {
	// Try to get existing config
	existing, err := r.GetBySourceAndType(ctx, config.SourceModule, config.TransactionType)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	
	if existing != nil {
		// Update existing
		config.ID = existing.ID
		config.CreatedAt = existing.CreatedAt
		return r.Update(ctx, config)
	} else {
		// Create new
		return r.Create(ctx, config)
	}
}

// Log operations

// CreateLog creates a new auto journal log entry
func (r *autoJournalRepositoryImpl) CreateLog(ctx context.Context, log *entities.AutoJournalLog) error {
	if log.ID == uuid.Nil {
		log.ID = uuid.New()
	}
	
	now := time.Now()
	log.CreatedAt = now
	log.UpdatedAt = now
	
	query := `
		INSERT INTO auto_journal_log (
			id, source_module, source_id, transaction_type, journal_entry_id,
			status, processing_message, error_details, processed_at,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	
	_, err := r.db.ExecContext(ctx, query,
		log.ID, log.SourceModule, log.SourceID, log.TransactionType, log.JournalEntryID,
		log.Status, log.ProcessingMessage, log.ErrorDetails, log.ProcessedAt,
		log.CreatedAt, log.UpdatedAt,
	)
	
	return err
}

// GetLogByID retrieves an auto journal log by ID
func (r *autoJournalRepositoryImpl) GetLogByID(ctx context.Context, id uuid.ID) (*entities.AutoJournalLog, error) {
	log := &entities.AutoJournalLog{}
	
	query := `
		SELECT id, source_module, source_id, transaction_type, journal_entry_id,
			   status, processing_message, error_details, processed_at,
			   created_at, updated_at
		FROM auto_journal_log WHERE id = $1`
	
	var journalEntryID sql.NullString
	var processedAt sql.NullTime
	var errorDetails sql.NullString
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&log.ID, &log.SourceModule, &log.SourceID, &log.TransactionType, &journalEntryID,
		&log.Status, &log.ProcessingMessage, &errorDetails, &processedAt,
		&log.CreatedAt, &log.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	// Handle nullable fields
	if journalEntryID.Valid {
		id, _ := uuid.Parse(journalEntryID.String)
		log.JournalEntryID = &id
	}
	if processedAt.Valid {
		log.ProcessedAt = &processedAt.Time
	}
	if errorDetails.Valid {
		log.ErrorDetails = errorDetails.String
	}
	
	return log, nil
}

// GetLogsByJournalEntry retrieves logs associated with a journal entry
func (r *autoJournalRepositoryImpl) GetLogsByJournalEntry(ctx context.Context, journalEntryID uuid.ID) ([]*entities.AutoJournalLog, error) {
	query := `
		SELECT id, source_module, source_id, transaction_type, journal_entry_id,
			   status, processing_message, error_details, processed_at,
			   created_at, updated_at
		FROM auto_journal_log 
		WHERE journal_entry_id = $1
		ORDER BY created_at DESC`
	
	return r.queryLogs(ctx, query, journalEntryID)
}

// GetLogsBySource retrieves logs by source module and source ID
func (r *autoJournalRepositoryImpl) GetLogsBySource(ctx context.Context, sourceModule, sourceID string) ([]*entities.AutoJournalLog, error) {
	query := `
		SELECT id, source_module, source_id, transaction_type, journal_entry_id,
			   status, processing_message, error_details, processed_at,
			   created_at, updated_at
		FROM auto_journal_log 
		WHERE source_module = $1 AND source_id = $2
		ORDER BY created_at DESC`
	
	return r.queryLogs(ctx, query, sourceModule, sourceID)
}

// GetLogsByStatus retrieves logs by processing status
func (r *autoJournalRepositoryImpl) GetLogsByStatus(ctx context.Context, status string) ([]*entities.AutoJournalLog, error) {
	query := `
		SELECT id, source_module, source_id, transaction_type, journal_entry_id,
			   status, processing_message, error_details, processed_at,
			   created_at, updated_at
		FROM auto_journal_log 
		WHERE status = $1
		ORDER BY created_at DESC`
	
	return r.queryLogs(ctx, query, status)
}

// GetPendingLogs retrieves pending logs for a source module
func (r *autoJournalRepositoryImpl) GetPendingLogs(ctx context.Context, sourceModule string) ([]*entities.AutoJournalLog, error) {
	query := `
		SELECT id, source_module, source_id, transaction_type, journal_entry_id,
			   status, processing_message, error_details, processed_at,
			   created_at, updated_at
		FROM auto_journal_log 
		WHERE source_module = $1 AND status = $2
		ORDER BY created_at ASC`
	
	return r.queryLogs(ctx, query, sourceModule, entities.AutoJournalLogStatusPending)
}

// UpdateLogStatus updates the status of an auto journal log
func (r *autoJournalRepositoryImpl) UpdateLogStatus(ctx context.Context, logID uuid.ID, status, errorMessage string) error {
	now := time.Now()
	
	query := `
		UPDATE auto_journal_log SET
			status = $2, error_details = $3, processed_at = $4, updated_at = $5
		WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query, logID, status, errorMessage, now, now)
	return err
}

// Helper methods

// queryConfigs is a helper method to query multiple config entries
func (r *autoJournalRepositoryImpl) queryConfigs(ctx context.Context, query string, args ...interface{}) ([]*entities.AutoJournalConfig, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var configs []*entities.AutoJournalConfig
	for rows.Next() {
		config := &entities.AutoJournalConfig{}
		var mappingJSON string
		
		err := rows.Scan(
			&config.ID, &config.SourceModule, &config.TransactionType, &mappingJSON,
			&config.IsActive, &config.Description, &config.CreatedAt, &config.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Parse account mapping JSON
		err = json.Unmarshal([]byte(mappingJSON), &config.AccountMapping)
		if err != nil {
			return nil, err
		}
		
		configs = append(configs, config)
	}
	
	return configs, rows.Err()
}

// queryLogs is a helper method to query multiple log entries
func (r *autoJournalRepositoryImpl) queryLogs(ctx context.Context, query string, args ...interface{}) ([]*entities.AutoJournalLog, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var logs []*entities.AutoJournalLog
	for rows.Next() {
		log := &entities.AutoJournalLog{}
		var journalEntryID sql.NullString
		var processedAt sql.NullTime
		var errorDetails sql.NullString
		
		err := rows.Scan(
			&log.ID, &log.SourceModule, &log.SourceID, &log.TransactionType, &journalEntryID,
			&log.Status, &log.ProcessingMessage, &errorDetails, &processedAt,
			&log.CreatedAt, &log.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Handle nullable fields
		if journalEntryID.Valid {
			id, _ := uuid.Parse(journalEntryID.String)
			log.JournalEntryID = &id
		}
		if processedAt.Valid {
			log.ProcessedAt = &processedAt.Time
		}
		if errorDetails.Valid {
			log.ErrorDetails = errorDetails.String
		}
		
		logs = append(logs, log)
	}
	
	return logs, rows.Err()
}