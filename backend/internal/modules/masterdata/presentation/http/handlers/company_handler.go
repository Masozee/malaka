package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// CompanyHandler handles HTTP requests for company operations.
type CompanyHandler struct {
	service *services.CompanyService
}

// NewCompanyHandler creates a new CompanyHandler.
func NewCompanyHandler(service *services.CompanyService) *CompanyHandler {
	return &CompanyHandler{service: service}
}

// CreateCompany handles the creation of a new company.
func (h *CompanyHandler) CreateCompany(c *gin.Context) {
	var req dto.CreateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	company := &entities.Company{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Address: req.Address,
		Status:  req.Status,
	}

	// Set default status if not provided
	if company.Status == "" {
		company.Status = "active"
	}

	if err := h.service.CreateCompany(c.Request.Context(), company); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Company created successfully", company)
}

// GetCompanyByID handles retrieving a company by its ID.
func (h *CompanyHandler) GetCompanyByID(c *gin.Context) {
	id := c.Param("id")
	company, err := h.service.GetCompanyByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if company == nil {
		response.NotFound(c, "Company not found", nil)
		return
	}

	response.OK(c, "Company retrieved successfully", company)
}

// GetAllCompanies handles retrieving all companies.
func (h *CompanyHandler) GetAllCompanies(c *gin.Context) {
	companies, err := h.service.GetAllCompanies(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Companies retrieved successfully", companies)
}

// UpdateCompany handles updating an existing company.
func (h *CompanyHandler) UpdateCompany(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	company := &entities.Company{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Address: req.Address,
		Status:  req.Status,
	}
	company.ID = uuid.MustParse(id) // Set the ID from the URL parameter

	// Set default status if not provided
	if company.Status == "" {
		company.Status = "active"
	}

	if err := h.service.UpdateCompany(c.Request.Context(), company); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Company updated successfully", company)
}

// DeleteCompany handles deleting a company by its ID.
func (h *CompanyHandler) DeleteCompany(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteCompany(c.Request.Context(), uuid.MustParse(id)); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Company deleted successfully", nil)
}
