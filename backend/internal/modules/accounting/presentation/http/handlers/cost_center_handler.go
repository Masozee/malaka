package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// CostCenterHandler handles HTTP requests for cost centers
type CostCenterHandler struct {
	service services.CostCenterService
}

// NewCostCenterHandler creates a new CostCenterHandler
func NewCostCenterHandler(service services.CostCenterService) *CostCenterHandler {
	return &CostCenterHandler{service: service}
}

// GetAllCostCenters retrieves all cost centers
func (h *CostCenterHandler) GetAllCostCenters(c *gin.Context) {
	costCenters, err := h.service.GetAllCostCenters(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	
	response.Success(c, http.StatusOK, "Cost centers retrieved successfully", dtos)
}

// GetCostCenterByID retrieves a cost center by its ID
func (h *CostCenterHandler) GetCostCenterByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.", nil)
		return
	}

	costCenter, err := h.service.GetCostCenterByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Cost center retrieved successfully", dto.MapCostCenterEntityToResponse(costCenter))
}

// CreateCostCenter creates a new cost center
func (h *CostCenterHandler) CreateCostCenter(c *gin.Context) {
	var req dto.CostCenterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	costCenter := dto.MapCostCenterRequestToEntity(&req)
	costCenter.ID = uuid.New()

	if err := h.service.CreateCostCenter(c.Request.Context(), costCenter); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Cost center created successfully", dto.MapCostCenterEntityToResponse(costCenter))
}

// UpdateCostCenter updates an existing cost center
func (h *CostCenterHandler) UpdateCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.", nil)
		return
	}

	var req dto.CostCenterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	costCenter := dto.MapCostCenterRequestToEntity(&req)
	costCenter.ID = id

	if err := h.service.UpdateCostCenter(c.Request.Context(), costCenter); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Cost center updated successfully", dto.MapCostCenterEntityToResponse(costCenter))
}

// DeleteCostCenter deletes a cost center
func (h *CostCenterHandler) DeleteCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.", nil)
		return
	}

	if err := h.service.DeleteCostCenter(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusNoContent, "Cost center deleted successfully", nil)
}

// GetCostCenterByCode retrieves a cost center by its code
func (h *CostCenterHandler) GetCostCenterByCode(c *gin.Context) {
	code := c.Param("code")
	costCenter, err := h.service.GetCostCenterByCode(c.Request.Context(), code)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Cost center retrieved successfully", dto.MapCostCenterEntityToResponse(costCenter))
}

// GetActiveCostCentersByCompany retrieves active cost centers by company
func (h *CostCenterHandler) GetActiveCostCentersByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	costCenters, err := h.service.GetActiveCostCentersByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, "Active cost centers retrieved successfully", dtos)
}

// DeactivateCostCenter deactivates a cost center
func (h *CostCenterHandler) DeactivateCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.", nil)
		return
	}
	
	if err := h.service.DeactivateCostCenter(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	
	response.Success(c, http.StatusOK, "Cost center deactivated successfully", nil)
}

// ReactivateCostCenter reactivates a cost center
func (h *CostCenterHandler) ReactivateCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.", nil)
		return
	}
	
	if err := h.service.ReactivateCostCenter(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	
	response.Success(c, http.StatusOK, "Cost center reactivated successfully", nil)
}