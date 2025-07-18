package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// SimpleGoodsIssueRepositoryImpl implements repositories.SimpleGoodsIssueRepository.
type SimpleGoodsIssueRepositoryImpl struct {
	db *sqlx.DB
}

// NewSimpleGoodsIssueRepositoryImpl creates a new SimpleGoodsIssueRepositoryImpl.
func NewSimpleGoodsIssueRepositoryImpl(db *sqlx.DB) *SimpleGoodsIssueRepositoryImpl {
	return &SimpleGoodsIssueRepositoryImpl{db: db}
}

// Create creates a new simple goods issue in the database.
func (r *SimpleGoodsIssueRepositoryImpl) Create(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error {
	query := `INSERT INTO simple_goods_issues (id, warehouse_id, issue_date, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, goodsIssue.ID, goodsIssue.WarehouseID, goodsIssue.IssueDate, goodsIssue.Status, goodsIssue.Notes, goodsIssue.CreatedAt, goodsIssue.UpdatedAt)
	return err
}

// GetByID retrieves a simple goods issue by its ID from the database.
func (r *SimpleGoodsIssueRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SimpleGoodsIssue, error) {
	query := `SELECT id, warehouse_id, issue_date, status, notes, created_at, updated_at FROM simple_goods_issues WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	goodsIssue := &entities.SimpleGoodsIssue{}
	err := row.Scan(&goodsIssue.ID, &goodsIssue.WarehouseID, &goodsIssue.IssueDate, &goodsIssue.Status, &goodsIssue.Notes, &goodsIssue.CreatedAt, &goodsIssue.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Goods issue not found
	}
	return goodsIssue, err
}

// Update updates an existing simple goods issue in the database.
func (r *SimpleGoodsIssueRepositoryImpl) Update(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error {
	query := `UPDATE simple_goods_issues SET warehouse_id = $1, issue_date = $2, status = $3, notes = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, goodsIssue.WarehouseID, goodsIssue.IssueDate, goodsIssue.Status, goodsIssue.Notes, goodsIssue.UpdatedAt, goodsIssue.ID)
	return err
}

// GetAll retrieves all simple goods issues from the database.
func (r *SimpleGoodsIssueRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SimpleGoodsIssue, error) {
	query := `SELECT id, warehouse_id, issue_date, status, notes, created_at, updated_at FROM simple_goods_issues ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goodsIssues []*entities.SimpleGoodsIssue
	for rows.Next() {
		goodsIssue := &entities.SimpleGoodsIssue{}
		err := rows.Scan(&goodsIssue.ID, &goodsIssue.WarehouseID, &goodsIssue.IssueDate, &goodsIssue.Status, &goodsIssue.Notes, &goodsIssue.CreatedAt, &goodsIssue.UpdatedAt)
		if err != nil {
			return nil, err
		}
		goodsIssues = append(goodsIssues, goodsIssue)
	}
	return goodsIssues, rows.Err()
}

// Delete deletes a simple goods issue by its ID from the database.
func (r *SimpleGoodsIssueRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM simple_goods_issues WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}