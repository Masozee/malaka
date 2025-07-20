package persistence_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/infrastructure/persistence"
	"malaka/internal/shared/types"
)

func setupSqlxTestDB(t *testing.T) (*sqlx.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	sqlxDB := sqlx.NewDb(db, "sqlmock")
	return sqlxDB, mock
}

func TestShipmentRepository_Create(t *testing.T) {
	db, mock := setupSqlxTestDB(t)
	repo := persistence.NewShipmentRepository(db)

	now := time.Now()
	shipment := &entities.Shipment{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: now,
			UpdatedAt: now,
		},
		SalesOrderID:   "SO123",
		ShipmentDate:   now,
		Status:         "pending",
		TrackingNumber: "TRACK123",
		CourierID:      uuid.New(),
	}

	mock.ExpectExec("INSERT INTO shipments").
		WithArgs(shipment.ID, shipment.SalesOrderID, shipment.ShipmentDate, shipment.Status, shipment.TrackingNumber, shipment.CourierID, shipment.CreatedAt, shipment.UpdatedAt).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Create(context.Background(), shipment)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestShipmentRepository_GetByID(t *testing.T) {
	db, mock := setupSqlxTestDB(t)
	repo := persistence.NewShipmentRepository(db)

	id := uuid.New()
	rows := sqlmock.NewRows([]string{"id", "tracking_number"}).
		AddRow(id, "TRACK123")

	mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM shipments WHERE id = $1")).
		WithArgs(id).
		WillReturnRows(rows)

	shipment, err := repo.GetByID(context.Background(), id)
	assert.NoError(t, err)
	assert.NotNil(t, shipment)
	assert.Equal(t, id.String(), shipment.ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestShipmentRepository_GetAll(t *testing.T) {
	db, mock := setupSqlxTestDB(t)
	repo := persistence.NewShipmentRepository(db)

	rows := sqlmock.NewRows([]string{"id", "tracking_number"}).
		AddRow(uuid.New(), "TRACK123").
		AddRow(uuid.New(), "TRACK456")

	mock.ExpectQuery(regexp.QuoteMeta("SELECT * FROM shipments")).
		WillReturnRows(rows)

	shipments, err := repo.GetAll(context.Background())
	assert.NoError(t, err)
	assert.Len(t, shipments, 2)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestShipmentRepository_Update(t *testing.T) {
	db, mock := setupSqlxTestDB(t)
	repo := persistence.NewShipmentRepository(db)

	now := time.Now()
	shipment := &entities.Shipment{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			UpdatedAt: now,
		},
		SalesOrderID:   "SO123",
		ShipmentDate:   now,
		Status:         "shipped",
		TrackingNumber: "TRACK_UPDATED",
		CourierID:      uuid.New(),
	}

	mock.ExpectExec("UPDATE shipments").
		WithArgs(shipment.SalesOrderID, shipment.ShipmentDate, shipment.Status, shipment.TrackingNumber, shipment.CourierID, shipment.UpdatedAt, shipment.ID).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Update(context.Background(), shipment)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestShipmentRepository_Delete(t *testing.T) {
	db, mock := setupSqlxTestDB(t)
	repo := persistence.NewShipmentRepository(db)

	id := uuid.New()

	mock.ExpectExec(regexp.QuoteMeta("DELETE FROM shipments WHERE id = $1")).
		WithArgs(id).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Delete(context.Background(), id)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}