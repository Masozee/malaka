package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/storage"
	"malaka/internal/shared/uuid"
)

// ArticleHandler handles HTTP requests for article operations.
type ArticleHandler struct {
	service        *services.ArticleService
	storageService storage.StorageService
}

// NewArticleHandler creates a new ArticleHandler.
func NewArticleHandler(service *services.ArticleService, storageService storage.StorageService) *ArticleHandler {
	return &ArticleHandler{
		service:        service,
		storageService: storageService,
	}
}

// CreateArticle handles the creation of a new article.
func (h *ArticleHandler) CreateArticle(c *gin.Context) {
	var req dto.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Use DTO's ToEntity method which handles UUID conversion properly
	article := req.ToEntity()

	if err := h.service.CreateArticle(c.Request.Context(), article); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article created successfully", article)
}

// GetArticleByID handles retrieving an article by its ID.
func (h *ArticleHandler) GetArticleByID(c *gin.Context) {
	id := c.Param("id")
	article, err := h.service.GetArticleByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if article == nil {
		response.NotFound(c, "Article not found", nil)
		return
	}

	response.OK(c, "Article retrieved successfully", article)
}

// GetAllArticles handles retrieving all articles.
func (h *ArticleHandler) GetAllArticles(c *gin.Context) {
	articles, err := h.service.GetAllArticles(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Articles retrieved successfully", articles)
}

// UpdateArticle handles updating an existing article.
// Supports partial updates - only provided fields will be updated.
func (h *ArticleHandler) UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Fetch existing article first for partial update
	article, err := h.service.GetArticleByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if article == nil {
		response.NotFound(c, "Article not found", nil)
		return
	}

	// Use DTO's ApplyToEntity method which handles UUID conversion properly
	req.ApplyToEntity(article)

	if err := h.service.UpdateArticle(c.Request.Context(), article); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article updated successfully", article)
}

// DeleteArticle handles deleting an article by its ID.
func (h *ArticleHandler) DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteArticle(c.Request.Context(), uuid.MustParse(id)); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article deleted successfully", nil)
}

// UploadArticleImage handles uploading images for an article.
func (h *ArticleHandler) UploadArticleImage(c *gin.Context) {
	articleID := c.Param("id")
	if articleID == "" {
		response.BadRequest(c, "Article ID is required", nil)
		return
	}

	// Check if article exists
	article, err := h.service.GetArticleByID(c.Request.Context(), uuid.MustParse(articleID))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if article == nil {
		response.NotFound(c, "Article not found", nil)
		return
	}

	// Get uploaded files
	form, err := c.MultipartForm()
	if err != nil {
		response.BadRequest(c, "Invalid multipart form", nil)
		return
	}

	// Try both field names for compatibility
	files := form.File["image_urls"]
	if len(files) == 0 {
		files = form.File["images"] // Fallback for old clients
	}
	if len(files) == 0 {
		response.BadRequest(c, "No images provided", nil)
		return
	}

	// Limit to 5 images per article
	if len(files) > 5 {
		response.BadRequest(c, "Maximum 5 images allowed per article", nil)
		return
	}

	var uploadedURLs []string
	var errors []string

	// Upload each image
	for _, file := range files {
		// Validate file type
		if !isValidImageType(file.Header.Get("Content-Type")) {
			errors = append(errors, fmt.Sprintf("Invalid file type for %s", file.Filename))
			continue
		}

		// Validate file size (max 10MB per image)
		const maxImageSize = 10 * 1024 * 1024
		if file.Size > maxImageSize {
			errors = append(errors, fmt.Sprintf("File %s exceeds 10MB limit", file.Filename))
			continue
		}

		// Upload to MinIO
		result, err := h.storageService.UploadWithMetadata(c.Request.Context(), file)
		if err != nil {
			errors = append(errors, fmt.Sprintf("Failed to upload %s: %v", file.Filename, err))
			continue
		}

		uploadedURLs = append(uploadedURLs, result.ObjectKey)
	}

	if len(uploadedURLs) == 0 {
		response.BadRequest(c, "No images were uploaded successfully", gin.H{"errors": errors})
		return
	}

	// Update article with new image URLs
	article.ImageURLs = append(article.ImageURLs, uploadedURLs...)
	if article.ImageURL == "" && len(uploadedURLs) > 0 {
		// Set the first uploaded image as the main image
		article.ImageURL = uploadedURLs[0]
		article.ThumbnailURL = uploadedURLs[0] // Use same for thumbnail for now
	}

	// Save updated article
	if err := h.service.UpdateArticle(c.Request.Context(), article); err != nil {
		response.InternalServerError(c, "Failed to update article with images", nil)
		return
	}

	responseData := gin.H{
		"uploaded_images": uploadedURLs,
		"success_count":   len(uploadedURLs),
		"total_files":     len(files),
		"article":         article,
	}

	if len(errors) > 0 {
		responseData["errors"] = errors
		responseData["error_count"] = len(errors)
	}

	message := fmt.Sprintf("Image upload completed: %d/%d images uploaded successfully", 
		len(uploadedURLs), len(files))
	response.OK(c, message, responseData)
}

// DeleteArticleImage handles deleting a specific image from an article.
func (h *ArticleHandler) DeleteArticleImage(c *gin.Context) {
	articleID := c.Param("id")
	imageURL := c.Query("image_url")

	if articleID == "" || imageURL == "" {
		response.BadRequest(c, "Article ID and image URL are required", nil)
		return
	}

	// Get article
	article, err := h.service.GetArticleByID(c.Request.Context(), uuid.MustParse(articleID))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if article == nil {
		response.NotFound(c, "Article not found", nil)
		return
	}

	// Remove image URL from article
	var updatedURLs []string
	imageFound := false
	for _, url := range article.ImageURLs {
		if url != imageURL {
			updatedURLs = append(updatedURLs, url)
		} else {
			imageFound = true
		}
	}

	if !imageFound {
		response.NotFound(c, "Image not found in article", nil)
		return
	}

	// Update main image if it was deleted
	if article.ImageURL == imageURL {
		if len(updatedURLs) > 0 {
			article.ImageURL = updatedURLs[0]
			article.ThumbnailURL = updatedURLs[0]
		} else {
			article.ImageURL = ""
			article.ThumbnailURL = ""
		}
	}

	article.ImageURLs = updatedURLs

	// Delete from MinIO
	if err := h.storageService.DeleteWithCache(c.Request.Context(), imageURL); err != nil {
		response.InternalServerError(c, "Failed to delete image from storage", nil)
		return
	}

	// Save updated article
	if err := h.service.UpdateArticle(c.Request.Context(), article); err != nil {
		response.InternalServerError(c, "Failed to update article", nil)
		return
	}

	response.OK(c, "Image deleted successfully", gin.H{
		"deleted_image": imageURL,
		"article":       article,
	})
}

// isValidImageType checks if the content type is a valid image type.
func isValidImageType(contentType string) bool {
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	return validTypes[contentType]
}
