package storage

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// MediaHandler handles HTTP requests for local media file operations.
type MediaHandler struct {
	storageService *LocalStorageService
	logger         *zap.Logger
}

// NewMediaHandler creates a new MediaHandler.
func NewMediaHandler(storageService *LocalStorageService, logger *zap.Logger) *MediaHandler {
	return &MediaHandler{
		storageService: storageService,
		logger:         logger,
	}
}

// DownloadFile streams a file from local storage.
func (h *MediaHandler) DownloadFile(c *gin.Context) {
	// Get the object key from the URL path
	objectKey := c.Param("objectKey")
	if objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Object key is required",
		})
		return
	}

	// Remove leading slash if present
	objectKey = strings.TrimPrefix(objectKey, "/")

	// Validate path to prevent directory traversal
	if strings.Contains(objectKey, "..") {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid object key",
		})
		return
	}

	// Get file info
	fileInfo, err := h.storageService.storage.GetFileInfo(c.Request.Context(), objectKey)
	if err != nil {
		h.logger.Error("File not found",
			zap.String("object_key", objectKey),
			zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found",
		})
		return
	}

	// Open file for reading
	file, err := os.Open(fileInfo.FilePath)
	if err != nil {
		h.logger.Error("Failed to open file",
			zap.String("path", fileInfo.FilePath),
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to read file",
		})
		return
	}
	defer file.Close()

	// Get filename for Content-Disposition header
	filename := filepath.Base(objectKey)

	// Set headers
	c.Header("Content-Type", fileInfo.ContentType)
	c.Header("Content-Length", string(rune(fileInfo.Size)))
	c.Header("Content-Disposition", "inline; filename=\""+filename+"\"")
	c.Header("Cache-Control", "public, max-age=31536000") // Cache for 1 year

	// Stream file content
	c.Status(http.StatusOK)
	io.Copy(c.Writer, file)
}

// GetFileInfo returns metadata about a file.
func (h *MediaHandler) GetFileInfo(c *gin.Context) {
	// Get the object key from the URL path
	objectKey := c.Param("objectKey")
	if objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Object key is required",
		})
		return
	}

	// Remove leading slash if present
	objectKey = strings.TrimPrefix(objectKey, "/")

	// Validate path
	if strings.Contains(objectKey, "..") {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid object key",
		})
		return
	}

	// Get metadata
	metadata, err := h.storageService.GetObjectMetadata(c.Request.Context(), objectKey)
	if err != nil {
		h.logger.Error("Failed to get file info",
			zap.String("object_key", objectKey),
			zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File info retrieved successfully",
		"data": gin.H{
			"key":           metadata.Key,
			"size":          metadata.Size,
			"content_type":  metadata.ContentType,
			"last_modified": metadata.LastModified,
			"url":           h.storageService.storage.GetURL(objectKey),
		},
	})
}

// ServeStaticMedia serves static media files directly.
// This is used for simple static file serving without the download headers.
func (h *MediaHandler) ServeStaticMedia(c *gin.Context) {
	// Get the object key from the URL path
	objectKey := c.Param("objectKey")
	if objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Object key is required",
		})
		return
	}

	// Remove leading slash if present
	objectKey = strings.TrimPrefix(objectKey, "/")

	// Validate path to prevent directory traversal
	if strings.Contains(objectKey, "..") {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid object key",
		})
		return
	}

	// Get full file path
	filePath := h.storageService.GetFilePath(objectKey)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found",
		})
		return
	}

	// Serve the file
	c.File(filePath)
}

// DeleteFile removes a file from storage.
func (h *MediaHandler) DeleteFile(c *gin.Context) {
	// Get the object key from the URL path
	objectKey := c.Param("objectKey")
	if objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Object key is required",
		})
		return
	}

	// Remove leading slash if present
	objectKey = strings.TrimPrefix(objectKey, "/")

	// Validate path
	if strings.Contains(objectKey, "..") {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid object key",
		})
		return
	}

	// Delete file
	if err := h.storageService.DeleteWithCache(c.Request.Context(), objectKey); err != nil {
		h.logger.Error("Failed to delete file",
			zap.String("object_key", objectKey),
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete file",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File deleted successfully",
	})
}
