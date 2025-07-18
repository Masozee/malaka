package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/shared/response"
)

type ManifestHandler struct {
	service domain.ManifestService
}

func NewManifestHandler(service domain.ManifestService) *ManifestHandler {
	return &ManifestHandler{service: service}
}

// CreateManifest godoc
// @Summary Create a new manifest
// @Description Create a new manifest
// @Tags shipping
// @Accept json
// @Produce json
// @Param manifest body dtos.CreateManifestRequest true "Create Manifest Request"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/manifests [post]
func (h *ManifestHandler) CreateManifest(c *gin.Context) {
	var req dtos.CreateManifestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	ctx := c.Request.Context()
	err := h.service.CreateManifest(ctx, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to create manifest", err.Error())
		return
	}

	response.Created(c, "Manifest created successfully", nil)
}

// GetManifestByID godoc
// @Summary Get a manifest by ID
// @Description Get a manifest by ID
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Manifest ID"
// @Success 200 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/manifests/{id} [get]
func (h *ManifestHandler) GetManifestByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid manifest ID", err.Error())
		return
	}

	ctx := c.Request.Context()
	manifest, err := h.service.GetManifestByID(ctx, id)
	if err != nil {
		// TODO: check for not found error
		response.InternalServerError(c, "Failed to get manifest", err.Error())
		return
	}

	response.OK(c, "Manifest retrieved successfully", manifest)
}

// GetAllManifests godoc
// @Summary Get all manifests
// @Description Get all manifests
// @Tags shipping
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/manifests [get]
func (h *ManifestHandler) GetAllManifests(c *gin.Context) {
	ctx := c.Request.Context()
	manifests, err := h.service.GetAllManifests(ctx)
	if err != nil {
		response.InternalServerError(c, "Failed to get all manifests", err.Error())
		return
	}

	response.OK(c, "Manifests retrieved successfully", manifests)
}

// UpdateManifest godoc
// @Summary Update a manifest
// @Description Update a manifest
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Manifest ID"
// @Param manifest body dtos.UpdateManifestRequest true "Update Manifest Request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/manifests/{id} [put]
func (h *ManifestHandler) UpdateManifest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid manifest ID", err.Error())
		return
	}

	var req dtos.UpdateManifestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	req.ID = id
	ctx := c.Request.Context()
	err = h.service.UpdateManifest(ctx, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to update manifest", err.Error())
		return
	}

	response.OK(c, "Manifest updated successfully", nil)
}

// DeleteManifest godoc
// @Summary Delete a manifest
// @Description Delete a manifest
// @Tags shipping
// @Accept json
// @Produce json
// @Param id path string true "Manifest ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /shipping/manifests/{id} [delete]
func (h *ManifestHandler) DeleteManifest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid manifest ID", err.Error())
		return
	}

	ctx := c.Request.Context()
	err = h.service.DeleteManifest(ctx, id)
	if err != nil {
		// TODO: check for not found error
		response.InternalServerError(c, "Failed to delete manifest", err.Error())
		return
	}

	response.OK(c, "Manifest deleted successfully", nil)
}
