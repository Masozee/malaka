package upload

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

// LocalStorage implements file storage using local filesystem.
type LocalStorage struct {
	basePath string
	baseURL  string
	logger   *zap.Logger
}

// LocalStorageConfig holds configuration for local storage.
type LocalStorageConfig struct {
	BasePath string // e.g., "./media"
	BaseURL  string // e.g., "/api/v1/media" or "http://localhost:8080/media"
}

// LocalObjectInfo represents information about a stored file.
type LocalObjectInfo struct {
	Key          string
	Size         int64
	LastModified time.Time
	ContentType  string
	FilePath     string
}

// NewLocalStorage creates a new local storage instance.
func NewLocalStorage(config *LocalStorageConfig, logger *zap.Logger) (*LocalStorage, error) {
	storage := &LocalStorage{
		basePath: config.BasePath,
		baseURL:  config.BaseURL,
		logger:   logger,
	}

	// Initialize required directories
	if err := storage.initializeDirectories(); err != nil {
		return nil, fmt.Errorf("failed to initialize directories: %w", err)
	}

	return storage, nil
}

// initializeDirectories creates the required directories if they don't exist.
func (s *LocalStorage) initializeDirectories() error {
	directories := []string{
		filepath.Join(s.basePath, "images"),
		filepath.Join(s.basePath, "documents"),
		filepath.Join(s.basePath, "attachments"),
		filepath.Join(s.basePath, "temp"),
		filepath.Join(s.basePath, "barcodes"),
	}

	for _, dir := range directories {
		if err := os.MkdirAll(dir, 0755); err != nil {
			s.logger.Error("Failed to create directory",
				zap.String("directory", dir),
				zap.Error(err))
			return err
		}
		s.logger.Info("Directory ready", zap.String("directory", dir))
	}

	return nil
}

// Upload uploads a file to local storage.
func (s *LocalStorage) Upload(ctx context.Context, file *multipart.FileHeader) (string, error) {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Generate unique filename
	fileName := s.generateFileName(file.Filename)

	// Determine directory based on file type
	subDir := s.getSubDirectory(file.Filename)
	fullDir := filepath.Join(s.basePath, subDir)

	// Ensure directory exists
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Create destination file
	fullPath := filepath.Join(fullDir, fileName)
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Copy file content
	written, err := io.Copy(dst, src)
	if err != nil {
		os.Remove(fullPath) // Clean up on error
		return "", fmt.Errorf("failed to copy file: %w", err)
	}

	s.logger.Info("File uploaded successfully",
		zap.String("path", fullPath),
		zap.Int64("size", written))

	// Return the object key (relative path for storage reference)
	objectKey := fmt.Sprintf("%s/%s", subDir, fileName)
	return objectKey, nil
}

// UploadBytes uploads raw bytes to local storage.
func (s *LocalStorage) UploadBytes(ctx context.Context, data []byte, filename, contentType string) (string, error) {
	// Generate unique filename
	uniqueFilename := s.generateFileName(filename)

	// Determine directory based on file type
	subDir := s.getSubDirectory(filename)
	fullDir := filepath.Join(s.basePath, subDir)

	// Ensure directory exists
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Create destination file
	fullPath := filepath.Join(fullDir, uniqueFilename)
	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	s.logger.Info("Bytes uploaded successfully",
		zap.String("path", fullPath),
		zap.Int("size", len(data)))

	// Return the object key
	objectKey := fmt.Sprintf("%s/%s", subDir, uniqueFilename)
	return objectKey, nil
}

// Delete removes a file from local storage.
func (s *LocalStorage) Delete(ctx context.Context, objectKey string) error {
	fullPath := filepath.Join(s.basePath, objectKey)

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		s.logger.Warn("File not found for deletion",
			zap.String("path", fullPath))
		return nil // File doesn't exist, nothing to delete
	}

	if err := os.Remove(fullPath); err != nil {
		s.logger.Error("Failed to delete file",
			zap.String("path", fullPath),
			zap.Error(err))
		return fmt.Errorf("failed to delete file: %w", err)
	}

	s.logger.Info("File deleted successfully",
		zap.String("path", fullPath))

	return nil
}

// GetFilePath returns the full file path for an object key.
func (s *LocalStorage) GetFilePath(objectKey string) string {
	return filepath.Join(s.basePath, objectKey)
}

// GetFileInfo returns information about a stored file.
func (s *LocalStorage) GetFileInfo(ctx context.Context, objectKey string) (*LocalObjectInfo, error) {
	fullPath := filepath.Join(s.basePath, objectKey)

	fileInfo, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("file not found: %s", objectKey)
		}
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	// Determine content type from extension
	contentType := s.getContentType(objectKey)

	return &LocalObjectInfo{
		Key:          objectKey,
		Size:         fileInfo.Size(),
		LastModified: fileInfo.ModTime(),
		ContentType:  contentType,
		FilePath:     fullPath,
	}, nil
}

// GetFileReader returns a file reader for streaming.
func (s *LocalStorage) GetFileReader(ctx context.Context, objectKey string) (*os.File, error) {
	fullPath := filepath.Join(s.basePath, objectKey)

	file, err := os.Open(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("file not found: %s", objectKey)
		}
		return nil, fmt.Errorf("failed to open file: %w", err)
	}

	return file, nil
}

// ListFiles lists files in a directory with optional prefix.
func (s *LocalStorage) ListFiles(ctx context.Context, subDir, prefix string) ([]*LocalObjectInfo, error) {
	dirPath := filepath.Join(s.basePath, subDir)

	var files []*LocalObjectInfo

	err := filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		// Get relative path
		relPath, _ := filepath.Rel(s.basePath, path)

		// Check prefix filter
		if prefix != "" && !strings.HasPrefix(filepath.Base(path), prefix) {
			return nil
		}

		files = append(files, &LocalObjectInfo{
			Key:          relPath,
			Size:         info.Size(),
			LastModified: info.ModTime(),
			ContentType:  s.getContentType(path),
			FilePath:     path,
		})

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}

	return files, nil
}

// GetURL returns the URL for accessing a file.
func (s *LocalStorage) GetURL(objectKey string) string {
	return fmt.Sprintf("%s/%s", s.baseURL, objectKey)
}

// generateFileName creates a unique filename preserving the original extension.
func (s *LocalStorage) generateFileName(originalName string) string {
	ext := path.Ext(originalName)
	id := uuid.New().String()
	timestamp := time.Now().Format("20060102150405")
	return fmt.Sprintf("%s_%s%s", timestamp, id, ext)
}

// getSubDirectory determines the appropriate subdirectory based on file extension.
func (s *LocalStorage) getSubDirectory(filename string) string {
	ext := strings.ToLower(path.Ext(filename))

	imageExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
		".bmp": true, ".webp": true, ".svg": true,
	}

	documentExts := map[string]bool{
		".pdf": true, ".doc": true, ".docx": true, ".xls": true,
		".xlsx": true, ".ppt": true, ".pptx": true, ".txt": true,
	}

	switch {
	case imageExts[ext]:
		return "images"
	case documentExts[ext]:
		return "documents"
	default:
		return "attachments"
	}
}

// getContentType returns the content type based on file extension.
func (s *LocalStorage) getContentType(filename string) string {
	ext := strings.ToLower(path.Ext(filename))

	contentTypes := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".bmp":  "image/bmp",
		".webp": "image/webp",
		".svg":  "image/svg+xml",
		".pdf":  "application/pdf",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".txt":  "text/plain",
	}

	if ct, ok := contentTypes[ext]; ok {
		return ct
	}
	return "application/octet-stream"
}

// GetBasePath returns the base path for storage.
func (s *LocalStorage) GetBasePath() string {
	return s.basePath
}
