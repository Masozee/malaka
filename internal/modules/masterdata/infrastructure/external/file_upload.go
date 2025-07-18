package external

import (
	"context"
	"mime/multipart"
)

// FileUploadService defines the interface for file upload operations.
type FileUploadService interface {
	UploadFile(ctx context.Context, file *multipart.FileHeader) (string, error)
	DeleteFile(ctx context.Context, filename string) error
}

// MockFileUploadService is a mock implementation of FileUploadService.
type MockFileUploadService struct{}

// UploadFile mocks file upload.
func (m *MockFileUploadService) UploadFile(ctx context.Context, file *multipart.FileHeader) (string, error) {
	return "http://example.com/files/" + file.Filename, nil
}

// DeleteFile mocks file deletion.
func (m *MockFileUploadService) DeleteFile(ctx context.Context, filename string) error {
	return nil
}
