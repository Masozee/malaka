package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// ArticleHandler handles HTTP requests for article operations.
type ArticleHandler struct {
	service *services.ArticleService
}

// NewArticleHandler creates a new ArticleHandler.
func NewArticleHandler(service *services.ArticleService) *ArticleHandler {
	return &ArticleHandler{service: service}
}

// CreateArticle handles the creation of a new article.
func (h *ArticleHandler) CreateArticle(c *gin.Context) {
	var req dto.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	article := &entities.Article{
		Name:            req.Name,
		Description:     req.Description,
		ClassificationID: req.ClassificationID,
		ColorID:         req.ColorID,
		ModelID:         req.ModelID,
		SizeID:          req.SizeID,
		SupplierID:      req.SupplierID,
		Barcode:         req.Barcode,
		Price:           req.Price,
	}

	if err := h.service.CreateArticle(c.Request.Context(), article); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article created successfully", article)
}

// GetArticleByID handles retrieving an article by its ID.
func (h *ArticleHandler) GetArticleByID(c *gin.Context) {
	id := c.Param("id")
	article, err := h.service.GetArticleByID(c.Request.Context(), id)
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
func (h *ArticleHandler) UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	article := &entities.Article{
		Name:            req.Name,
		Description:     req.Description,
		ClassificationID: req.ClassificationID,
		ColorID:         req.ColorID,
		ModelID:         req.ModelID,
		SizeID:          req.SizeID,
		SupplierID:      req.SupplierID,
		Barcode:         req.Barcode,
		Price:           req.Price,
	}
	article.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateArticle(c.Request.Context(), article); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article updated successfully", article)
}

// DeleteArticle handles deleting an article by its ID.
func (h *ArticleHandler) DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteArticle(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Article deleted successfully", nil)
}
