package external

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image/png"
	"strings"
	"sync"
	"time"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
	"github.com/boombuler/barcode/code39"
	"github.com/boombuler/barcode/ean"
	"github.com/skip2/go-qrcode"
	"go.uber.org/zap"

	"malaka/internal/shared/storage"
)

// BarcodeFormat represents supported barcode formats
type BarcodeFormat string

const (
	CODE128 BarcodeFormat = "CODE128"
	CODE39  BarcodeFormat = "CODE39"
	EAN13   BarcodeFormat = "EAN13"
	EAN8    BarcodeFormat = "EAN8"
	QRCODE  BarcodeFormat = "QRCODE"
)

// BarcodeRequest represents a single barcode generation request
type BarcodeRequest struct {
	ID     string        `json:"id"`
	Data   string        `json:"data"`
	Format BarcodeFormat `json:"format"`
	Width  int           `json:"width,omitempty"`
	Height int           `json:"height,omitempty"`
}

// BarcodeResult represents the result of barcode generation
type BarcodeResult struct {
	ID       string `json:"id"`
	Data     string `json:"data"`
	Format   string `json:"format"`
	ImageB64 string `json:"image_base64,omitempty"`
	ImageURL string `json:"image_url,omitempty"`
	Error    string `json:"error,omitempty"`
}

// BatchBarcodeResult represents batch generation results
type BatchBarcodeResult struct {
	Results              []BarcodeResult `json:"results"`
	SuccessCount         int             `json:"success_count"`
	ErrorCount           int             `json:"error_count"`
	TotalCount           int             `json:"total_count"`
	UpdatedArticlesCount int             `json:"updated_articles_count,omitempty"`
}

// BarcodeGeneratorService defines the interface for barcode generation operations.
type BarcodeGeneratorService interface {
	GenerateBarcode(ctx context.Context, request BarcodeRequest) (*BarcodeResult, error)
	GenerateBatch(ctx context.Context, requests []BarcodeRequest) (*BatchBarcodeResult, error)
}

// RealBarcodeGeneratorService implements actual barcode generation
type RealBarcodeGeneratorService struct{
	minioService *storage.MinIOService
	logger       *zap.Logger
}

// NewBarcodeGeneratorService creates a new barcode generator service
func NewBarcodeGeneratorService(minioService *storage.MinIOService, logger *zap.Logger) BarcodeGeneratorService {
	return &RealBarcodeGeneratorService{
		minioService: minioService,
		logger:       logger,
	}
}

// GenerateBarcode generates a single barcode
func (r *RealBarcodeGeneratorService) GenerateBarcode(ctx context.Context, request BarcodeRequest) (*BarcodeResult, error) {
	result := &BarcodeResult{
		ID:     request.ID,
		Data:   request.Data,
		Format: string(request.Format),
	}

	// Set default dimensions if not specified
	width := request.Width
	if width <= 0 {
		width = 200
	}
	height := request.Height
	if height <= 0 {
		height = 100
	}

	var pngBytes []byte
	var err error

	switch request.Format {
	case QRCODE:
		pngBytes, err = r.generateQRCodeBytes(request.Data, width)
		if err != nil {
			result.Error = err.Error()
			return result, err
		}
	default:
		pngBytes, err = r.generateStandardBarcodeBytes(request.Data, request.Format, width, height)
		if err != nil {
			result.Error = err.Error()
			return result, err
		}
	}

	// Upload to MinIO if service is available
	if r.minioService != nil {
		imageURL, err := r.uploadBarcodeToMinIO(ctx, pngBytes, request.ID, string(request.Format))
		if err != nil {
			r.logger.Warn("Failed to upload barcode to MinIO, falling back to base64", zap.Error(err))
			result.ImageB64 = base64.StdEncoding.EncodeToString(pngBytes)
		} else {
			result.ImageURL = imageURL
		}
	} else {
		// Fallback to base64 if MinIO is not available
		result.ImageB64 = base64.StdEncoding.EncodeToString(pngBytes)
	}

	return result, nil
}

// GenerateBatch generates multiple barcodes concurrently
func (r *RealBarcodeGeneratorService) GenerateBatch(ctx context.Context, requests []BarcodeRequest) (*BatchBarcodeResult, error) {
	results := make([]BarcodeResult, len(requests))
	var wg sync.WaitGroup
	var mu sync.Mutex
	successCount := 0
	errorCount := 0

	// Create a batch identifier for organizing files
	batchID := fmt.Sprintf("batch-%d", time.Now().Unix())

	// Limit concurrent goroutines to prevent resource exhaustion
	maxConcurrency := 10
	semaphore := make(chan struct{}, maxConcurrency)

	for i, req := range requests {
		wg.Add(1)
		go func(index int, request BarcodeRequest) {
			defer wg.Done()
			semaphore <- struct{}{} // Acquire semaphore
			defer func() { <-semaphore }() // Release semaphore

			// Generate barcode with batch processing
			result, err := r.generateBarcodeForBatch(ctx, request, batchID)
			
			mu.Lock()
			results[index] = *result
			if err != nil {
				errorCount++
			} else {
				successCount++
			}
			mu.Unlock()
		}(i, req)
	}

	wg.Wait()

	return &BatchBarcodeResult{
		Results:      results,
		SuccessCount: successCount,
		ErrorCount:   errorCount,
		TotalCount:   len(requests),
	}, nil
}

// generateBarcodeForBatch generates a barcode specifically for batch processing
func (r *RealBarcodeGeneratorService) generateBarcodeForBatch(ctx context.Context, request BarcodeRequest, batchID string) (*BarcodeResult, error) {
	result := &BarcodeResult{
		ID:     request.ID,
		Data:   request.Data,
		Format: string(request.Format),
	}

	// Set default dimensions if not specified
	width := request.Width
	if width <= 0 {
		width = 200
	}
	height := request.Height
	if height <= 0 {
		height = 100
	}

	var pngBytes []byte
	var err error

	switch request.Format {
	case QRCODE:
		pngBytes, err = r.generateQRCodeBytes(request.Data, width)
		if err != nil {
			result.Error = err.Error()
			return result, err
		}
	default:
		pngBytes, err = r.generateStandardBarcodeBytes(request.Data, request.Format, width, height)
		if err != nil {
			result.Error = err.Error()
			return result, err
		}
	}

	// Upload to MinIO if service is available (using batch folder structure)
	if r.minioService != nil {
		imageURL, err := r.uploadBarcodeWithType(ctx, pngBytes, request.ID, string(request.Format), BarcodeTypeBatch, batchID)
		if err != nil {
			r.logger.Warn("Failed to upload barcode to MinIO, falling back to base64", zap.Error(err))
			result.ImageB64 = base64.StdEncoding.EncodeToString(pngBytes)
		} else {
			result.ImageURL = imageURL
		}
	} else {
		// Fallback to base64 if MinIO is not available
		result.ImageB64 = base64.StdEncoding.EncodeToString(pngBytes)
	}

	return result, nil
}

// generateQRCodeBytes generates a QR code and returns PNG bytes
func (r *RealBarcodeGeneratorService) generateQRCodeBytes(data string, size int) ([]byte, error) {
	pngBytes, err := qrcode.Encode(data, qrcode.Medium, size)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code: %w", err)
	}

	return pngBytes, nil
}

// generateQRCode generates a QR code and returns base64 encoded PNG (legacy method)
func (r *RealBarcodeGeneratorService) generateQRCode(data string, size int) (string, error) {
	pngBytes, err := r.generateQRCodeBytes(data, size)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(pngBytes), nil
}

// generateStandardBarcodeBytes generates standard barcodes and returns PNG bytes
func (r *RealBarcodeGeneratorService) generateStandardBarcodeBytes(data string, format BarcodeFormat, width, height int) ([]byte, error) {
	var code barcode.Barcode
	var err error

	switch format {
	case CODE128:
		code, err = code128.Encode(data)
	case CODE39:
		code, err = code39.Encode(data, true, true)
	case EAN13:
		code, err = ean.Encode(data)
	case EAN8:
		code, err = ean.Encode(data)
	default:
		return nil, fmt.Errorf("unsupported barcode format: %s", format)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to encode barcode: %w", err)
	}

	// Scale the barcode to the desired size
	code, err = barcode.Scale(code, width, height)
	if err != nil {
		return nil, fmt.Errorf("failed to scale barcode: %w", err)
	}

	// Convert to PNG bytes
	buf := new(bytes.Buffer)
	err = png.Encode(buf, code)
	if err != nil {
		return nil, fmt.Errorf("failed to encode PNG: %w", err)
	}

	return buf.Bytes(), nil
}

// generateStandardBarcode generates standard barcodes (legacy method)
func (r *RealBarcodeGeneratorService) generateStandardBarcode(data string, format BarcodeFormat, width, height int) (string, error) {
	pngBytes, err := r.generateStandardBarcodeBytes(data, format, width, height)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(pngBytes), nil
}

// uploadBarcodeToMinIO uploads a barcode image to MinIO and returns the URL
func (r *RealBarcodeGeneratorService) uploadBarcodeToMinIO(ctx context.Context, pngBytes []byte, id, format string) (string, error) {
	// Determine barcode type based on ID format or patterns
	barcodeType := r.determineBarcodeType(id)
	
	// Use the structured upload method
	return r.uploadBarcodeWithType(ctx, pngBytes, id, format, barcodeType)
}

// determineBarcodeType determines the appropriate barcode type based on the ID
func (r *RealBarcodeGeneratorService) determineBarcodeType(id string) BarcodeType {
	// Check if it's a UUID (likely an article ID)
	if len(id) == 36 && strings.Count(id, "-") == 4 {
		return BarcodeTypeArticle
	}
	
	// Check for common article patterns
	if strings.HasPrefix(id, "ART") || strings.HasPrefix(id, "ITEM") || 
	   strings.Contains(id, "article") || strings.Contains(id, "product") {
		return BarcodeTypeArticle
	}
	
	// Check for test or custom patterns
	if strings.HasPrefix(id, "test") || strings.HasPrefix(id, "TEST") ||
	   strings.HasPrefix(id, "custom") || strings.HasPrefix(id, "CUSTOM") {
		return BarcodeTypeCustom
	}
	
	// Default to custom for unknown patterns
	return BarcodeTypeCustom
}

// BarcodeType represents the type of barcode being generated
type BarcodeType string

const (
	BarcodeTypeArticle BarcodeType = "articles"
	BarcodeTypeCustom  BarcodeType = "custom"
	BarcodeTypeBatch   BarcodeType = "batch"
)

// createBarcodeFolder creates a structured folder path for barcode storage
func (r *RealBarcodeGeneratorService) createBarcodeFolder(barcodeType BarcodeType, additionalPath ...string) string {
	now := time.Now()
	basePath := fmt.Sprintf("barcodes/%s/%04d/%02d/%02d", 
		string(barcodeType), now.Year(), now.Month(), now.Day())
	
	// Add additional path components if provided
	if len(additionalPath) > 0 {
		for _, part := range additionalPath {
			basePath = fmt.Sprintf("%s/%s", basePath, part)
		}
	}
	
	return basePath
}

// uploadBarcodeWithType uploads a barcode with the specified type and folder structure
func (r *RealBarcodeGeneratorService) uploadBarcodeWithType(ctx context.Context, pngBytes []byte, id, format string, barcodeType BarcodeType, batchID ...string) (string, error) {
	// Create structured folder path based on type
	var folderPath string
	
	switch barcodeType {
	case BarcodeTypeArticle:
		folderPath = r.createBarcodeFolder(BarcodeTypeArticle)
	case BarcodeTypeCustom:
		folderPath = r.createBarcodeFolder(BarcodeTypeCustom)
	case BarcodeTypeBatch:
		batchIdentifier := fmt.Sprintf("batch-%d", time.Now().Unix())
		if len(batchID) > 0 && batchID[0] != "" {
			batchIdentifier = batchID[0]
		}
		folderPath = r.createBarcodeFolder(BarcodeTypeBatch, batchIdentifier)
	default:
		folderPath = r.createBarcodeFolder(BarcodeTypeCustom)
	}
	
	// Create filename with format and timestamp
	filename := fmt.Sprintf("%s/%s_%s_%d.png", 
		folderPath, id, strings.ToLower(format), time.Now().Unix())
	
	// Upload bytes to MinIO using the new method
	uploadResult, err := r.minioService.UploadBytesWithMetadata(ctx, pngBytes, filename, "image/png")
	if err != nil {
		return "", fmt.Errorf("failed to upload barcode to MinIO: %w", err)
	}
	
	// Generate download URL (valid for 7 days)
	downloadURL, err := r.minioService.GenerateDownloadURL(ctx, uploadResult.ObjectKey, 7*24*time.Hour)
	if err != nil {
		r.logger.Warn("Failed to generate download URL, returning object key", zap.Error(err))
		return uploadResult.URL, nil
	}
	
	return downloadURL, nil
}

// MockBarcodeGeneratorService is a mock implementation of BarcodeGeneratorService.
type MockBarcodeGeneratorService struct{}

// GenerateBarcode mocks barcode generation.
func (m *MockBarcodeGeneratorService) GenerateBarcode(ctx context.Context, request BarcodeRequest) (*BarcodeResult, error) {
	return &BarcodeResult{
		ID:       request.ID,
		Data:     request.Data,
		Format:   string(request.Format),
		ImageB64: "dummy_barcode_image_data_for_" + request.Data,
	}, nil
}

// GenerateBatch mocks batch barcode generation.
func (m *MockBarcodeGeneratorService) GenerateBatch(ctx context.Context, requests []BarcodeRequest) (*BatchBarcodeResult, error) {
	results := make([]BarcodeResult, len(requests))
	for i, req := range requests {
		results[i] = BarcodeResult{
			ID:       req.ID,
			Data:     req.Data,
			Format:   string(req.Format),
			ImageB64: "dummy_barcode_image_data_for_" + req.Data,
		}
	}

	return &BatchBarcodeResult{
		Results:      results,
		SuccessCount: len(requests),
		ErrorCount:   0,
		TotalCount:   len(requests),
	}, nil
}
