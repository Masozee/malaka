package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// CustomerHandler handles HTTP requests for customer operations.
type CustomerHandler struct {
	service *services.CustomerService
}

// NewCustomerHandler creates a new CustomerHandler.
func NewCustomerHandler(service *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{service: service}
}

// CreateCustomer handles the creation of a new customer.
func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	var req dto.CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	customer := &entities.Customer{
		Name:          req.Name,
		ContactPerson: req.ContactPerson,
		Email:         req.Email,
		Phone:         req.Phone,
		CompanyID:     uuid.MustParse(req.CompanyID),
		Status:        req.Status,
	}

	if err := h.service.CreateCustomer(c.Request.Context(), customer); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Customer created successfully", customer)
}

// GetCustomerByID handles retrieving a customer by its ID.
func (h *CustomerHandler) GetCustomerByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	customer, err := h.service.GetCustomerByID(c.Request.Context(), parsedID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if customer == nil {
		response.NotFound(c, "Customer not found", nil)
		return
	}

	response.OK(c, "Customer retrieved successfully", customer)
}

// GetAllCustomers handles retrieving all customers with pagination support.
func (h *CustomerHandler) GetAllCustomers(c *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")
	
	// Ensure valid values
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Get customers with pagination
	customers, total, err := h.service.GetAllCustomersWithPagination(c.Request.Context(), limit, offset, search, status)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	// Calculate total pages
	totalPages := (total + limit - 1) / limit
	
	// Create paginated response
	paginatedResponse := map[string]interface{}{
		"data": customers,
		"pagination": types.Pagination{
			Page:       page,
			Limit:      limit,
			TotalRows:  total,
			TotalPages: totalPages,
		},
	}

	response.OK(c, "Customers retrieved successfully", paginatedResponse)
}

// UpdateCustomer handles updating an existing customer.
func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	var req dto.UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	customer, err := h.service.GetCustomerByID(c.Request.Context(), parsedID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if customer == nil {
		response.NotFound(c, "Customer not found", nil)
		return
	}

	if req.Name != "" {
		customer.Name = req.Name
	}
	if req.ContactPerson != "" {
		customer.ContactPerson = req.ContactPerson
	}
	if req.Email != "" {
		customer.Email = req.Email
	}
	if req.Phone != "" {
		customer.Phone = req.Phone
	}
	if req.CompanyID != "" {
		customer.CompanyID = uuid.MustParse(req.CompanyID)
	}
	if req.Status != "" {
		customer.Status = req.Status
	}

	if err := h.service.UpdateCustomer(c.Request.Context(), customer); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Customer updated successfully", customer)
}

// DeleteCustomer handles deleting a customer by its ID.
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	if err := h.service.DeleteCustomer(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Customer deleted successfully", nil)
}
