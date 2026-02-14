package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// FinancialForecastHandler handles HTTP requests for financial forecast operations.
type FinancialForecastHandler struct {
	service *services.FinancialForecastService
}

// NewFinancialForecastHandler creates a new FinancialForecastHandler.
func NewFinancialForecastHandler(service *services.FinancialForecastService) *FinancialForecastHandler {
	return &FinancialForecastHandler{service: service}
}

// CreateFinancialForecast handles the creation of a new financial forecast.
func (h *FinancialForecastHandler) CreateFinancialForecast(c *gin.Context) {
	var req dto.FinancialForecastCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	forecast := req.ToFinancialForecastEntity()
	if err := h.service.CreateFinancialForecast(c.Request.Context(), forecast); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create financial forecast", err)
		return
	}

	resp := dto.FromFinancialForecastEntity(forecast)
	response.Success(c, http.StatusCreated, "Financial forecast created successfully", resp)
}

// GetFinancialForecastByID handles the retrieval of a financial forecast by ID.
func (h *FinancialForecastHandler) GetFinancialForecastByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	forecast, err := h.service.GetFinancialForecastByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Financial forecast not found", err)
		return
	}

	resp := dto.FromFinancialForecastEntity(forecast)
	response.Success(c, http.StatusOK, "Financial forecast retrieved successfully", resp)
}

// GetAllFinancialForecasts handles the retrieval of all financial forecasts.
func (h *FinancialForecastHandler) GetAllFinancialForecasts(c *gin.Context) {
	forecasts, err := h.service.GetAllFinancialForecasts(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve financial forecasts", err)
		return
	}

	var responses []*dto.FinancialForecastResponse
	for _, ff := range forecasts {
		responses = append(responses, dto.FromFinancialForecastEntity(ff))
	}

	response.Success(c, http.StatusOK, "Financial forecasts retrieved successfully", responses)
}

// UpdateFinancialForecast handles the update of an existing financial forecast.
func (h *FinancialForecastHandler) UpdateFinancialForecast(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.FinancialForecastUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	forecast := req.ToFinancialForecastEntity()
	forecast.ID = parsedID

	if err := h.service.UpdateFinancialForecast(c.Request.Context(), forecast); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update financial forecast", err)
		return
	}

	resp := dto.FromFinancialForecastEntity(forecast)
	response.Success(c, http.StatusOK, "Financial forecast updated successfully", resp)
}

// DeleteFinancialForecast handles the deletion of a financial forecast by ID.
func (h *FinancialForecastHandler) DeleteFinancialForecast(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	if err := h.service.DeleteFinancialForecast(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete financial forecast", err)
		return
	}

	response.Success(c, http.StatusOK, "Financial forecast deleted successfully", nil)
}
