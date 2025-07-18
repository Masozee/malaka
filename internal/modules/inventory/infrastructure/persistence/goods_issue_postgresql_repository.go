package persistence

import (
	"context"
	"database/sql"
	"fmt"

	"errors"

	"github.com/google/uuid"
	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsIssuePostgreSQLRepository implements GoodsIssueRepository for PostgreSQL.
type GoodsIssuePostgreSQLRepository struct {
	db *sql.DB
}

// NewGoodsIssuePostgreSQLRepository creates a new GoodsIssuePostgreSQLRepository.
func NewGoodsIssuePostgreSQLRepository(db *sql.DB) *GoodsIssuePostgreSQLRepository {
	return &GoodsIssuePostgreSQLRepository{db: db}
}

// Save creates a new GoodsIssue or updates an existing one.
func (r *GoodsIssuePostgreSQLRepository) Save(ctx context.Context, goodsIssue *entities.GoodsIssue) error {
	query := `
		INSERT INTO goods_issues (id, issue_date, warehouse_id, status, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (id) DO UPDATE SET
			issue_date = EXCLUDED.issue_date,
		warehouse_id = EXCLUDED.warehouse_id,
		status = EXCLUDED.status,
		notes = EXCLUDED.notes,
		updated_at = EXCLUDED.updated_at
	`
	_, err := r.db.ExecContext(ctx, query, goodsIssue.ID, goodsIssue.IssueDate, goodsIssue.WarehouseID, goodsIssue.Status, goodsIssue.Notes, goodsIssue.CreatedAt, goodsIssue.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to save goods issue: %w", err)
	}

	// Save items
	for _, item := range goodsIssue.Items {
		itemQuery := `
			INSERT INTO goods_issue_items (id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (id) DO UPDATE SET
				goods_issue_id = EXCLUDED.goods_issue_id,
				article_id = EXCLUDED.article_id,
				quantity = EXCLUDED.quantity,
				unit_price = EXCLUDED.unit_price,
				unit = EXCLUDED.unit,
				updated_at = EXCLUDED.updated_at
		`
		_, err := r.db.ExecContext(ctx, itemQuery, item.ID, item.GoodsIssueID, item.ArticleID, item.Quantity, item.UnitPrice, item.Unit, item.CreatedAt, item.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to save goods issue item: %w", err)
		}
	}

	return nil
}

// FindByID retrieves a GoodsIssue by its ID.
func (r *GoodsIssuePostgreSQLRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error) {
	query := `
		SELECT id, issue_date, warehouse_id, status, notes, created_at, updated_at
		FROM goods_issues
		WHERE id = $1
	`
	gi := &entities.GoodsIssue{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(&gi.ID, &gi.IssueDate, &gi.WarehouseID, &gi.Status, &gi.Notes, &gi.CreatedAt, &gi.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to find goods issue by ID: %w", err)
	}

	// Load items
	itemsQuery := `
		SELECT id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at
		FROM goods_issue_items
		WHERE goods_issue_id = $1
	`
	rows, err := r.db.QueryContext(ctx, itemsQuery, gi.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to load goods issue items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		item := &entities.GoodsIssueItem{}
		err := rows.Scan(&item.ID, &item.GoodsIssueID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.Unit, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan goods issue item: %w", err)
		}
		gi.AddItem(item)
	}

	return gi, nil
}

// FindAll retrieves all GoodsIssues, possibly with pagination and filtering.
func (r *GoodsIssuePostgreSQLRepository) FindAll(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error) {
	baseQuery := `
		SELECT id, issue_date, warehouse_id, status, notes, created_at, updated_at
		FROM goods_issues
	`
	args := []interface{}{} // For dynamic query parameters
	whereClause := ""

	i := 1
	if warehouseID, ok := filter["warehouse_id"]; ok && warehouseID != "" {
		whereClause += fmt.Sprintf(" WHERE warehouse_id = $%d", i)
		args = append(args, warehouseID)
		i++
	}

	query := fmt.Sprintf("%s %s ORDER BY issue_date DESC LIMIT $%d OFFSET $%d", baseQuery, whereClause, i, i+1)
	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to find all goods issues: %w", err)
	}
	defer rows.Close()

	var goodsIssues []*entities.GoodsIssue
	for rows.Next() {
		gi := &entities.GoodsIssue{}
		err := rows.Scan(&gi.ID, &gi.IssueDate, &gi.WarehouseID, &gi.Status, &gi.Notes, &gi.CreatedAt, &gi.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan goods issue: %w", err)
		}

		// Load items for each goods issue
		itemsQuery := `
			SELECT id, goods_issue_id, article_id, quantity, unit_price, unit, created_at, updated_at
			FROM goods_issue_items
			WHERE goods_issue_id = $1
		`
		itemRows, err := r.db.QueryContext(ctx, itemsQuery, gi.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to load goods issue items for FindAll: %w", err)
		}
		defer itemRows.Close()

		for itemRows.Next() {
			item := &entities.GoodsIssueItem{}
			err := itemRows.Scan(&item.ID, &item.GoodsIssueID, &item.ArticleID, &item.Quantity, &item.UnitPrice, &item.Unit, &item.CreatedAt, &item.UpdatedAt)
			if err != nil {
				return nil, fmt.Errorf("failed to scan goods issue item for FindAll: %w", err)
			}
			gi.AddItem(item)
		}
		goodsIssues = append(goodsIssues, gi)
	}

	return goodsIssues, nil
}

// Delete deletes a GoodsIssue by its ID.
func (r *GoodsIssuePostgreSQLRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Delete items first due to foreign key constraint
	_, err := r.db.ExecContext(ctx, "DELETE FROM goods_issue_items WHERE goods_issue_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete goods issue items: %w", err)
	}

	query := "DELETE FROM goods_issues WHERE id = $1"
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete goods issue: %w", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("goods issue not found")
	}

	return nil
}
