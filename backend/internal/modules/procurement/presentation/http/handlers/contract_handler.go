package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/modules/procurement/domain/services"
	"malaka/internal/modules/procurement/presentation/http/dto"
	"malaka/internal/shared/response"
)

// ContractHandler handles HTTP requests for contract operations.
type ContractHandler struct {
	service *services.ContractService
}

// NewContractHandler creates a new ContractHandler.
func NewContractHandler(service *services.ContractService) *ContractHandler {
	return &ContractHandler{service: service}
}

// Create handles the creation of a new contract.
func (h *ContractHandler) Create(c *gin.Context) {
	var req dto.CreateContractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Convert DTO to entity
	contract := &entities.Contract{
		Title:        req.Title,
		SupplierID:   req.SupplierID,
		ContractType: req.ContractType,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Value:        req.Value,
		Currency:     req.Currency,
		AutoRenewal:  req.AutoRenewal,
	}
	if req.Description != "" {
		contract.Description = &req.Description
	}
	if req.PaymentTerms != "" {
		contract.PaymentTerms = &req.PaymentTerms
	}
	if req.TermsConditions != "" {
		contract.TermsConditions = &req.TermsConditions
	}
	if req.RenewalPeriod > 0 {
		contract.RenewalPeriod = &req.RenewalPeriod
	}
	if req.NoticePeriod > 0 {
		contract.NoticePeriod = &req.NoticePeriod
	}
	if contract.Currency == "" {
		contract.Currency = "IDR"
	}

	if err := h.service.Create(c.Request.Context(), contract); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Contract created successfully", contract)
}

// GetByID handles retrieving a contract by its ID.
func (h *ContractHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	contract, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract retrieved successfully", contract)
}

// GetAll handles retrieving all contracts with filters.
func (h *ContractHandler) GetAll(c *gin.Context) {
	filter := &repositories.ContractFilter{
		Search:       c.Query("search"),
		Status:       c.Query("status"),
		ContractType: c.Query("contract_type"),
		SupplierID:   c.Query("supplier_id"),
		SortBy:       c.Query("sortBy"),
		SortOrder:    c.Query("sortOrder"),
	}

	if expiringDays := c.Query("expiring_days"); expiringDays != "" {
		filter.ExpiringDays, _ = strconv.Atoi(expiringDays)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	filter.Page = page
	filter.Limit = limit

	contracts, total, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	result := dto.ContractListResponse{
		Data: contracts,
		Pagination: dto.Pagination{
			Page:      page,
			Limit:     limit,
			TotalRows: total,
		},
	}

	response.OK(c, "Contracts retrieved successfully", result)
}

// Update handles updating an existing contract.
func (h *ContractHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateContractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing contract
	existing, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	// Update fields
	if req.Title != "" {
		existing.Title = req.Title
	}
	if req.Description != "" {
		existing.Description = &req.Description
	}
	if req.ContractType != "" {
		existing.ContractType = req.ContractType
	}
	if !req.StartDate.IsZero() {
		existing.StartDate = req.StartDate
	}
	if !req.EndDate.IsZero() {
		existing.EndDate = req.EndDate
	}
	if req.Value > 0 {
		existing.Value = req.Value
	}
	if req.Currency != "" {
		existing.Currency = req.Currency
	}
	if req.PaymentTerms != "" {
		existing.PaymentTerms = &req.PaymentTerms
	}
	if req.TermsConditions != "" {
		existing.TermsConditions = &req.TermsConditions
	}
	existing.AutoRenewal = req.AutoRenewal
	if req.RenewalPeriod > 0 {
		existing.RenewalPeriod = &req.RenewalPeriod
	}
	if req.NoticePeriod > 0 {
		existing.NoticePeriod = &req.NoticePeriod
	}
	if req.SignedBy != "" {
		existing.SignedBy = &req.SignedBy
	}
	if req.SignedDate != nil {
		existing.SignedDate = req.SignedDate
	}

	if err := h.service.Update(c.Request.Context(), existing); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract updated successfully", existing)
}

// Delete handles deleting a contract.
func (h *ContractHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract deleted successfully", nil)
}

// Activate handles activating a draft contract.
func (h *ContractHandler) Activate(c *gin.Context) {
	id := c.Param("id")
	contract, err := h.service.Activate(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract activated successfully", contract)
}

// Terminate handles terminating an active contract.
func (h *ContractHandler) Terminate(c *gin.Context) {
	id := c.Param("id")
	var req dto.TerminateContractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// reason is optional, so continue even if binding fails
	}

	contract, err := h.service.Terminate(c.Request.Context(), id, req.Reason)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract terminated successfully", contract)
}

// Renew handles renewing a contract.
func (h *ContractHandler) Renew(c *gin.Context) {
	id := c.Param("id")
	var req dto.RenewContractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	contract, err := h.service.Renew(c.Request.Context(), id, req.EndDate)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract renewed successfully", contract)
}

// GetExpiring handles retrieving contracts expiring soon.
func (h *ContractHandler) GetExpiring(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	contracts, err := h.service.GetExpiring(c.Request.Context(), days)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Expiring contracts retrieved successfully", contracts)
}

// GetStats handles retrieving contract statistics.
func (h *ContractHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Contract statistics retrieved successfully", stats)
}
