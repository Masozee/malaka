package external

import (
	"context"
)

// ImageStorageService defines the interface for image storage operations.
type ImageStorageService interface {
	UploadImage(ctx context.Context, imageData []byte, filename string) (string, error)
	DeleteImage(ctx context.Context, filename string) error
}

// MockImageStorageService is a mock implementation of ImageStorageService.
type MockImageStorageService struct{}

// UploadImage mocks image upload.
func (m *MockImageStorageService) UploadImage(ctx context.Context, imageData []byte, filename string) (string, error) {
	return "http://example.com/images/" + filename, nil
}

// DeleteImage mocks image deletion.
func (m *MockImageStorageService) DeleteImage(ctx context.Context, filename string) error {
	return nil
}
