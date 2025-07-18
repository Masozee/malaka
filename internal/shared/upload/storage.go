package upload

import (
	"context"
	"mime/multipart"
)

// Storage defines the interface for file storage.
type Storage interface {
	Upload(ctx context.Context, file *multipart.FileHeader) (string, error)
	Delete(ctx context.Context, filename string) error
}
