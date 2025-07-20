package persistence_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/infrastructure/persistence"
)

func setupGormTestDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	assert.NoError(t, err)

	return gormDB, mock
}

func TestOutboundScanRepository_CreateOutboundScan(t *testing.T) {
	db, mock := setupGormTestDB(t)
	repo := persistence.NewOutboundScanRepository(db)

	now := time.Now()
	outboundScan := &entities.OutboundScan{
		ID:         uuid.New(),
		ShipmentID: uuid.New(),
		ScanType:   "TEST",
		ScannedAt:  now,
		ScannedBy:  uuid.New(),
	}

	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO `outbound_scans` (`id`,`shipment_id`,`scan_type`,`scanned_at`,`scanned_by`) VALUES (?,?,?,?,?)")).
		WithArgs(outboundScan.ID, outboundScan.ShipmentID, outboundScan.ScanType, outboundScan.ScannedAt, outboundScan.ScannedBy).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	err := repo.CreateOutboundScan(context.Background(), outboundScan)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestOutboundScanRepository_GetOutboundScanByID(t *testing.T) {
	db, mock := setupGormTestDB(t)
	repo := persistence.NewOutboundScanRepository(db)

	id := uuid.New()
		expectedScan := &entities.OutboundScan{ID: id, ShipmentID: uuid.New(), ScanType: "TEST", ScannedAt: time.Now(), ScannedBy: uuid.New()}

	mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM `outbound_scans` WHERE id = ? ORDER BY `outbound_scans`.`id` LIMIT 1")).
		WithArgs(id).WillReturnRows(sqlmock.NewRows([]string{"id", "shipment_id", "scan_type", "scanned_at", "scanned_by"}).AddRow(expectedScan.ID, expectedScan.ShipmentID, expectedScan.ScanType, expectedScan.ScannedAt, expectedScan.ScannedBy))

	outboundScan, err := repo.GetOutboundScanByID(context.Background(), id)
	assert.NoError(t, err)
	assert.NotNil(t, outboundScan)
	assert.Equal(t, expectedScan.ID, outboundScan.ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestOutboundScanRepository_GetOutboundScansByShipmentID(t *testing.T) {
	db, mock := setupGormTestDB(t)
	repo := persistence.NewOutboundScanRepository(db)

	shipmentID := uuid.New()
		expectedScans := []entities.OutboundScan{
			{ID: uuid.New(), ShipmentID: shipmentID, ScanType: "TEST", ScannedAt: time.Now(), ScannedBy: uuid.New()},
			{ID: uuid.New(), ShipmentID: shipmentID, ScanType: "TEST", ScannedAt: time.Now(), ScannedBy: uuid.New()},
		}
		mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM `outbound_scans` WHERE shipment_id = ?")).
			WithArgs(shipmentID).WillReturnRows(sqlmock.NewRows([]string{"id", "shipment_id", "scan_type", "scanned_at", "scanned_by"}).AddRow(expectedScans[0].ID, expectedScans[0].ShipmentID, expectedScans[0].ScanType, expectedScans[0].ScannedAt, expectedScans[0].ScannedBy).AddRow(expectedScans[1].ID, expectedScans[1].ShipmentID, expectedScans[1].ScanType, expectedScans[1].ScannedAt, expectedScans[1].ScannedBy))

		outboundScans, err := repo.GetOutboundScansByShipmentID(context.Background(), shipmentID)
		assert.NoError(t, err)
		assert.Len(t, outboundScans, 2)
		assert.NoError(t, mock.ExpectationsWereMet())
}