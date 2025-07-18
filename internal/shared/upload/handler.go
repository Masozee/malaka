package upload

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/infrastructure/external"
	"malaka/internal/shared/response"
)

// UploadHandler handles file uploads.
type UploadHandler struct {
	fileUploadService external.FileUploadService
}

// NewUploadHandler creates a new UploadHandler.
func NewUploadHandler(fileUploadService external.FileUploadService) *UploadHandler {
	return &UploadHandler{fileUploadService: fileUploadService}
}

// UploadFile handles the file upload request.
func (h *UploadHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	url, err := h.fileUploadService.UploadFile(c.Request.Context(), file)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "File uploaded successfully", gin.H{"url": url})
}
