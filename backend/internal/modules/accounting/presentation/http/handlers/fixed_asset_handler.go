package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"malaka/internal/shared/uuid"
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
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	asset := dto.MapFixedAssetRequestToEntity(&req)
	asset.ID = uuid.New()

	// Auto-generate asset_code if not provided
	if asset.AssetCode == "" {
		categoryPrefix := "AST"
		if req.Category != "" {
			prefixMap := map[string]string{
				"BUILDING": "BLD", "MACHINERY": "MCH", "VEHICLE": "VHC",
				"EQUIPMENT": "EQP", "COMPUTER": "CMP", "FURNITURE": "FRN",
			}
			if p, ok := prefixMap[strings.ToUpper(req.Category)]; ok {
				categoryPrefix = p
			}
		}
		asset.AssetCode = fmt.Sprintf("%s-%s-%s", categoryPrefix, time.Now().Format("0601"), asset.ID.String()[:8])
	}

	if err := h.service.CreateFixedAsset(c.Request.Context(), asset); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Fixed asset created successfully", dto.MapFixedAssetEntityToResponse(asset))
}

// GetFixedAssetByID retrieves a fixed asset by ID
func (h *FixedAssetHandler) GetFixedAssetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	asset, err := h.service.GetFixedAssetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Fixed asset retrieved successfully", dto.MapFixedAssetEntityToResponse(asset))
}

// GetAllFixedAssets retrieves all fixed assets
func (h *FixedAssetHandler) GetAllFixedAssets(c *gin.Context) {
	assets, err := h.service.GetAllFixedAssets(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, dto.MapFixedAssetEntityToResponse(asset))
	}

	response.Success(c, http.StatusOK, "Fixed assets retrieved successfully", dtos)
}

// UpdateFixedAsset updates a fixed asset
func (h *FixedAssetHandler) UpdateFixedAsset(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.FixedAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	asset := dto.MapFixedAssetRequestToEntity(&req)
	asset.ID = id

	if err := h.service.UpdateFixedAsset(c.Request.Context(), asset); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Fixed asset updated successfully", dto.MapFixedAssetEntityToResponse(asset))
}

// DeleteFixedAsset deletes a fixed asset
func (h *FixedAssetHandler) DeleteFixedAsset(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteFixedAsset(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Fixed asset deleted successfully", nil)
}

// GetFixedAssetsByCategory retrieves fixed assets by category
func (h *FixedAssetHandler) GetFixedAssetsByCategory(c *gin.Context) {
	category := c.Param("category")

	assets, err := h.service.GetFixedAssetsByCategory(c.Request.Context(), category)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, dto.MapFixedAssetEntityToResponse(asset))
	}

	response.Success(c, http.StatusOK, "Fixed assets retrieved successfully", dtos)
}

// GetFixedAssetsByStatus retrieves fixed assets by status
func (h *FixedAssetHandler) GetFixedAssetsByStatus(c *gin.Context) {
	statusStr := c.Param("status")
	status := entities.FixedAssetStatus(statusStr)

	assets, err := h.service.GetFixedAssetsByStatus(c.Request.Context(), status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, dto.MapFixedAssetEntityToResponse(asset))
	}

	response.Success(c, http.StatusOK, "Fixed assets retrieved successfully", dtos)
}

// SearchFixedAssets searches fixed assets
func (h *FixedAssetHandler) SearchFixedAssets(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")
	searchTerm := c.Query("q")

	if searchTerm == "" {
		response.Error(c, http.StatusBadRequest, "Search term is required", nil)
		return
	}

	assets, err := h.service.SearchFixedAssets(c.Request.Context(), companyID, searchTerm)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, dto.MapFixedAssetEntityToResponse(asset))
	}

	response.Success(c, http.StatusOK, "Fixed assets retrieved successfully", dtos)
}

// GetAssetSummary retrieves asset summary
func (h *FixedAssetHandler) GetAssetSummary(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")

	summary, err := h.service.GetAssetSummary(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Asset summary retrieved successfully", summary)
}

// ProcessDepreciation processes depreciation for an asset
func (h *FixedAssetHandler) ProcessDepreciation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	depreciation, err := h.service.ProcessDepreciation(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Depreciation processed successfully", dto.MapDepreciationEntryEntityToResponse(depreciation))
}

// GetDepreciationSchedule retrieves depreciation schedule for an asset
func (h *FixedAssetHandler) GetDepreciationSchedule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	depreciations, err := h.service.GetDepreciationSchedule(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.DepreciationEntryResponse
	for _, dep := range depreciations {
		dtos = append(dtos, dto.MapDepreciationEntryEntityToResponse(dep))
	}

	response.Success(c, http.StatusOK, "Depreciation schedule retrieved successfully", dtos)
}

// ProcessMonthlyDepreciation processes monthly depreciation for all assets
func (h *FixedAssetHandler) ProcessMonthlyDepreciation(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")

	// Use current month if not specified
	month := time.Now()

	if err := h.service.ProcessMonthlyDepreciation(c.Request.Context(), companyID, month); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Monthly depreciation processed successfully", nil)
}

// DisposeFixedAssetRequest represents a disposal request
type DisposeFixedAssetRequest struct {
	DisposalDate   time.Time `json:"disposal_date" binding:"required"`
	DisposalMethod string    `json:"disposal_method" binding:"required"`
	DisposalPrice  float64   `json:"disposal_price"`
	Reason         string    `json:"reason" binding:"required"`
	AuthorizedBy   string    `json:"authorized_by"`
}

// DisposeFixedAsset disposes a fixed asset
func (h *FixedAssetHandler) DisposeFixedAsset(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req DisposeFixedAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	disposal := &entities.FixedAssetDisposal{
		FixedAssetID:   id,
		DisposalDate:   req.DisposalDate,
		DisposalMethod: req.DisposalMethod,
		DisposalPrice:  req.DisposalPrice,
		Reason:         req.Reason,
		AuthorizedBy:   req.AuthorizedBy,
		CreatedBy:      "system", // TODO: Get from auth context
	}

	if err := h.service.DisposeAsset(c.Request.Context(), disposal); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Fixed asset disposed successfully", disposal)
}

// GetFullyDepreciatedAssets retrieves fully depreciated assets
func (h *FixedAssetHandler) GetFullyDepreciatedAssets(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")

	assets, err := h.service.GetFullyDepreciatedAssets(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, dto.MapFixedAssetEntityToResponse(asset))
	}

	response.Success(c, http.StatusOK, "Fully depreciated assets retrieved successfully", dtos)
}

// GetAssetsWithExpiredWarranty retrieves assets with expired warranty
func (h *FixedAssetHandler) GetAssetsWithExpiredWarranty(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")

	assets, err := h.service.GetAssetsWithExpiredWarranty(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []*dto.FixedAssetResponse
	for _, asset := range assets {
		dtos = append(dtos, dto.MapFixedAssetEntityToResponse(asset))
	}

	response.Success(c, http.StatusOK, "Assets with expired warranty retrieved successfully", dtos)
}
