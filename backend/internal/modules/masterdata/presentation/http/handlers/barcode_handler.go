package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/infrastructure/external"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// BarcodeHandler handles HTTP requests for barcode operations.
type BarcodeHandler struct {
	service           *services.BarcodeService
	generatorService external.BarcodeGeneratorService
}

// NewBarcodeHandler creates a new BarcodeHandler.
func NewBarcodeHandler(service *services.BarcodeService, generatorService external.BarcodeGeneratorService) *BarcodeHandler {
	return &BarcodeHandler{
		service:          service,
		generatorService: generatorService,
	}
}

// CreateBarcode handles the creation of a new barcode.
func (h *BarcodeHandler) CreateBarcode(c *gin.Context) {
	var req dto.CreateBarcodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Use DTO's ToEntity method which handles UUID conversion properly
	barcode := req.ToEntity()

	if err := h.service.CreateBarcode(c.Request.Context(), barcode); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode created successfully", barcode)
}

// GetBarcodeByID handles retrieving a barcode by its ID.
func (h *BarcodeHandler) GetBarcodeByID(c *gin.Context) {
	id := c.Param("id")
	barcode, err := h.service.GetBarcodeByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if barcode == nil {
		response.NotFound(c, "Barcode not found", nil)
		return
	}

	response.OK(c, "Barcode retrieved successfully", barcode)
}

// GetAllBarcodes handles retrieving all barcodes.
func (h *BarcodeHandler) GetAllBarcodes(c *gin.Context) {
	barcodes, err := h.service.GetAllBarcodes(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcodes retrieved successfully", barcodes)
}

// UpdateBarcode handles updating an existing barcode.
func (h *BarcodeHandler) UpdateBarcode(c *gin.Context) {
	id := c.Param("id")

	// First, retrieve the existing barcode
	existingBarcode, err := h.service.GetBarcodeByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if existingBarcode == nil {
		response.NotFound(c, "Barcode not found", nil)
		return
	}

	var req dto.UpdateBarcodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Use DTO's ApplyToEntity method which handles UUID conversion properly
	req.ApplyToEntity(existingBarcode)

	if err := h.service.UpdateBarcode(c.Request.Context(), existingBarcode); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode updated successfully", existingBarcode)
}

// DeleteBarcode handles deleting a barcode by its ID.
func (h *BarcodeHandler) DeleteBarcode(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteBarcode(c.Request.Context(), uuid.MustParse(id)); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode deleted successfully", nil)
}

// GenerateBarcode handles generating a single barcode image
func (h *BarcodeHandler) GenerateBarcode(c *gin.Context) {
	var req external.BarcodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	result, err := h.generatorService.GenerateBarcode(c.Request.Context(), req)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode generated successfully", result)
}

// GenerateBatchBarcodes handles generating multiple barcodes concurrently
func (h *BarcodeHandler) GenerateBatchBarcodes(c *gin.Context) {
	var req struct {
		Requests []external.BarcodeRequest `json:"requests"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	if len(req.Requests) == 0 {
		response.BadRequest(c, "No barcode requests provided", nil)
		return
	}

	if len(req.Requests) > 100 {
		response.BadRequest(c, "Maximum 100 barcodes can be generated at once", nil)
		return
	}

	result, err := h.generatorService.GenerateBatch(c.Request.Context(), req.Requests)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Batch barcodes generated successfully", result)
}

// GenerateArticleBarcodes handles generating barcodes for specific articles
func (h *BarcodeHandler) GenerateArticleBarcodes(c *gin.Context) {
	var req struct {
		ArticleIDs []string                     `json:"article_ids"`
		Format     external.BarcodeFormat       `json:"format"`
		Width      int                          `json:"width,omitempty"`
		Height     int                          `json:"height,omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	if len(req.ArticleIDs) == 0 {
		response.BadRequest(c, "No article IDs provided", nil)
		return
	}

	if len(req.ArticleIDs) > 100 {
		response.BadRequest(c, "Maximum 100 articles can be processed at once", nil)
		return
	}

	// Fetch articles to get barcode data
	barcodeRequests := make([]external.BarcodeRequest, 0, len(req.ArticleIDs))
	for _, articleID := range req.ArticleIDs {
		// Get existing barcode for the article
		existingBarcodes, err := h.service.GetBarcodesByArticleID(c.Request.Context(), uuid.MustParse(articleID))
		if err != nil {
			response.InternalServerError(c, "Failed to fetch article barcodes: "+err.Error(), nil)
			return
		}

		barcodeData := articleID // Default to article ID if no barcode exists
		if len(existingBarcodes) > 0 {
			barcodeData = existingBarcodes[0].Code
		}

		barcodeRequests = append(barcodeRequests, external.BarcodeRequest{
			ID:     articleID,
			Data:   barcodeData,
			Format: req.Format,
			Width:  req.Width,
			Height: req.Height,
		})
	}

	result, err := h.generatorService.GenerateBatch(c.Request.Context(), barcodeRequests)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article barcodes generated successfully", result)
}

// GenerateAllArticleBarcodes handles generating barcodes for ALL articles in the database
func (h *BarcodeHandler) GenerateAllArticleBarcodes(c *gin.Context) {
	var req struct {
		Format external.BarcodeFormat `json:"format"`
		Width  int                    `json:"width,omitempty"`
		Height int                    `json:"height,omitempty"`
		SaveToDatabase bool            `json:"save_to_database"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Set default format if not provided
	if req.Format == "" {
		req.Format = external.CODE128
	}

	// Fetch all articles from database
	articles, err := h.service.GetAllArticlesForBarcodeGeneration(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to fetch articles: "+err.Error(), nil)
		return
	}

	if len(articles) == 0 {
		response.OK(c, "No articles found to generate barcodes", nil)
		return
	}

	// Create barcode requests for all articles
	barcodeRequests := make([]external.BarcodeRequest, 0, len(articles))
	for _, article := range articles {
		// Use existing barcode if available, otherwise generate one based on article ID
		articleIDStr := article.ID.String()
		barcodeData := article.Barcode
		if barcodeData == "" {
			// Generate a simple barcode from article name/id
			barcodeData = "ART" + articleIDStr[:8] // First 8 chars of UUID
		}

		barcodeRequests = append(barcodeRequests, external.BarcodeRequest{
			ID:     articleIDStr,
			Data:   barcodeData,
			Format: req.Format,
			Width:  req.Width,
			Height: req.Height,
		})
	}

	// Generate all barcodes (this will automatically save to MinIO)
	result, err := h.generatorService.GenerateBatch(c.Request.Context(), barcodeRequests)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Optionally save barcode URLs back to articles table
	if req.SaveToDatabase {
		updateCount := 0
		for _, barcodeResult := range result.Results {
			if barcodeResult.ImageURL != "" && barcodeResult.Error == "" {
				err := h.service.UpdateArticleBarcodeURL(c.Request.Context(), uuid.MustParse(barcodeResult.ID), barcodeResult.ImageURL)
				if err != nil {
					// Log error but don't fail the entire operation
					continue
				}
				updateCount++
			}
		}
		result.UpdatedArticlesCount = updateCount
	}

	response.OK(c, "All article barcodes generated successfully", result)
}
