package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/services"
	"malaka/internal/modules/shipping/presentation/http/dto"
	"malaka/internal/shared/response"
)

// CourierHandler handles HTTP requests for courier operations.
type CourierHandler struct {
	service *services.CourierService
}

// NewCourierHandler creates a new CourierHandler.
func NewCourierHandler(service *services.CourierService) *CourierHandler {
	return &CourierHandler{service: service}
}

// CreateCourier handles creating a new courier.
func (h *CourierHandler) CreateCourier(c *gin.Context) {
	var req dto.CreateCourierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	courier := &entities.Courier{
		Name:    req.Name,
		Contact: req.Contact,
	}
	courier.CreatedAt = time.Now()
	courier.UpdatedAt = time.Now()

	if err := h.service.CreateCourier(c.Request.Context(), courier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.CourierResponse{
		ID:        courier.ID,
		CreatedAt: courier.CreatedAt,
		UpdatedAt: courier.UpdatedAt,
		Name:      courier.Name,
		Contact:   courier.Contact,
	}

	response.Created(c, "Courier created successfully", resp)
}

// GetCourierByID handles retrieving a courier by ID.
func (h *CourierHandler) GetCourierByID(c *gin.Context) {
	id := c.Param("id")
	courier, err := h.service.GetCourierByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	if courier == nil {
		response.NotFound(c, "Courier not found", nil)
		return
	}

	resp := dto.CourierResponse{
		ID:        courier.ID,
		CreatedAt: courier.CreatedAt,
		UpdatedAt: courier.UpdatedAt,
		Name:      courier.Name,
		Contact:   courier.Contact,
	}

	response.OK(c, "Courier retrieved successfully", resp)
}

// GetAllCouriers handles retrieving all couriers.
func (h *CourierHandler) GetAllCouriers(c *gin.Context) {
	couriers, err := h.service.GetAllCouriers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	var responses []dto.CourierResponse
	for _, courier := range couriers {
		responses = append(responses, dto.CourierResponse{
			ID:        courier.ID,
			CreatedAt: courier.CreatedAt,
			UpdatedAt: courier.UpdatedAt,
			Name:      courier.Name,
			Contact:   courier.Contact,
		})
	}

	response.OK(c, "Couriers retrieved successfully", responses)
}

// UpdateCourier handles updating an existing courier.
func (h *CourierHandler) UpdateCourier(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCourierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	courier := &entities.Courier{
		Name:    req.Name,
		Contact: req.Contact,
	}
	courier.ID = id
	courier.UpdatedAt = time.Now()

	if err := h.service.UpdateCourier(c.Request.Context(), courier); err != nil {
		if err.Error() == "courier not found" {
			response.NotFound(c, "Courier not found", nil)
			return
		}
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Get the updated courier to return full data
	updatedCourier, err := h.service.GetCourierByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.CourierResponse{
		ID:        updatedCourier.ID,
		CreatedAt: updatedCourier.CreatedAt,
		UpdatedAt: updatedCourier.UpdatedAt,
		Name:      updatedCourier.Name,
		Contact:   updatedCourier.Contact,
	}

	response.OK(c, "Courier updated successfully", resp)
}

// DeleteCourier handles deleting a courier.
func (h *CourierHandler) DeleteCourier(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteCourier(c.Request.Context(), id); err != nil {
		if err.Error() == "courier not found" {
			response.NotFound(c, "Courier not found", nil)
			return
		}
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}