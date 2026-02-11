package sync

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// BatchSyncService handles periodic data synchronization from PostgreSQL to ClickHouse.
type BatchSyncService struct {
	pgDB   *sqlx.DB
	chDB   *sql.DB
	logger *zap.Logger
}

// NewBatchSyncService creates a new batch sync service.
func NewBatchSyncService(pgDB *sqlx.DB, chDB *sql.DB, logger *zap.Logger) *BatchSyncService {
	return &BatchSyncService{
		pgDB:   pgDB,
		chDB:   chDB,
		logger: logger,
	}
}

// RunFullSync performs a full sync of all tables from PostgreSQL to ClickHouse.
func (s *BatchSyncService) RunFullSync(ctx context.Context) error {
	s.logger.Info("Starting full batch sync PG → ClickHouse")
	start := time.Now()

	// Sync dimensions first (they're referenced by facts)
	dimSyncer := NewDimensionSync(s.pgDB, s.chDB, s.logger)
	if err := dimSyncer.SyncAll(ctx); err != nil {
		s.logger.Error("Dimension sync failed", zap.Error(err))
		return fmt.Errorf("dimension sync: %w", err)
	}

	// Sync fact tables
	factSyncer := NewFactSync(s.pgDB, s.chDB, s.logger)

	syncFuncs := []struct {
		name string
		fn   func(context.Context, *time.Time) (int64, error)
	}{
		{"sales_fact", factSyncer.SyncSalesFact},
		{"procurement_fact", factSyncer.SyncProcurementFact},
		{"inventory_movement_fact", factSyncer.SyncInventoryMovementFact},
		{"financial_transaction_fact", factSyncer.SyncFinancialTransactionFact},
		{"attendance_fact", factSyncer.SyncAttendanceFact},
	}

	for _, sf := range syncFuncs {
		rows, err := sf.fn(ctx, nil) // nil = full sync (no watermark)
		if err != nil {
			s.logger.Error("Fact sync failed",
				zap.String("table", sf.name),
				zap.Error(err))
			continue // Don't stop other syncs
		}
		s.logger.Info("Fact table synced",
			zap.String("table", sf.name),
			zap.Int64("rows", rows))

		// Update watermark
		s.updateWatermark(ctx, sf.name, "full", rows)
	}

	s.logger.Info("Full batch sync completed",
		zap.Duration("duration", time.Since(start)))
	return nil
}

// RunIncrementalSync syncs only records changed since the last sync.
func (s *BatchSyncService) RunIncrementalSync(ctx context.Context) error {
	s.logger.Info("Starting incremental sync PG → ClickHouse")
	start := time.Now()

	// Sync dimensions
	dimSyncer := NewDimensionSync(s.pgDB, s.chDB, s.logger)
	if err := dimSyncer.SyncAll(ctx); err != nil {
		s.logger.Error("Dimension sync failed", zap.Error(err))
	}

	// Sync facts incrementally
	factSyncer := NewFactSync(s.pgDB, s.chDB, s.logger)

	tables := []struct {
		name string
		fn   func(context.Context, *time.Time) (int64, error)
	}{
		{"sales_fact", factSyncer.SyncSalesFact},
		{"procurement_fact", factSyncer.SyncProcurementFact},
		{"inventory_movement_fact", factSyncer.SyncInventoryMovementFact},
		{"financial_transaction_fact", factSyncer.SyncFinancialTransactionFact},
		{"attendance_fact", factSyncer.SyncAttendanceFact},
	}

	for _, t := range tables {
		watermark := s.getWatermark(ctx, t.name)
		rows, err := t.fn(ctx, watermark)
		if err != nil {
			s.logger.Error("Incremental sync failed",
				zap.String("table", t.name),
				zap.Error(err))
			continue
		}
		if rows > 0 {
			s.logger.Info("Incremental sync completed",
				zap.String("table", t.name),
				zap.Int64("rows", rows))
			s.updateWatermark(ctx, t.name, "incremental", rows)
		}
	}

	s.logger.Info("Incremental sync completed",
		zap.Duration("duration", time.Since(start)))
	return nil
}

// GetSyncStatus returns the current sync status for all tables.
func (s *BatchSyncService) GetSyncStatus(ctx context.Context) ([]SyncStatus, error) {
	rows, err := s.chDB.QueryContext(ctx,
		`SELECT table_name, last_synced_at, rows_synced, sync_type
		 FROM sync_watermarks FINAL
		 ORDER BY table_name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var statuses []SyncStatus
	for rows.Next() {
		var st SyncStatus
		if err := rows.Scan(&st.TableName, &st.LastSyncedAt, &st.RowsSynced, &st.SyncType); err != nil {
			return nil, err
		}
		statuses = append(statuses, st)
	}
	return statuses, rows.Err()
}

// SyncStatus represents the sync state for a table.
type SyncStatus struct {
	TableName    string    `json:"table_name"`
	LastSyncedAt time.Time `json:"last_synced_at"`
	RowsSynced   uint64    `json:"rows_synced"`
	SyncType     string    `json:"sync_type"`
}

func (s *BatchSyncService) getWatermark(ctx context.Context, tableName string) *time.Time {
	var lastSynced time.Time
	err := s.chDB.QueryRowContext(ctx,
		`SELECT last_synced_at FROM sync_watermarks FINAL
		 WHERE table_name = ? AND sync_type IN ('full', 'incremental')
		 ORDER BY last_synced_at DESC LIMIT 1`, tableName).Scan(&lastSynced)
	if err != nil {
		return nil
	}
	return &lastSynced
}

func (s *BatchSyncService) updateWatermark(ctx context.Context, tableName, syncType string, rows int64) {
	_, err := s.chDB.ExecContext(ctx,
		`INSERT INTO sync_watermarks (table_name, last_synced_at, rows_synced, sync_type)
		 VALUES (?, now64(3), ?, ?)`, tableName, uint64(rows), syncType)
	if err != nil {
		s.logger.Error("Failed to update sync watermark",
			zap.String("table", tableName),
			zap.Error(err))
	}
}
