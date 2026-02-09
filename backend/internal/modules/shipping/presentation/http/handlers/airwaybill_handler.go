package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type AirwaybillHandler struct {
	service domain.AirwaybillService
}

func NewAirwaybillHandler(service domain.AirwaybillService) *AirwaybillHandler {
	return &AirwaybillHandler{service: service}
}

// CreateAirwaybill godoc
// @Summary Create a new airwaybill
// @Description Create a new airwaybill
// @Tags shipping
// @Accept json
// @Produce json
// @Param airwaybill body dtos.CreateAirwaybillRequest true "Create Airwaybill Request"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/airwaybills [post]
func (h *AirwaybillHandler) CreateAirwaybill(c *gin.Context) {
	var req dtos.CreateAirwaybillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	ctx := c.Request.Context()
	err := h.service.CreateAirwaybill(ctx, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to create airwaybill", err.Error())
		return
	}

	response.Created(c, "Airwaybill created successfully", nil)
}

// GetAirwaybillByID godoc
// @Summary Get a airwaybill by ID
// @Description Get a airwaybill by ID
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Airwaybill ID"
// @Success 200 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/airwaybills/{id} [get]
func (h *AirwaybillHandler) GetAirwaybillByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid airwaybill ID", err.Error())
		return
	}

	ctx := c.Request.Context()
	airwaybill, err := h.service.GetAirwaybillByID(ctx, id)
	if err != nil {
		// TODO: check for not found error
		response.InternalServerError(c, "Failed to get airwaybill", err.Error())
		return
	}

	response.OK(c, "Airwaybill retrieved successfully", airwaybill)
}

// GetAllAirwaybills godoc
// @Summary Get all airwaybills
// @Description Get all airwaybills
// @Tags shipping
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/airwaybills [get]
func (h *AirwaybillHandler) GetAllAirwaybills(c *gin.Context) {
	ctx := c.Request.Context()
	airwaybills, err := h.service.GetAllAirwaybills(ctx)
	if err != nil {
		response.InternalServerError(c, "Failed to get all airwaybills", err.Error())
		return
	}

	response.OK(c, "Airwaybills retrieved successfully", airwaybills)
}

// UpdateAirwaybill godoc
// @Summary Update a airwaybill
// @Description Update a airwaybill
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Airwaybill ID"
// @Param airwaybill body dtos.UpdateAirwaybillRequest true "Update Airwaybill Request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/airwaybills/{id} [put]
func (h *AirwaybillHandler) UpdateAirwaybill(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid airwaybill ID", err.Error())
		return
	}

	var req dtos.UpdateAirwaybillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	req.ID = id
	ctx := c.Request.Context()
	err = h.service.UpdateAirwaybill(ctx, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to update airwaybill", err.Error())
		return
	}

	response.OK(c, "Airwaybill updated successfully", nil)
}

// DeleteAirwaybill godoc
// @Summary Delete a airwaybill
// @Description Delete a airwaybill
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Airwaybill ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/airwaybills/{id} [delete]
func (h *AirwaybillHandler) DeleteAirwaybill(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid airwaybill ID", err.Error())
		return
	}

	ctx := c.Request.Context()
	err = h.service.DeleteAirwaybill(ctx, id)
	if err != nil {
		// TODO: check for not found error
		response.InternalServerError(c, "Failed to delete airwaybill", err.Error())
		return
	}

	response.OK(c, "Airwaybill deleted successfully", nil)
}
