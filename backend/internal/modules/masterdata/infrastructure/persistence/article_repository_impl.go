package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// ArticleRepositoryImpl implements repositories.ArticleRepository.
type ArticleRepositoryImpl struct {
	db *sqlx.DB
}

// NewArticleRepositoryImpl creates a new ArticleRepositoryImpl.
func NewArticleRepositoryImpl(db *sqlx.DB) *ArticleRepositoryImpl {
	return &ArticleRepositoryImpl{db: db}
}

// Create creates a new article in the database.
func (r *ArticleRepositoryImpl) Create(ctx context.Context, article *entities.Article) error {
	query := `INSERT INTO articles (id, name, description, classification_id, color_id, model_id, size_id, supplier_id, company_id, barcode, price, image_url, image_urls, thumbnail_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`
	_, err := r.db.ExecContext(ctx, query, article.ID, article.Name, article.Description, article.ClassificationID, article.ColorID, article.ModelID, article.SizeID, article.SupplierID, article.CompanyID, article.Barcode, article.Price, article.ImageURL, pq.Array(article.ImageURLs), article.ThumbnailURL, article.CreatedAt, article.UpdatedAt)
	return err
}

// GetByID retrieves an article by its ID from the database.
func (r *ArticleRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Article, error) {
	query := `SELECT id, name, description, classification_id, color_id, model_id, size_id, supplier_id, COALESCE(company_id::text, '') as company_id, barcode, price,
	          COALESCE(image_url, '') as image_url,
	          COALESCE(image_urls, '{}') as image_urls,
	          COALESCE(thumbnail_url, '') as thumbnail_url,
	          created_at, updated_at FROM articles WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	article := &entities.Article{}
	var imageURLs pq.StringArray
	err := row.Scan(&article.ID, &article.Name, &article.Description, &article.ClassificationID, &article.ColorID, &article.ModelID, &article.SizeID, &article.SupplierID, &article.CompanyID, &article.Barcode, &article.Price, &article.ImageURL, &imageURLs, &article.ThumbnailURL, &article.CreatedAt, &article.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Article not found
	}
	article.ImageURLs = []string(imageURLs)
	return article, err
}

// Update updates an existing article in the database.
func (r *ArticleRepositoryImpl) Update(ctx context.Context, article *entities.Article) error {
	query := `UPDATE articles SET name = $1, description = $2, classification_id = $3, color_id = $4, model_id = $5, size_id = $6, supplier_id = $7, company_id = $8, barcode = $9, price = $10, image_url = $11, image_urls = $12, thumbnail_url = $13, updated_at = $14 WHERE id = $15`
	_, err := r.db.ExecContext(ctx, query, article.Name, article.Description, article.ClassificationID, article.ColorID, article.ModelID, article.SizeID, article.SupplierID, article.CompanyID, article.Barcode, article.Price, article.ImageURL, pq.Array(article.ImageURLs), article.ThumbnailURL, article.UpdatedAt, article.ID)
	return err
}

// GetAll retrieves all articles from the database.
func (r *ArticleRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Article, error) {
	query := `SELECT id, name, description, classification_id, color_id, model_id, size_id, supplier_id, COALESCE(company_id::text, '') as company_id, barcode, price,
	          COALESCE(image_url, '') as image_url,
	          COALESCE(image_urls, '{}') as image_urls,
	          COALESCE(thumbnail_url, '') as thumbnail_url,
	          created_at, updated_at FROM articles ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []*entities.Article
	for rows.Next() {
		article := &entities.Article{}
		var imageURLs pq.StringArray
		err := rows.Scan(&article.ID, &article.Name, &article.Description, &article.ClassificationID, &article.ColorID, &article.ModelID, &article.SizeID, &article.SupplierID, &article.CompanyID, &article.Barcode, &article.Price, &article.ImageURL, &imageURLs, &article.ThumbnailURL, &article.CreatedAt, &article.UpdatedAt)
		if err != nil {
			return nil, err
		}
		article.ImageURLs = []string(imageURLs)
		articles = append(articles, article)
	}
	return articles, rows.Err()
}

// Delete deletes an article by its ID from the database.
func (r *ArticleRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM articles WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
