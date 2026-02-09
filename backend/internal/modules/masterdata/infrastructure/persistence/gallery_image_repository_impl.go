package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// GalleryImageRepositoryImpl implements repositories.GalleryImageRepository.
type GalleryImageRepositoryImpl struct {
	db *sqlx.DB
}

// NewGalleryImageRepositoryImpl creates a new GalleryImageRepositoryImpl.
func NewGalleryImageRepositoryImpl(db *sqlx.DB) *GalleryImageRepositoryImpl {
	return &GalleryImageRepositoryImpl{db: db}
}

// Create creates a new gallery image in the database.
func (r *GalleryImageRepositoryImpl) Create(ctx context.Context, image *entities.GalleryImage) error {
	query := `INSERT INTO gallery_images (id, article_id, company_id, url, is_primary, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, image.ID, image.ArticleID, image.CompanyID, image.URL, image.IsPrimary, image.CreatedAt, image.UpdatedAt)
	return err
}

// GetByID retrieves a gallery image by its ID from the database.
func (r *GalleryImageRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.GalleryImage, error) {
	query := `SELECT id, article_id, COALESCE(company_id::text, '') as company_id, url, is_primary, created_at, updated_at FROM gallery_images WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	image := &entities.GalleryImage{}
	err := row.Scan(&image.ID, &image.ArticleID, &image.CompanyID, &image.URL, &image.IsPrimary, &image.CreatedAt, &image.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Gallery image not found
	}
	return image, err
}

// Update updates an existing gallery image in the database.
func (r *GalleryImageRepositoryImpl) Update(ctx context.Context, image *entities.GalleryImage) error {
	query := `UPDATE gallery_images SET article_id = $1, company_id = $2, url = $3, is_primary = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, image.ArticleID, image.CompanyID, image.URL, image.IsPrimary, image.UpdatedAt, image.ID)
	return err
}

// Delete deletes a gallery image by its ID from the database.
func (r *GalleryImageRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM gallery_images WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAll retrieves all gallery images from the database.
func (r *GalleryImageRepositoryImpl) GetAll(ctx context.Context) ([]*entities.GalleryImage, error) {
	query := `SELECT id, article_id, COALESCE(company_id::text, '') as company_id, url, is_primary, created_at, updated_at FROM gallery_images ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []*entities.GalleryImage
	for rows.Next() {
		image := &entities.GalleryImage{}
		err := rows.Scan(&image.ID, &image.ArticleID, &image.CompanyID, &image.URL, &image.IsPrimary, &image.CreatedAt, &image.UpdatedAt)
		if err != nil {
			return nil, err
		}
		images = append(images, image)
	}
	return images, rows.Err()
}

// GetByArticleID retrieves all gallery images for a given article ID from the database.
func (r *GalleryImageRepositoryImpl) GetByArticleID(ctx context.Context, articleID uuid.ID) ([]*entities.GalleryImage, error) {
	query := `SELECT id, article_id, COALESCE(company_id::text, '') as company_id, url, is_primary, created_at, updated_at FROM gallery_images WHERE article_id = $1`
	rows, err := r.db.QueryContext(ctx, query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []*entities.GalleryImage
	for rows.Next() {
		image := &entities.GalleryImage{}
		if err := rows.Scan(&image.ID, &image.ArticleID, &image.CompanyID, &image.URL, &image.IsPrimary, &image.CreatedAt, &image.UpdatedAt); err != nil {
			return nil, err
		}
		images = append(images, image)
	}

	return images, nil
}
