package storage

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// StorageHandler handles HTTP requests for storage operations.
type StorageHandler struct {
	service *MinIOService
	logger  *zap.Logger
}

// NewStorageHandler creates a new StorageHandler.
func NewStorageHandler(service *MinIOService, logger *zap.Logger) *StorageHandler {
	return &StorageHandler{
		service: service,
		logger:  logger,
	}
}

// DownloadFile handles downloading files from MinIO storage.
func (h *StorageHandler) DownloadFile(c *gin.Context) {
	objectKey := c.Param("objectKey")
	if objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Object key is required",
		})
		return
	}
	// Remove the leading slash from wildcard parameter
	if objectKey[0] == '/' {
		objectKey = objectKey[1:]
	}

	// URL decode the object key
	decodedKey, err := url.QueryUnescape(objectKey)
	if err != nil {
		h.logger.Error("Failed to decode object key", zap.Error(err), zap.String("objectKey", objectKey))
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid object key format",
		})
		return
	}

	// Stream the file directly from MinIO instead of redirecting
	// This avoids issues with internal Docker hostnames
	objectInfo, err := h.service.storage.GetObject(c.Request.Context(), decodedKey)
	if err != nil {
		h.logger.Error("Failed to get object from storage", zap.Error(err), zap.String("objectKey", decodedKey))
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found",
		})
		return
	}
	defer objectInfo.Close()

	// Get object metadata for content type
	stat, err := objectInfo.Stat()
	if err != nil {
		h.logger.Error("Failed to get object stat", zap.Error(err), zap.String("objectKey", decodedKey))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get file information",
		})
		return
	}

	// Set appropriate headers
	c.Header("Content-Type", stat.ContentType)
	c.Header("Content-Length", fmt.Sprintf("%d", stat.Size))
	c.Header("Cache-Control", "public, max-age=31536000") // Cache for 1 year
	
	// Stream the file content
	c.DataFromReader(http.StatusOK, stat.Size, stat.ContentType, objectInfo, nil)
}

// GetFileInfo handles getting file metadata.
func (h *StorageHandler) GetFileInfo(c *gin.Context) {
	objectKey := c.Param("objectKey")
	if objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Object key is required",
		})
		return
	}
	// Remove the leading slash from wildcard parameter
	if objectKey[0] == '/' {
		objectKey = objectKey[1:]
	}

	// URL decode the object key
	decodedKey, err := url.QueryUnescape(objectKey)
	if err != nil {
		h.logger.Error("Failed to decode object key", zap.Error(err), zap.String("objectKey", objectKey))
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid object key format",
		})
		return
	}

	// Get metadata from cache/MinIO
	metadata, err := h.service.GetObjectMetadata(c.Request.Context(), decodedKey)
	if err != nil {
		h.logger.Error("Failed to get file metadata", zap.Error(err), zap.String("objectKey", decodedKey))
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found or metadata unavailable",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File metadata retrieved successfully",
		"data":    metadata,
	})
}