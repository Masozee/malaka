package upload

import (
	"errors"
	"mime/multipart"
)

// ValidateFile validates the uploaded file.
func ValidateFile(file *multipart.FileHeader) error {
	if file.Size == 0 {
		return errors.New("file is empty")
	}

	// Add more validation rules here (e.g., file type, size limits)

	return nil
}
