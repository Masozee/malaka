package entities

import (
	"time"

	"github.com/google/uuid"
)

// AutoJournalConfig represents configuration for automatic journal entry creation
type AutoJournalConfig struct {
	ID              uuid.UUID              `json:"id" db:"id"`
	SourceModule    string                 `json:"source_module" db:"source_module"`
	TransactionType string                 `json:"transaction_type" db:"transaction_type"`
	AccountMapping  map[string]interface{} `json:"account_mapping" db:"account_mapping"`
	IsActive        bool                   `json:"is_active" db:"is_active"`
	Description     string                 `json:"description" db:"description"`
	CreatedAt       time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time              `json:"updated_at" db:"updated_at"`
}

// AutoJournalLogStatus represents the status of auto journal processing
type AutoJournalLogStatus string

const (
	AutoJournalLogStatusPending    AutoJournalLogStatus = "PENDING"
	AutoJournalLogStatusProcessing AutoJournalLogStatus = "PROCESSING"
	AutoJournalLogStatusSuccess    AutoJournalLogStatus = "SUCCESS"
	AutoJournalLogStatusFailed     AutoJournalLogStatus = "FAILED"
	AutoJournalLogStatusSkipped    AutoJournalLogStatus = "SKIPPED"
)

// AutoJournalLog represents a log of auto-generated journal entries
type AutoJournalLog struct {
	ID                uuid.UUID            `json:"id" db:"id"`
	SourceModule      string               `json:"source_module" db:"source_module"`
	SourceID          string               `json:"source_id" db:"source_id"`
	TransactionType   string               `json:"transaction_type" db:"transaction_type"`
	JournalEntryID    *uuid.UUID           `json:"journal_entry_id,omitempty" db:"journal_entry_id"`
	Status            AutoJournalLogStatus `json:"status" db:"status"`
	ProcessingMessage string               `json:"processing_message" db:"processing_message"`
	ErrorDetails      string               `json:"error_details,omitempty" db:"error_details"`
	ProcessedAt       *time.Time           `json:"processed_at,omitempty" db:"processed_at"`
	CreatedAt         time.Time            `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time            `json:"updated_at" db:"updated_at"`
}

// Validate validates the auto journal config
func (ajc *AutoJournalConfig) Validate() error {
	if ajc.SourceModule == "" {
		return NewValidationError("source_module is required")
	}
	if ajc.TransactionType == "" {
		return NewValidationError("transaction_type is required")
	}
	if ajc.AccountMapping == nil || len(ajc.AccountMapping) == 0 {
		return NewValidationError("account_mapping is required")
	}
	return nil
}

// GetUniqueKey returns a unique key for this configuration
func (ajc *AutoJournalConfig) GetUniqueKey() string {
	return ajc.SourceModule + "::" + ajc.TransactionType
}

// Validate validates the auto journal log
func (ajl *AutoJournalLog) Validate() error {
	if ajl.SourceModule == "" {
		return NewValidationError("source_module is required")
	}
	if ajl.SourceID == "" {
		return NewValidationError("source_id is required")
	}
	if ajl.TransactionType == "" {
		return NewValidationError("transaction_type is required")
	}
	return nil
}

// MarkAsProcessing marks the log as currently being processed
func (ajl *AutoJournalLog) MarkAsProcessing(message string) {
	ajl.Status = AutoJournalLogStatusProcessing
	ajl.ProcessingMessage = message
	now := time.Now()
	ajl.ProcessedAt = &now
	ajl.UpdatedAt = now
}

// MarkAsSuccess marks the log as successfully processed
func (ajl *AutoJournalLog) MarkAsSuccess(journalEntryID uuid.UUID, message string) {
	ajl.Status = AutoJournalLogStatusSuccess
	ajl.JournalEntryID = &journalEntryID
	ajl.ProcessingMessage = message
	ajl.ErrorDetails = ""
	now := time.Now()
	ajl.ProcessedAt = &now
	ajl.UpdatedAt = now
}

// MarkAsFailed marks the log as failed to process
func (ajl *AutoJournalLog) MarkAsFailed(message, errorDetails string) {
	ajl.Status = AutoJournalLogStatusFailed
	ajl.ProcessingMessage = message
	ajl.ErrorDetails = errorDetails
	now := time.Now()
	ajl.ProcessedAt = &now
	ajl.UpdatedAt = now
}

// MarkAsSkipped marks the log as skipped (e.g., configuration not found)
func (ajl *AutoJournalLog) MarkAsSkipped(message string) {
	ajl.Status = AutoJournalLogStatusSkipped
	ajl.ProcessingMessage = message
	ajl.ErrorDetails = ""
	now := time.Now()
	ajl.ProcessedAt = &now
	ajl.UpdatedAt = now
}

