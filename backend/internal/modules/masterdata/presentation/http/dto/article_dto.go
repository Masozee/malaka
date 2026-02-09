package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateArticleRequest represents the request body for creating a new article.
type CreateArticleRequest struct {
	Code             string   `json:"code" binding:"required"`
	Name             string   `json:"name" binding:"required"`
	Brand            string   `json:"brand"`
	Category         string   `json:"category"`
	Gender           string   `json:"gender"`
	Description      string   `json:"description"`
	ClassificationID string   `json:"classification_id" binding:"required"`
	ColorID          string   `json:"color_id"`
	ModelID          string   `json:"model_id"`
	SizeID           string   `json:"size_id"`
	SupplierID       string   `json:"supplier_id"`
	Barcode          string   `json:"barcode"`
	Price            float64  `json:"price"`
	CompanyID        string   `json:"company_id"`
	Status           string   `json:"status"`
	ImageURL         string   `json:"image_url,omitempty"`
	ImageURLs        []string `json:"image_urls,omitempty"`
	ThumbnailURL     string   `json:"thumbnail_url,omitempty"`
}

// ToEntity converts CreateArticleRequest to entities.Article.
func (r *CreateArticleRequest) ToEntity() *entities.Article {
	article := &entities.Article{
		Code:         r.Code,
		Name:         r.Name,
		Brand:        r.Brand,
		Category:     r.Category,
		Gender:       r.Gender,
		Description:  r.Description,
		Barcode:      r.Barcode,
		Price:        r.Price,
		CompanyID:    r.CompanyID,
		Status:       r.Status,
		ImageURL:     r.ImageURL,
		ImageURLs:    r.ImageURLs,
		ThumbnailURL: r.ThumbnailURL,
	}

	// Set defaults
	if article.Status == "" {
		article.Status = "active"
	}

	// Parse UUID fields
	if r.ClassificationID != "" {
		if id, err := uuid.Parse(r.ClassificationID); err == nil {
			article.ClassificationID = id
		}
	}
	if r.ColorID != "" {
		if id, err := uuid.Parse(r.ColorID); err == nil {
			article.ColorID = id
		}
	}
	if r.ModelID != "" {
		if id, err := uuid.Parse(r.ModelID); err == nil {
			article.ModelID = id
		}
	}
	if r.SizeID != "" {
		if id, err := uuid.Parse(r.SizeID); err == nil {
			article.SizeID = id
		}
	}
	if r.SupplierID != "" {
		if id, err := uuid.Parse(r.SupplierID); err == nil {
			article.SupplierID = id
		}
	}

	return article
}

// UpdateArticleRequest represents the request body for updating an existing article.
// Fields are optional for partial updates - only provided fields will be updated.
type UpdateArticleRequest struct {
	Code             string   `json:"code"`
	Name             string   `json:"name"`
	Brand            string   `json:"brand"`
	Category         string   `json:"category"`
	Gender           string   `json:"gender"`
	Description      string   `json:"description"`
	ClassificationID string   `json:"classification_id"`
	ColorID          string   `json:"color_id"`
	ModelID          string   `json:"model_id"`
	SizeID           string   `json:"size_id"`
	SupplierID       string   `json:"supplier_id"`
	Barcode          string   `json:"barcode"`
	Price            float64  `json:"price"`
	Status           string   `json:"status"`
	ImageURL         string   `json:"image_url,omitempty"`
	ImageURLs        []string `json:"image_urls,omitempty"`
	ThumbnailURL     string   `json:"thumbnail_url,omitempty"`
}

// ApplyToEntity applies UpdateArticleRequest changes to an existing entities.Article.
func (r *UpdateArticleRequest) ApplyToEntity(article *entities.Article) {
	if r.Code != "" {
		article.Code = r.Code
	}
	if r.Name != "" {
		article.Name = r.Name
	}
	if r.Brand != "" {
		article.Brand = r.Brand
	}
	if r.Category != "" {
		article.Category = r.Category
	}
	if r.Gender != "" {
		article.Gender = r.Gender
	}
	if r.Description != "" {
		article.Description = r.Description
	}
	if r.ClassificationID != "" {
		if id, err := uuid.Parse(r.ClassificationID); err == nil {
			article.ClassificationID = id
		}
	}
	if r.ColorID != "" {
		if id, err := uuid.Parse(r.ColorID); err == nil {
			article.ColorID = id
		}
	}
	if r.ModelID != "" {
		if id, err := uuid.Parse(r.ModelID); err == nil {
			article.ModelID = id
		}
	}
	if r.SizeID != "" {
		if id, err := uuid.Parse(r.SizeID); err == nil {
			article.SizeID = id
		}
	}
	if r.SupplierID != "" {
		if id, err := uuid.Parse(r.SupplierID); err == nil {
			article.SupplierID = id
		}
	}
	if r.Barcode != "" {
		article.Barcode = r.Barcode
	}
	if r.Price != 0 {
		article.Price = r.Price
	}
	if r.Status != "" {
		article.Status = r.Status
	}
	if r.ImageURL != "" {
		article.ImageURL = r.ImageURL
	}
	if len(r.ImageURLs) > 0 {
		article.ImageURLs = r.ImageURLs
	}
	if r.ThumbnailURL != "" {
		article.ThumbnailURL = r.ThumbnailURL
	}
}

// ArticleResponse represents the response body for an article.
type ArticleResponse struct {
	ID               string   `json:"id"`
	Code             string   `json:"code"`
	Name             string   `json:"name"`
	Brand            string   `json:"brand"`
	Category         string   `json:"category"`
	Gender           string   `json:"gender"`
	Description      string   `json:"description"`
	ClassificationID string   `json:"classification_id"`
	ColorID          string   `json:"color_id"`
	ModelID          string   `json:"model_id"`
	SizeID           string   `json:"size_id"`
	SupplierID       string   `json:"supplier_id"`
	Barcode          string   `json:"barcode"`
	BarcodeURL       string   `json:"barcode_url"`
	Price            float64  `json:"price"`
	CompanyID        string   `json:"company_id"`
	Status           string   `json:"status"`
	ImageURL         string   `json:"image_url,omitempty"`
	ImageURLs        []string `json:"image_urls,omitempty"`
	ThumbnailURL     string   `json:"thumbnail_url,omitempty"`
	CreatedAt        string   `json:"created_at"`
	UpdatedAt        string   `json:"updated_at"`
}

// ArticleResponseFromEntity converts entities.Article to ArticleResponse.
func ArticleResponseFromEntity(article *entities.Article) *ArticleResponse {
	return &ArticleResponse{
		ID:               article.ID.String(),
		Code:             article.Code,
		Name:             article.Name,
		Brand:            article.Brand,
		Category:         article.Category,
		Gender:           article.Gender,
		Description:      article.Description,
		ClassificationID: article.ClassificationID.String(),
		ColorID:          article.ColorID.String(),
		ModelID:          article.ModelID.String(),
		SizeID:           article.SizeID.String(),
		SupplierID:       article.SupplierID.String(),
		Barcode:          article.Barcode,
		BarcodeURL:       article.BarcodeURL,
		Price:            article.Price,
		CompanyID:        article.CompanyID,
		Status:           article.Status,
		ImageURL:         article.ImageURL,
		ImageURLs:        article.ImageURLs,
		ThumbnailURL:     article.ThumbnailURL,
		CreatedAt:        article.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:        article.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
