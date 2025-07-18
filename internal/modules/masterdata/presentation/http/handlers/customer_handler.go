package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
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
		Name:    req.Name,
		Address: req.Address,
		Contact: req.Contact,
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
	customer, err := h.service.GetCustomerByID(c.Request.Context(), id)
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

// GetAllCustomers handles retrieving all customers.
func (h *CustomerHandler) GetAllCustomers(c *gin.Context) {
	customers, err := h.service.GetAllCustomers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Customers retrieved successfully", customers)
}

// UpdateCustomer handles updating an existing customer.
func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	customer := &entities.Customer{
		Name:    req.Name,
		Address: req.Address,
		Contact: req.Contact,
	}
	customer.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateCustomer(c.Request.Context(), customer); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Customer updated successfully", customer)
}

// DeleteCustomer handles deleting a customer by its ID.
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteCustomer(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Customer deleted successfully", nil)
}
