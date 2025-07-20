package persistence

import (
	"context"
	"testing"
	"regexp"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

func TestCourierRateRepository(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	repo := NewCourierRateRepository(sqlxDB)

	t.Run("Create", func(t *testing.T) {
		courierID := uuid.New()
		courierRate := &entities.CourierRate{
			CourierID:   courierID,
			Origin:      "Jakarta",
			Destination: "Bandung",
			Price:       10000,
		}

		mock.ExpectExec("INSERT INTO courier_rates").
			WithArgs(courierRate.CourierID, courierRate.Origin, courierRate.Destination, courierRate.Price).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Create(context.Background(), courierRate)
		assert.NoError(t, err)
	})

	t.Run("GetByID", func(t *testing.T) {
		courierID := uuid.New()
		id := uuid.New()
		courierRate := &entities.CourierRate{
			ID:          id,
			CourierID:   courierID,
			Origin:      "Jakarta",
			Destination: "Bandung",
			Price:       10000,
		}

		rows := sqlmock.NewRows([]string{"id", "courier_id", "origin", "destination", "price", "created_at", "updated_at"}).
			AddRow(courierRate.ID, courierRate.CourierID, courierRate.Origin, courierRate.Destination, courierRate.Price, courierRate.CreatedAt, courierRate.UpdatedAt)

		mock.ExpectQuery(regexp.QuoteMeta("SELECT id, courier_id, origin, destination, price, created_at, updated_at FROM courier_rates WHERE id = $1")).
			WithArgs(id).
			WillReturnRows(rows)

		result, err := repo.GetByID(context.Background(), id)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, courierRate.ID, result.ID)
	})

	t.Run("Update", func(t *testing.T) {
		courierID := uuid.New()
		id := uuid.New()
		courierRate := &entities.CourierRate{
			ID:          id,
			CourierID:   courierID,
			Origin:      "Jakarta",
			Destination: "Bandung",
			Price:       15000,
		}

		mock.ExpectExec("UPDATE courier_rates").
			WithArgs(courierRate.CourierID, courierRate.Origin, courierRate.Destination, courierRate.Price, courierRate.ID).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Update(context.Background(), courierRate)
		assert.NoError(t, err)
	})

	t.Run("Delete", func(t *testing.T) {
		id := uuid.New()

		mock.ExpectExec("DELETE FROM courier_rates").
			WithArgs(id).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Delete(context.Background(), id)
		assert.NoError(t, err)
	})
}
