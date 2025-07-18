package persistence_test

import (
	"context"
	"database/sql"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/infrastructure/persistence"
)

func TestDraftOrderRepository(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	repo := persistence.NewDraftOrderRepositoryImpl(sqlxDB)

	t.Run("Create", func(t *testing.T) {
		draftOrder := &entities.DraftOrder{
			ID:          uuid.New().String(),
			SupplierID:  uuid.New().String(),
			OrderDate:   time.Now(),
			Status:      "draft",
			TotalAmount: 100.50,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		mock.ExpectExec("INSERT INTO draft_orders").
			WithArgs(draftOrder.ID, draftOrder.SupplierID, draftOrder.OrderDate, draftOrder.Status, draftOrder.TotalAmount, draftOrder.CreatedAt, draftOrder.UpdatedAt).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Create(context.Background(), draftOrder)
		assert.NoError(t, err)
	})

	t.Run("GetByID", func(t *testing.T) {
		id := uuid.New()
		expectedDraftOrder := &entities.DraftOrder{
			ID:          id.String(),
			SupplierID:  uuid.New().String(),
			OrderDate:   time.Now(),
			Status:      "draft",
			TotalAmount: 100.50,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		rows := sqlmock.NewRows([]string{"id", "supplier_id", "order_date", "status", "total_amount", "created_at", "updated_at"}).
			AddRow(expectedDraftOrder.ID, expectedDraftOrder.SupplierID, expectedDraftOrder.OrderDate, expectedDraftOrder.Status, expectedDraftOrder.TotalAmount, expectedDraftOrder.CreatedAt, expectedDraftOrder.UpdatedAt)

		mock.ExpectQuery(regexp.QuoteMeta("SELECT id, supplier_id, order_date, status, total_amount, created_at, updated_at FROM draft_orders WHERE id = $1")).
			WithArgs(id.String()).
			WillReturnRows(rows)

		foundDraftOrder, err := repo.GetByID(context.Background(), id.String())
		assert.NoError(t, err)
		assert.NotNil(t, foundDraftOrder)
		assert.Equal(t, expectedDraftOrder.ID, foundDraftOrder.ID)
	})

	t.Run("Update", func(t *testing.T) {
		draftOrder := &entities.DraftOrder{
			BaseModel: types.BaseModel{
				ID:        uuid.New().String(),
				UpdatedAt: time.Now(),
			},
			SupplierID:  uuid.New().String(),
			OrderDate:   time.Now(),
			Status:      "approved",
			TotalAmount: 150.75,
		}

		mock.ExpectExec("UPDATE draft_orders").
			WithArgs(draftOrder.SupplierID, draftOrder.OrderDate, draftOrder.Status, draftOrder.TotalAmount, draftOrder.BaseModel.UpdatedAt, draftOrder.BaseModel.ID).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Update(context.Background(), draftOrder)
		assert.NoError(t, err)
	})

	t.Run("Delete", func(t *testing.T) {
		id := uuid.New()

		mock.ExpectExec(regexp.QuoteMeta("DELETE FROM draft_orders WHERE id = $1")).
			WithArgs(id.String()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := repo.Delete(context.Background(), id.String())
		assert.NoError(t, err)
	})

	t.Run("GetAll", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "supplier_id", "order_date", "status", "total_amount", "created_at", "updated_at"}).
			AddRow(uuid.New().String(), uuid.New().String(), time.Now(), "draft", 100.50, time.Now(), time.Now()).
			AddRow(uuid.New().String(), uuid.New().String(), time.Now(), "approved", 200.75, time.Now(), time.Now())

		mock.ExpectQuery(regexp.QuoteMeta("SELECT (.+) FROM draft_orders ORDER BY created_at DESC")).
			WillReturnRows(rows)

		draftOrders, err := repo.GetAll(context.Background())
		assert.NoError(t, err)
		assert.Len(t, draftOrders, 2)
	})
}
