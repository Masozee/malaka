package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateGalleryImageRequest represents the request body for creating a new gallery image.
type CreateGalleryImageRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	CompanyID string `json:"company_id"`
	URL       string `json:"url" binding:"required,url"`
	IsPrimary bool   `json:"is_primary"`
}

// ToEntity converts CreateGalleryImageRequest to entities.GalleryImage.
func (r *CreateGalleryImageRequest) ToEntity() *entities.GalleryImage {
	galleryImage := &entities.GalleryImage{
		URL:       r.URL,
		IsPrimary: r.IsPrimary,
		CompanyID: r.CompanyID,
	}

	// Parse UUID field
	if r.ArticleID != "" {
		if id, err := uuid.Parse(r.ArticleID); err == nil {
			galleryImage.ArticleID = id
		}
	}

	return galleryImage
}

// UpdateGalleryImageRequest represents the request body for updating an existing gallery image.
type UpdateGalleryImageRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	URL       string `json:"url" binding:"required,url"`
	IsPrimary bool   `json:"is_primary"`
}

// ApplyToEntity applies UpdateGalleryImageRequest changes to an existing entities.GalleryImage.
func (r *UpdateGalleryImageRequest) ApplyToEntity(galleryImage *entities.GalleryImage) {
	if r.ArticleID != "" {
		if id, err := uuid.Parse(r.ArticleID); err == nil {
			galleryImage.ArticleID = id
		}
	}
	if r.URL != "" {
		galleryImage.URL = r.URL
	}
	galleryImage.IsPrimary = r.IsPrimary
}

// GalleryImageResponse represents the response body for a gallery image.
type GalleryImageResponse struct {
	ID        string `json:"id"`
	ArticleID string `json:"article_id"`
	CompanyID string `json:"company_id"`
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// GalleryImageResponseFromEntity converts entities.GalleryImage to GalleryImageResponse.
func GalleryImageResponseFromEntity(galleryImage *entities.GalleryImage) *GalleryImageResponse {
	return &GalleryImageResponse{
		ID:        galleryImage.ID.String(),
		ArticleID: galleryImage.ArticleID.String(),
		CompanyID: galleryImage.CompanyID,
		URL:       galleryImage.URL,
		IsPrimary: galleryImage.IsPrimary,
		CreatedAt: galleryImage.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: galleryImage.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
