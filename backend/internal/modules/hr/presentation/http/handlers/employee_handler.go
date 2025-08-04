package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/hr/domain/services"
	"malaka/internal/modules/hr/presentation/http/dto"
	"malaka/internal/shared/response"
)

// EmployeeHandler handles HTTP requests for employee operations.
type EmployeeHandler struct {
	service *services.EmployeeService
}

// NewEmployeeHandler creates a new EmployeeHandler.
func NewEmployeeHandler(service *services.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{service: service}
}

// CreateEmployee handles the creation of a new employee.
func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var req dto.EmployeeCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	employee, err := req.ToEmployeeEntity()
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if err := h.service.CreateEmployee(c.Request.Context(), employee); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	resp := dto.FromEmployeeEntity(employee)
	response.Success(c, http.StatusCreated, "Employee created successfully", resp)
}

// GetEmployeeByID handles the retrieval of an employee by ID.
func (h *EmployeeHandler) GetEmployeeByID(c *gin.Context) {
	id := c.Param("id")

	employee, err := h.service.GetEmployeeByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	if employee == nil {
		response.Error(c, http.StatusNotFound, "Employee not found", nil)
		return
	}

	resp := dto.FromEmployeeEntity(employee)
	response.Success(c, http.StatusOK, "Employee retrieved successfully", resp)
}

// GetAllEmployees handles the retrieval of all employees.
func (h *EmployeeHandler) GetAllEmployees(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	employees, err := h.service.GetAllEmployees(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	resps := make([]*dto.EmployeeResponse, len(employees))
	for i, employee := range employees {
		resps[i] = dto.FromEmployeeEntity(employee)
	}
	response.Success(c, http.StatusOK, "Employees retrieved successfully", resps)
}

// UpdateEmployee handles the update of an existing employee.
func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	id := c.Param("id")

	existingEmployee, err := h.service.GetEmployeeByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	if existingEmployee == nil {
		response.Error(c, http.StatusNotFound, "Employee not found", nil)
		return
	}

	var req dto.EmployeeUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	updatedEmployee, err := req.ToEmployeeEntity(existingEmployee)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if err := h.service.UpdateEmployee(c.Request.Context(), updatedEmployee); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	resp := dto.FromEmployeeEntity(updatedEmployee)
	response.Success(c, http.StatusOK, "Employee updated successfully", resp)
}

// DeleteEmployee handles the deletion of an employee by ID.
func (h *EmployeeHandler) DeleteEmployee(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeleteEmployee(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusNoContent, "Employee deleted successfully", nil)
}
