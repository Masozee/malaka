package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)


type CourierRateHandler struct {
	service services.CourierRateService
}

func NewCourierRateHandler(service services.CourierRateService) *CourierRateHandler {
	return &CourierRateHandler{service: service}
}

func (h *CourierRateHandler) CreateCourierRate(c *gin.Context) {
	var req dto.CreateCourierRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	courierRate := req.ToEntity()

	if err := h.service.CreateCourierRate(c.Request.Context(), courierRate); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Created(c, "courier rate created successfully", courierRate)
}

func (h *CourierRateHandler) GetCourierRateByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	courierRate, err := h.service.GetCourierRateByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.OK(c, "courier rate retrieved successfully", courierRate)
}

func (h *CourierRateHandler) UpdateCourierRate(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	var req dto.UpdateCourierRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	courierRate, err := h.service.GetCourierRateByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	req.ApplyToEntity(courierRate)

	if err := h.service.UpdateCourierRate(c.Request.Context(), courierRate); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.OK(c, "courier rate updated successfully", courierRate)
}

func (h *CourierRateHandler) DeleteCourierRate(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if err := h.service.DeleteCourierRate(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.OK(c, "courier rate deleted successfully", nil)
}
