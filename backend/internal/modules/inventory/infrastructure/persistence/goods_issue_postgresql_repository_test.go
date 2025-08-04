package persistence_test

import (
	"context"
	"database/sql"
	"regexp"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"malaka/internal/modules/inventory/domain/entities"
	persistence "malaka/internal/modules/inventory/infrastructure/persistence"
)

func TestGoodsIssuePostgreSQLRepository_Save(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := persistence.NewGoodsIssuePostgreSQLRepository(db)
	ctx := context.Background()

	giID := uuid.New()
	warehouseID := uuid.New()
	articleID := uuid.New()

	gi, _ := entities.NewGoodsIssue(giID, time.Now(), warehouseID, "Draft", "Test notes")
	item, _ := entities.NewGoodsIssueItem(uuid.New(), giID, articleID, 10, 100.0, "pcs")
	gi.AddItem(item)

	// Expectation for goods_issues insert
	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO goods_issues (id, issue_date, warehouse_id, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET issue_date = EXCLUDED.issue_date, warehouse_id = EXCLUDED.warehouse_id, status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at`)).
		WithArgs(gi.ID, gi.IssueDate, gi.WarehouseID, gi.Status, gi.Notes, gi.CreatedAt, gi.UpdatedAt).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Expectation for goods_issue_items insert
	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO goods_issue_items (id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET goods_issue_id = EXCLUDED.goods_issue_id, article_id = EXCLUDED.article_id, quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, unit = EXCLUDED.unit, updated_at = EXCLUDED.updated_at`)).
		WithArgs(item.ID, item.GoodsIssueID, item.ArticleID, item.Quantity, item.UnitPrice, item.Unit, item.CreatedAt, item.UpdatedAt).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err = repo.Save(ctx, gi)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGoodsIssuePostgreSQLRepository_FindByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := persistence.NewGoodsIssuePostgreSQLRepository(db)
	ctx := context.Background()

	giID := uuid.New()
	warehouseID := uuid.New()
	articleID := uuid.New()
	issueDate := time.Now()

	rows := sqlmock.NewRows([]string{"id", "issue_date", "warehouse_id", "status", "notes", "created_at", "updated_at"}).
		AddRow(giID, issueDate, warehouseID, "Completed", "Found notes", time.Now(), time.Now())
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, issue_date, warehouse_id, status, notes, created_at, updated_at FROM goods_issues WHERE id = $1`)).
		WithArgs(giID).
		WillReturnRows(rows)

	itemRows := sqlmock.NewRows([]string{"id", "goods_issue_id", "article_id", "quantity", "unit_price", "unit", "created_at", "updated_at"}).
		AddRow(uuid.New(), giID, articleID, 5, 50.0, "pcs", time.Now(), time.Now())
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at FROM goods_issue_items WHERE goods_issue_id = $1`)).
		WithArgs(giID).
		WillReturnRows(itemRows)

	gi, err := repo.FindByID(ctx, giID)
	assert.NoError(t, err)
	assert.NotNil(t, gi)
	assert.Equal(t, giID, gi.ID)
	assert.Equal(t, "Completed", gi.Status)
	assert.Len(t, gi.Items, 1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGoodsIssuePostgreSQLRepository_FindByID_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := persistence.NewGoodsIssuePostgreSQLRepository(db)
	ctx := context.Background()

	giID := uuid.New()

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, issue_date, warehouse_id, status, notes, created_at, updated_at FROM goods_issues WHERE id = $1`)).
		WithArgs(giID).
		WillReturnError(sql.ErrNoRows)

	gi, err := repo.FindByID(ctx, giID)
	assert.NoError(t, err) // sql.ErrNoRows is handled internally, so no error is returned
	assert.Nil(t, gi)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGoodsIssuePostgreSQLRepository_FindAll(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := persistence.NewGoodsIssuePostgreSQLRepository(db)
	ctx := context.Background()

	giID1 := uuid.New()
	giID2 := uuid.New()
	warehouseID := uuid.New()
	articleID1 := uuid.New()
	articleID2 := uuid.New()

	rows := sqlmock.NewRows([]string{"id", "issue_date", "warehouse_id", "status", "notes", "created_at", "updated_at"}).
		AddRow(giID1, time.Now(), warehouseID, "Draft", "Notes 1", time.Now(), time.Now()).
		AddRow(giID2, time.Now(), warehouseID, "Completed", "Notes 2", time.Now(), time.Now())
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, issue_date, warehouse_id, status, notes, created_at, updated_at FROM goods_issues WHERE warehouse_id = $1 ORDER BY issue_date DESC LIMIT $2 OFFSET $3`)).
		WithArgs(warehouseID.String(), 10, 0).
		WillReturnRows(rows)

	itemRows1 := sqlmock.NewRows([]string{"id", "goods_issue_id", "article_id", "quantity", "unit_price", "unit", "created_at", "updated_at"}).
		AddRow(uuid.New(), giID1, articleID1, 2, 20.0, "pcs", time.Now(), time.Now())
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at FROM goods_issue_items WHERE goods_issue_id = $1`)).
		WithArgs(giID1).
		WillReturnRows(itemRows1)

	itemRows2 := sqlmock.NewRows([]string{"id", "goods_issue_id", "article_id", "quantity", "unit_price", "unit", "created_at", "updated_at"}).
		AddRow(uuid.New(), giID2, articleID2, 3, 30.0, "box", time.Now(), time.Now())
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at FROM goods_issue_items WHERE goods_issue_id = $1`)).
		WithArgs(giID2).
		WillReturnRows(itemRows2)

	filter := map[string]interface{}{"warehouse_id": warehouseID.String()}
	gis, err := repo.FindAll(ctx, 10, 0, filter)
	assert.NoError(t, err)
	assert.Len(t, gis, 2)
	assert.Equal(t, giID1, gis[0].ID)
	assert.Len(t, gis[0].Items, 1)
	assert.Equal(t, giID2, gis[1].ID)
	assert.Len(t, gis[1].Items, 1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGoodsIssuePostgreSQLRepository_Delete(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := persistence.NewGoodsIssuePostgreSQLRepository(db)
	ctx := context.Background()

	giID := uuid.New()

	// Expectation for goods_issue_items delete
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM goods_issue_items WHERE goods_issue_id = $1`)).
		WithArgs(giID).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Expectation for goods_issues delete
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM goods_issues WHERE id = $1`)).
		WithArgs(giID).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err = repo.Delete(ctx, giID)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGoodsIssuePostgreSQLRepository_Delete_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := persistence.NewGoodsIssuePostgreSQLRepository(db)
	ctx := context.Background()

	giID := uuid.New()

	// Expectation for goods_issue_items delete (even if no items, it should not error)
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM goods_issue_items WHERE goods_issue_id = $1`)).
		WithArgs(giID).
		WillReturnResult(sqlmock.NewResult(0, 0))

	// Expectation for goods_issues delete
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM goods_issues WHERE id = $1`)).
		WithArgs(giID).
		WillReturnResult(sqlmock.NewResult(0, 0)) // No rows affected

	err = repo.Delete(ctx, giID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "goods issue not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}
