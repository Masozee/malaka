package handlers

import (
	"github.com/gin-gonic/gin"

	"gorm.io/gorm"

	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
	"malaka/internal/shared/validator"
)

type ShipmentHandler struct {
	service domain.ShipmentService
}

func NewShipmentHandler(service domain.ShipmentService) *ShipmentHandler {
	return &ShipmentHandler{service: service}
}

// CreateShipment godoc
// @Summary Create a new shipment
// @Description Create a new shipment
// @Tags shipping
// @Accept json
// @Produce json
// @Param shipment body dtos.CreateShipmentRequest true "Create Shipment Request"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/shipments [post]
func (h *ShipmentHandler) CreateShipment(c *gin.Context) {
	var req dtos.CreateShipmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", validator.GetValidationErrors(err))
		return
	}

	ctx := c.Request.Context()
	err := h.service.CreateShipment(ctx, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to create shipment", nil)
		return
	}

	response.Created(c, "Shipment created successfully", nil)
}

// GetShipmentByID godoc
// @Summary Get a shipment by ID
// @Description Get a shipment by ID
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Shipment ID"
// @Success 200 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/shipments/{id} [get]
func (h *ShipmentHandler) GetShipmentByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid shipment ID", nil)
		return
	}

	ctx := c.Request.Context()
	shipment, err := h.service.GetShipmentByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			response.NotFound(c, "Shipment not found", nil)
			return
		}
		response.InternalServerError(c, "Failed to get shipment", nil)
		return
	}

	response.OK(c, "Shipment retrieved successfully", shipment)
}

// GetAllShipments godoc
// @Summary Get all shipments
// @Description Get all shipments
// @Tags shipping
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/shipments [get]
func (h *ShipmentHandler) GetAllShipments(c *gin.Context) {
	ctx := c.Request.Context()
	shipments, err := h.service.GetAllShipments(ctx)
	if err != nil {
		response.InternalServerError(c, "Failed to get all shipments", nil)
		return
	}

	response.OK(c, "Shipments retrieved successfully", shipments)
}

// UpdateShipment godoc
// @Summary Update a shipment
// @Description Update a shipment
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Shipment ID"
// @Param shipment body dtos.UpdateShipmentRequest true "Update Shipment Request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/shipments/{id} [put]
func (h *ShipmentHandler) UpdateShipment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid shipment ID", nil)
		return
	}

	var req dtos.UpdateShipmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", validator.GetValidationErrors(err))
		return
	}

	req.ID = id
	ctx := c.Request.Context()
	err = h.service.UpdateShipment(ctx, &req)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			response.NotFound(c, "Shipment not found", nil)
			return
		}
		response.InternalServerError(c, "Failed to update shipment", nil)
		return
	}

	response.OK(c, "Shipment updated successfully", nil)
}

// DeleteShipment godoc
// @Summary Delete a shipment
// @Description Delete a shipment
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Shipment ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/shipments/{id} [delete]
func (h *ShipmentHandler) DeleteShipment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid shipment ID", nil)
		return
	}

	ctx := c.Request.Context()
	err = h.service.DeleteShipment(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			response.NotFound(c, "Shipment not found", nil)
			return
		}
		response.InternalServerError(c, "Failed to delete shipment", nil)
		return
	}

	response.OK(c, "Shipment deleted successfully", nil)
}
