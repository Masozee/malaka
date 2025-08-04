package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// FixedAssetHandler handles HTTP requests for fixed assets
type FixedAssetHandler struct {
	service services.FixedAssetService
}

// NewFixedAssetHandler creates a new FixedAssetHandler
func NewFixedAssetHandler(service services.FixedAssetService) *FixedAssetHandler {
	return &FixedAssetHandler{service: service}
}

// CreateFixedAsset creates a new fixed asset
func (h *FixedAssetHandler) CreateFixedAsset(c *gin.Context) {
	var req dto.FixedAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	asset := dto.MapFixedAssetRequestToEntity(&req)
	if err := h.service.CreateFixedAsset(c.Request.Context(), asset); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, dto.MapFixedAssetEntityToResponse(asset))
}

// GetFixedAssetByID retrieves a fixed asset by its ID
func (h *FixedAssetHandler) GetFixedAssetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	asset, err := h.service.GetFixedAssetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapFixedAssetEntityToResponse(asset))
}

// GetAllFixedAssets retrieves all fixed assets
func (h *FixedAssetHandler) GetAllFixedAssets(c *gin.Context) {
	assets, err := h.service.GetAllFixedAssets(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// UpdateFixedAsset updates an existing fixed asset
func (h *FixedAssetHandler) UpdateFixedAsset(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	var req dto.FixedAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	asset := dto.MapFixedAssetRequestToEntity(&req)
	asset.ID = id

	if err := h.service.UpdateFixedAsset(c.Request.Context(), asset); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapFixedAssetEntityToResponse(asset))
}

// DeleteFixedAsset deletes a fixed asset
func (h *FixedAssetHandler) DeleteFixedAsset(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	if err := h.service.DeleteFixedAsset(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusNoContent, nil)
}

// CalculateDepreciation handles the calculation of depreciation for a fixed asset
func (h *FixedAssetHandler) CalculateDepreciation(c *gin.Context) {
	assetIDStr := c.Param("id")
	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Asset ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	depreciationEntry, err := h.service.CalculateDepreciation(c.Request.Context(), assetID, period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dto.MapDepreciationEntryEntityToResponse(depreciationEntry))
}

// GetDepreciationSchedule handles retrieving the depreciation schedule for a fixed asset
func (h *FixedAssetHandler) GetDepreciationSchedule(c *gin.Context) {
	assetIDStr := c.Param("id")
	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Asset ID format.")
		return
	}
	depreciationSchedule, err := h.service.GetDepreciationSchedule(c.Request.Context(), assetID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.DepreciationEntryResponse
	for _, entry := range depreciationSchedule {
		dtos = append(dtos, *dto.MapDepreciationEntryEntityToResponse(entry))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GenerateMonthlyDepreciation handles generating monthly depreciation entries
func (h *FixedAssetHandler) GenerateMonthlyDepreciation(c *gin.Context) {
	companyID := c.Param("company_id")
	monthStr := c.Param("month")
	yearStr := c.Param("year")

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid month format.")
		return
	}
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid year format.")
		return
	}

	depreciationEntries, err := h.service.GenerateMonthlyDepreciation(c.Request.Context(), companyID, month, year)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.DepreciationEntryResponse
	for _, entry := range depreciationEntries {
		dtos = append(dtos, *dto.MapDepreciationEntryEntityToResponse(entry))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetFixedAssetsByCompany retrieves fixed assets by company
func (h *FixedAssetHandler) GetFixedAssetsByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	assets, err := h.service.GetFixedAssetsByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetFixedAssetsByCategory retrieves fixed assets by category
func (h *FixedAssetHandler) GetFixedAssetsByCategory(c *gin.Context) {
	companyID := c.Param("company_id")
	category := c.Param("category")
	assets, err := h.service.GetFixedAssetsByCategory(c.Request.Context(), companyID, category)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetFixedAssetsByStatus retrieves fixed assets by status
func (h *FixedAssetHandler) GetFixedAssetsByStatus(c *gin.Context) {
	companyID := c.Param("company_id")
	statusStr := c.Param("status")
	assets, err := h.service.GetFixedAssetsByStatus(c.Request.Context(), companyID, entities.FixedAssetStatus(statusStr))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetFixedAssetsByLocation retrieves fixed assets by location
func (h *FixedAssetHandler) GetFixedAssetsByLocation(c *gin.Context) {
	companyID := c.Param("company_id")
	location := c.Param("location")
	assets, err := h.service.GetFixedAssetsByLocation(c.Request.Context(), companyID, location)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetFixedAssetsByAcquisitionDateRange retrieves fixed assets by acquisition date range
func (h *FixedAssetHandler) GetFixedAssetsByAcquisitionDateRange(c *gin.Context) {
	companyID := c.Param("company_id")
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	assets, err := h.service.GetFixedAssetsByAcquisitionDateRange(c.Request.Context(), companyID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// DisposeFixedAsset handles the disposal of a fixed asset
func (h *FixedAssetHandler) DisposeFixedAsset(c *gin.Context) {
	assetIDStr := c.Param("id")
	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Asset ID format.")
		return
	}
	var req struct {
		DisposalDate   time.Time `json:"disposal_date" binding:"required"`
		DisposalAmount float64   `json:"disposal_amount" binding:"required"`
		DisposedBy     string    `json:"disposed_by" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.service.DisposeFixedAsset(c.Request.Context(), assetID, req.DisposalDate, req.DisposalAmount, req.DisposedBy); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Fixed asset disposed successfully"})
}

// RevalueFixedAsset handles the revaluation of a fixed asset
func (h *FixedAssetHandler) RevalueFixedAsset(c *gin.Context) {
	assetIDStr := c.Param("id")
	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Asset ID format.")
		return
	}
	var req struct {
		RevaluationDate time.Time `json:"revaluation_date" binding:"required"`
		RevaluedAmount  float64   `json:"revalued_amount" binding:"required"`
		RevaluedBy      string    `json:"revalued_by" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.service.RevalueFixedAsset(c.Request.Context(), assetID, req.RevaluationDate, req.RevaluedAmount, req.RevaluedBy); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Fixed asset revalued successfully"})
}

// TransferFixedAsset handles the transfer of a fixed asset
func (h *FixedAssetHandler) TransferFixedAsset(c *gin.Context) {
	assetIDStr := c.Param("id")
	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Asset ID format.")
		return
	}
	var req struct {
		NewLocation string `json:"new_location" binding:"required"`
		TransferredBy string `json:"transferred_by" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.service.TransferFixedAsset(c.Request.Context(), assetID, req.NewLocation, req.TransferredBy); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Fixed asset transferred successfully"})
}

// GetFixedAssetRegister handles retrieving the fixed asset register
func (h *FixedAssetHandler) GetFixedAssetRegister(c *gin.Context) {
	companyID := c.Param("company_id")
	assets, err := h.service.GetFixedAssetRegister(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetDepreciationReport handles retrieving the depreciation report
func (h *FixedAssetHandler) GetDepreciationReport(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStartStr := c.Param("period_start")
	periodEndStr := c.Param("period_end")

	periodStart, err := time.Parse("2006-01-02", periodStartStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	periodEnd, err := time.Parse("2006-01-02", periodEndStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	report, err := h.service.GetDepreciationReport(c.Request.Context(), companyID, periodStart, periodEnd)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.DepreciationEntryResponse
	for _, entry := range report {
		dtos = append(dtos, *dto.MapDepreciationEntryEntityToResponse(entry))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetAssetValuationReport handles retrieving the asset valuation report
func (h *FixedAssetHandler) GetAssetValuationReport(c *gin.Context) {
	companyID := c.Param("company_id")
	asOfDateStr := c.Param("as_of_date")
	asOfDate, err := time.Parse("2006-01-02", asOfDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD.")
		return
	}
	assets, err := h.service.GetAssetValuationReport(c.Request.Context(), companyID, asOfDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, *dto.MapFixedAssetEntityToResponse(asset))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetFixedAssetSummary handles retrieving the fixed asset summary
func (h *FixedAssetHandler) GetFixedAssetSummary(c *gin.Context) {
	companyID := c.Param("company_id")
	summary, err := h.service.GetFixedAssetSummary(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dto.MapFixedAssetSummaryEntityToResponse(summary))
}

// GetFixedAssetAuditTrail handles retrieving the fixed asset audit trail
func (h *FixedAssetHandler) GetFixedAssetAuditTrail(c *gin.Context) {
	assetIDStr := c.Param("id")
	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Asset ID format.")
		return
	}
	auditTrail, err := h.service.GetFixedAssetAuditTrail(c.Request.Context(), assetID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, auditTrail)
}

// VerifyAssetIntegrity handles verifying asset integrity
func (h *FixedAssetHandler) VerifyAssetIntegrity(c *gin.Context) {
	companyID := c.Param("company_id")
	integrityReport, err := h.service.VerifyAssetIntegrity(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, integrityReport)
}
