package handlers

import (
	"database/sql"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/modules/procurement/domain/services"
	"malaka/internal/modules/procurement/presentation/http/dto"
	"malaka/internal/shared/response"
)

// VendorEvaluationHandler handles HTTP requests for vendor evaluation operations.
type VendorEvaluationHandler struct {
	service *services.VendorEvaluationService
	db      *sqlx.DB
}

// NewVendorEvaluationHandler creates a new VendorEvaluationHandler.
func NewVendorEvaluationHandler(service *services.VendorEvaluationService, db *sqlx.DB) *VendorEvaluationHandler {
	return &VendorEvaluationHandler{service: service, db: db}
}

// getDefaultUserID retrieves a default admin user ID from the database for development/testing.
func (h *VendorEvaluationHandler) getDefaultUserID() (string, error) {
	var userID string
	err := h.db.QueryRow(`SELECT id FROM users WHERE role = 'admin' AND status = 'active' LIMIT 1`).Scan(&userID)
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}
	if userID == "" {
		// Fallback to any active user
		err = h.db.QueryRow(`SELECT id FROM users WHERE status = 'active' LIMIT 1`).Scan(&userID)
		if err != nil {
			return "", err
		}
	}
	return userID, nil
}

// Create handles the creation of a new vendor evaluation.
func (h *VendorEvaluationHandler) Create(c *gin.Context) {
	var req dto.CreateVendorEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get evaluator ID from request or auth context
	evaluatorID := req.EvaluatorID
	if evaluatorID == "" {
		evaluatorID = c.GetString("user_id")
	}

	// If still empty, get default user for development/testing
	if evaluatorID == "" {
		defaultUserID, err := h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to get default user: "+err.Error(), nil)
			return
		}
		if defaultUserID == "" {
			response.BadRequest(c, "evaluator_id is required and no default user found", nil)
			return
		}
		evaluatorID = defaultUserID
	}

	// Convert DTO to entity
	evaluation := &entities.VendorEvaluation{
		SupplierID:            req.SupplierID,
		EvaluationPeriodStart: req.EvaluationPeriodStart,
		EvaluationPeriodEnd:   req.EvaluationPeriodEnd,
		EvaluatorID:           evaluatorID,
		QualityScore:          req.QualityScore,
		DeliveryScore:         req.DeliveryScore,
		PriceScore:            req.PriceScore,
		ServiceScore:          req.ServiceScore,
		ComplianceScore:       req.ComplianceScore,
	}
	if req.QualityComments != "" {
		evaluation.QualityComments = &req.QualityComments
	}
	if req.DeliveryComments != "" {
		evaluation.DeliveryComments = &req.DeliveryComments
	}
	if req.PriceComments != "" {
		evaluation.PriceComments = &req.PriceComments
	}
	if req.ServiceComments != "" {
		evaluation.ServiceComments = &req.ServiceComments
	}
	if req.ComplianceComments != "" {
		evaluation.ComplianceComments = &req.ComplianceComments
	}
	if req.OverallComments != "" {
		evaluation.OverallComments = &req.OverallComments
	}
	if req.ActionItems != "" {
		evaluation.ActionItems = &req.ActionItems
	}

	if err := h.service.Create(c.Request.Context(), evaluation); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Vendor evaluation created successfully", evaluation)
}

// GetByID handles retrieving a vendor evaluation by its ID.
func (h *VendorEvaluationHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	evaluation, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor evaluation retrieved successfully", evaluation)
}

// GetAll handles retrieving all vendor evaluations with filters.
func (h *VendorEvaluationHandler) GetAll(c *gin.Context) {
	filter := &repositories.VendorEvaluationFilter{
		Search:         c.Query("search"),
		Status:         c.Query("status"),
		SupplierID:     c.Query("supplier_id"),
		EvaluatorID:    c.Query("evaluator_id"),
		Recommendation: c.Query("recommendation"),
		SortBy:         c.Query("sortBy"),
		SortOrder:      c.Query("sortOrder"),
	}

	if minScore := c.Query("min_overall_score"); minScore != "" {
		filter.MinOverallScore, _ = strconv.ParseFloat(minScore, 64)
	}
	if maxScore := c.Query("max_overall_score"); maxScore != "" {
		filter.MaxOverallScore, _ = strconv.ParseFloat(maxScore, 64)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	filter.Page = page
	filter.Limit = limit

	evaluations, total, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	result := dto.VendorEvaluationListResponse{
		Data: evaluations,
		Pagination: dto.Pagination{
			Page:      page,
			Limit:     limit,
			TotalRows: total,
		},
	}

	response.OK(c, "Vendor evaluations retrieved successfully", result)
}

// Update handles updating an existing vendor evaluation.
func (h *VendorEvaluationHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateVendorEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing evaluation
	existing, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	// Update fields
	if req.EvaluationPeriodStart != nil {
		existing.EvaluationPeriodStart = *req.EvaluationPeriodStart
	}
	if req.EvaluationPeriodEnd != nil {
		existing.EvaluationPeriodEnd = *req.EvaluationPeriodEnd
	}
	if req.QualityScore > 0 {
		existing.QualityScore = req.QualityScore
	}
	if req.DeliveryScore > 0 {
		existing.DeliveryScore = req.DeliveryScore
	}
	if req.PriceScore > 0 {
		existing.PriceScore = req.PriceScore
	}
	if req.ServiceScore > 0 {
		existing.ServiceScore = req.ServiceScore
	}
	if req.ComplianceScore > 0 {
		existing.ComplianceScore = req.ComplianceScore
	}
	if req.QualityComments != "" {
		existing.QualityComments = &req.QualityComments
	}
	if req.DeliveryComments != "" {
		existing.DeliveryComments = &req.DeliveryComments
	}
	if req.PriceComments != "" {
		existing.PriceComments = &req.PriceComments
	}
	if req.ServiceComments != "" {
		existing.ServiceComments = &req.ServiceComments
	}
	if req.ComplianceComments != "" {
		existing.ComplianceComments = &req.ComplianceComments
	}
	if req.OverallComments != "" {
		existing.OverallComments = &req.OverallComments
	}
	if req.ActionItems != "" {
		existing.ActionItems = &req.ActionItems
	}

	if err := h.service.Update(c.Request.Context(), existing); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor evaluation updated successfully", existing)
}

// Delete handles deleting a vendor evaluation.
func (h *VendorEvaluationHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor evaluation deleted successfully", nil)
}

// Complete handles marking an evaluation as completed.
func (h *VendorEvaluationHandler) Complete(c *gin.Context) {
	id := c.Param("id")
	evaluation, err := h.service.Complete(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor evaluation completed successfully", evaluation)
}

// Approve handles approving a completed evaluation.
func (h *VendorEvaluationHandler) Approve(c *gin.Context) {
	id := c.Param("id")
	evaluation, err := h.service.Approve(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor evaluation approved successfully", evaluation)
}

// GetBySupplierID handles retrieving all evaluations for a supplier.
func (h *VendorEvaluationHandler) GetBySupplierID(c *gin.Context) {
	supplierID := c.Param("supplierId")
	evaluations, err := h.service.GetBySupplierID(c.Request.Context(), supplierID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier evaluations retrieved successfully", evaluations)
}

// GetSupplierScore handles retrieving the average score for a supplier.
func (h *VendorEvaluationHandler) GetSupplierScore(c *gin.Context) {
	supplierID := c.Param("supplierId")
	score, err := h.service.GetSupplierAverageScore(c.Request.Context(), supplierID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier score retrieved successfully", map[string]float64{
		"average_score": score,
	})
}

// GetStats handles retrieving vendor evaluation statistics.
func (h *VendorEvaluationHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor evaluation statistics retrieved successfully", stats)
}
