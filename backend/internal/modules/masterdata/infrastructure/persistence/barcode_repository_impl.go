package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// BarcodeRepositoryImpl implements repositories.BarcodeRepository.
type BarcodeRepositoryImpl struct {
	db *sqlx.DB
}

// NewBarcodeRepositoryImpl creates a new BarcodeRepositoryImpl.
func NewBarcodeRepositoryImpl(db *sqlx.DB) *BarcodeRepositoryImpl {
	return &BarcodeRepositoryImpl{db: db}
}

// Create creates a new barcode in the database.
func (r *BarcodeRepositoryImpl) Create(ctx context.Context, barcode *entities.Barcode) error {
	query := `INSERT INTO barcodes (id, article_id, code, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, barcode.ID, barcode.ArticleID, barcode.Code, barcode.CreatedAt, barcode.UpdatedAt)
	return err
}

// GetByID retrieves a barcode by its ID from the database.
func (r *BarcodeRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Barcode, error) {
	query := `SELECT id, article_id, code, created_at, updated_at FROM barcodes WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	barcode := &entities.Barcode{}
	err := row.Scan(&barcode.ID, &barcode.ArticleID, &barcode.Code, &barcode.CreatedAt, &barcode.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Barcode not found
	}
	return barcode, err
}

// Update updates an existing barcode in the database.
func (r *BarcodeRepositoryImpl) Update(ctx context.Context, barcode *entities.Barcode) error {
	query := `UPDATE barcodes SET article_id = $1, code = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, barcode.ArticleID, barcode.Code, barcode.UpdatedAt, barcode.ID)
	return err
}

// GetAll retrieves all barcodes from the database.
func (r *BarcodeRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Barcode, error) {
	query := `SELECT id, article_id, code, created_at, updated_at FROM barcodes ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var barcodes []*entities.Barcode
	for rows.Next() {
		barcode := &entities.Barcode{}
		err := rows.Scan(&barcode.ID, &barcode.ArticleID, &barcode.Code, &barcode.CreatedAt, &barcode.UpdatedAt)
		if err != nil {
			return nil, err
		}
		barcodes = append(barcodes, barcode)
	}
	return barcodes, rows.Err()
}

// Delete deletes a barcode by its ID from the database.
func (r *BarcodeRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM barcodes WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByArticleID retrieves all barcodes for a specific article from the database.
func (r *BarcodeRepositoryImpl) GetByArticleID(ctx context.Context, articleID string) ([]*entities.Barcode, error) {
	query := `SELECT id, article_id, code, created_at, updated_at FROM barcodes WHERE article_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var barcodes []*entities.Barcode
	for rows.Next() {
		barcode := &entities.Barcode{}
		err := rows.Scan(&barcode.ID, &barcode.ArticleID, &barcode.Code, &barcode.CreatedAt, &barcode.UpdatedAt)
		if err != nil {
			return nil, err
		}
		barcodes = append(barcodes, barcode)
	}
	return barcodes, rows.Err()
}
