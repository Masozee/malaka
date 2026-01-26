package storage

import (
	"context"
	"mime/multipart"
	"time"
)

// StorageService defines the interface for storage operations.
// This allows switching between different storage backends (MinIO, Local filesystem, etc.)
type StorageService interface {
	// UploadWithMetadata uploads a file and returns the upload result with metadata.
	UploadWithMetadata(ctx context.Context, file *multipart.FileHeader) (*UploadResult, error)

	// UploadBytesWithMetadata uploads raw bytes and returns the upload result with metadata.
	UploadBytesWithMetadata(ctx context.Context, data []byte, filename, contentType string) (*UploadResult, error)

	// GetObjectMetadata retrieves metadata for an object.
	GetObjectMetadata(ctx context.Context, objectKey string) (*ObjectMetadata, error)

	// GenerateDownloadURL generates a URL for downloading the object.
	// For MinIO, this returns a presigned URL. For local storage, this returns a direct URL.
	GenerateDownloadURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error)

	// DeleteWithCache removes an object and clears its cache.
	DeleteWithCache(ctx context.Context, objectKey string) error

	// GetFilePath returns the full file path for an object (for local storage).
	// For MinIO, this may return an empty string.
	GetFilePath(objectKey string) string
}
