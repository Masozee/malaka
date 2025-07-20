package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// GalleryImageHandler handles HTTP requests for gallery image operations.
type GalleryImageHandler struct {
	service *services.GalleryImageService
}

// NewGalleryImageHandler creates a new GalleryImageHandler.
func NewGalleryImageHandler(service *services.GalleryImageService) *GalleryImageHandler {
	return &GalleryImageHandler{service: service}
}

// CreateGalleryImage handles the creation of a new gallery image.
func (h *GalleryImageHandler) CreateGalleryImage(c *gin.Context) {
	var req dto.CreateGalleryImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	image := &entities.GalleryImage{
		ArticleID: req.ArticleID,
		URL:       req.URL,
		IsPrimary: req.IsPrimary,
	}

	if err := h.service.CreateGalleryImage(c.Request.Context(), image); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Gallery image created successfully", image)
}

// GetGalleryImageByID handles retrieving a gallery image by its ID.
func (h *GalleryImageHandler) GetGalleryImageByID(c *gin.Context) {
	id := c.Param("id")
	image, err := h.service.GetGalleryImageByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if image == nil {
		response.NotFound(c, "Gallery image not found", nil)
		return
	}

	response.OK(c, "Gallery image retrieved successfully", image)
}

// GetAllGalleryImages handles retrieving all gallery images.
func (h *GalleryImageHandler) GetAllGalleryImages(c *gin.Context) {
	images, err := h.service.GetAllGalleryImages(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Gallery images retrieved successfully", images)
}

// UpdateGalleryImage handles updating an existing gallery image.
func (h *GalleryImageHandler) UpdateGalleryImage(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateGalleryImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	image := &entities.GalleryImage{
		ArticleID: req.ArticleID,
		URL:       req.URL,
		IsPrimary: req.IsPrimary,
	}
	image.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateGalleryImage(c.Request.Context(), image); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Gallery image updated successfully", image)
}

// DeleteGalleryImage handles deleting a gallery image by its ID.
func (h *GalleryImageHandler) DeleteGalleryImage(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteGalleryImage(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Gallery image deleted successfully", nil)
}

// GetGalleryImagesByArticleID handles retrieving all gallery images for a given article ID.
func (h *GalleryImageHandler) GetGalleryImagesByArticleID(c *gin.Context) {
	articleID := c.Param("article_id")
	images, err := h.service.GetGalleryImagesByArticleID(c.Request.Context(), articleID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Gallery images retrieved successfully", images)
}
