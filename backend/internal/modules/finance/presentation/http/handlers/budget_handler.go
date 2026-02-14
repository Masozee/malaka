package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// BudgetHandler handles HTTP requests for budget operations.
type BudgetHandler struct {
	service *services.BudgetService
}

// NewBudgetHandler creates a new BudgetHandler.
func NewBudgetHandler(service *services.BudgetService) *BudgetHandler {
	return &BudgetHandler{service: service}
}

// CreateBudget handles the creation of a new budget.
func (h *BudgetHandler) CreateBudget(c *gin.Context) {
	var req dto.BudgetCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	budget := req.ToBudgetEntity()
	if err := h.service.CreateBudget(c.Request.Context(), budget); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create budget", err)
		return
	}

	resp := dto.FromBudgetEntity(budget)
	response.Success(c, http.StatusCreated, "Budget created successfully", resp)
}

// GetBudgetByID handles the retrieval of a budget by ID.
func (h *BudgetHandler) GetBudgetByID(c *gin.Context) {
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

	budget, err := h.service.GetBudgetByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Budget not found", err)
		return
	}

	resp := dto.FromBudgetEntity(budget)
	response.Success(c, http.StatusOK, "Budget retrieved successfully", resp)
}

// GetAllBudgets handles the retrieval of all budgets.
func (h *BudgetHandler) GetAllBudgets(c *gin.Context) {
	budgets, err := h.service.GetAllBudgets(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve budgets", err)
		return
	}

	var responses []*dto.BudgetResponse
	for _, b := range budgets {
		responses = append(responses, dto.FromBudgetEntity(b))
	}

	response.Success(c, http.StatusOK, "Budgets retrieved successfully", responses)
}

// UpdateBudget handles the update of an existing budget.
func (h *BudgetHandler) UpdateBudget(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.BudgetUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	budget := req.ToBudgetEntity()
	budget.ID = parsedID

	if err := h.service.UpdateBudget(c.Request.Context(), budget); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update budget", err)
		return
	}

	resp := dto.FromBudgetEntity(budget)
	response.Success(c, http.StatusOK, "Budget updated successfully", resp)
}

// DeleteBudget handles the deletion of a budget by ID.
func (h *BudgetHandler) DeleteBudget(c *gin.Context) {
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

	if err := h.service.DeleteBudget(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete budget", err)
		return
	}

	response.Success(c, http.StatusOK, "Budget deleted successfully", nil)
}
