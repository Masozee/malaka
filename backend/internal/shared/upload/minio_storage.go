package upload

import (
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"
)

// MinIOStorage implements the Storage interface using MinIO.
type MinIOStorage struct {
	client       *minio.Client
	bucketPrefix string
	region       string
	logger       *zap.Logger
}

// MinIOConfig holds configuration for MinIO storage.
type MinIOConfig struct {
	Endpoint     string
	AccessKey    string
	SecretKey    string
	UseSSL       bool
	Region       string
	BucketPrefix string
}

// NewMinIOStorage creates a new MinIO storage instance.
func NewMinIOStorage(config *MinIOConfig, logger *zap.Logger) (*MinIOStorage, error) {
	// Initialize MinIO client
	minioClient, err := minio.New(config.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(config.AccessKey, config.SecretKey, ""),
		Secure: config.UseSSL,
		Region: config.Region,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client: %w", err)
	}

	storage := &MinIOStorage{
		client:       minioClient,
		bucketPrefix: config.BucketPrefix,
		region:       config.Region,
		logger:       logger,
	}

	// Initialize required buckets
	if err := storage.initializeBuckets(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to initialize buckets: %w", err)
	}

	return storage, nil
}

// initializeBuckets creates the required buckets if they don't exist.
func (s *MinIOStorage) initializeBuckets(ctx context.Context) error {
	buckets := []string{
		fmt.Sprintf("%s-images", s.bucketPrefix),
		fmt.Sprintf("%s-documents", s.bucketPrefix),
		fmt.Sprintf("%s-attachments", s.bucketPrefix),
		fmt.Sprintf("%s-temp", s.bucketPrefix),
	}

	for _, bucketName := range buckets {
		exists, err := s.client.BucketExists(ctx, bucketName)
		if err != nil {
			s.logger.Error("Failed to check bucket existence", 
				zap.String("bucket", bucketName), 
				zap.Error(err))
			return err
		}

		if !exists {
			err = s.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{
				Region: s.region,
			})
			if err != nil {
				s.logger.Error("Failed to create bucket", 
					zap.String("bucket", bucketName), 
					zap.Error(err))
				return err
			}

			s.logger.Info("Created bucket", zap.String("bucket", bucketName))

			// Set bucket policy for images to be publicly readable
			if strings.Contains(bucketName, "images") {
				policy := fmt.Sprintf(`{
					"Version": "2012-10-17",
					"Statement": [
						{
							"Effect": "Allow",
							"Principal": {"AWS": ["*"]},
							"Action": ["s3:GetObject"],
							"Resource": ["arn:aws:s3:::%s/*"]
						}
					]
				}`, bucketName)

				err = s.client.SetBucketPolicy(ctx, bucketName, policy)
				if err != nil {
					s.logger.Warn("Failed to set bucket policy", 
						zap.String("bucket", bucketName), 
						zap.Error(err))
				}
			}
		}
	}

	return nil
}

// Upload uploads a file to MinIO with automatic encryption.
func (s *MinIOStorage) Upload(ctx context.Context, file *multipart.FileHeader) (string, error) {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Generate unique filename
	fileName := s.generateFileName(file.Filename)
	
	// Determine bucket based on file type
	bucketName := s.getBucketName(file.Filename)
	
	// Prepare upload options
	options := minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
		UserMetadata: map[string]string{
			"uploaded-at": time.Now().UTC().Format(time.RFC3339),
			"original-name": file.Filename,
		},
	}

	// Upload file to MinIO
	info, err := s.client.PutObject(ctx, bucketName, fileName, src, file.Size, options)
	if err != nil {
		s.logger.Error("Failed to upload file to MinIO", 
			zap.String("bucket", bucketName),
			zap.String("filename", fileName),
			zap.Error(err))
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	s.logger.Info("File uploaded successfully", 
		zap.String("bucket", bucketName),
		zap.String("filename", fileName),
		zap.Int64("size", info.Size))

	// Return the object URL
	return fmt.Sprintf("%s/%s", bucketName, fileName), nil
}

// UploadBytes uploads raw bytes to MinIO with specified filename and content type
func (s *MinIOStorage) UploadBytes(ctx context.Context, data []byte, filename, contentType string) (string, error) {
	// Create reader from bytes
	reader := bytes.NewReader(data)
	
	// Generate unique filename
	uniqueFilename := s.generateFileName(filename)
	
	// Determine bucket based on file type
	bucketName := s.getBucketName(filename)
	
	// Prepare upload options
	options := minio.PutObjectOptions{
		ContentType: contentType,
		UserMetadata: map[string]string{
			"uploaded-at": time.Now().UTC().Format(time.RFC3339),
			"original-name": filename,
		},
	}

	// Upload bytes to MinIO
	info, err := s.client.PutObject(ctx, bucketName, uniqueFilename, reader, int64(len(data)), options)
	if err != nil {
		s.logger.Error("Failed to upload bytes to MinIO", 
			zap.String("bucket", bucketName),
			zap.String("filename", uniqueFilename),
			zap.Error(err))
		return "", fmt.Errorf("failed to upload bytes: %w", err)
	}

	s.logger.Info("Bytes uploaded successfully", 
		zap.String("bucket", bucketName),
		zap.String("filename", uniqueFilename),
		zap.Int64("size", info.Size))

	// Return the object URL
	return fmt.Sprintf("%s/%s", bucketName, uniqueFilename), nil
}

// Delete removes a file from MinIO.
func (s *MinIOStorage) Delete(ctx context.Context, filename string) error {
	// Parse bucket and object from filename
	parts := strings.SplitN(filename, "/", 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid filename format: %s", filename)
	}

	bucketName, objectName := parts[0], parts[1]

	// Delete object from MinIO
	err := s.client.RemoveObject(ctx, bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		s.logger.Error("Failed to delete file from MinIO", 
			zap.String("bucket", bucketName),
			zap.String("object", objectName),
			zap.Error(err))
		return fmt.Errorf("failed to delete file: %w", err)
	}

	s.logger.Info("File deleted successfully", 
		zap.String("bucket", bucketName),
		zap.String("object", objectName))

	return nil
}

// GetSignedURL generates a presigned URL for downloading files.
func (s *MinIOStorage) GetSignedURL(ctx context.Context, filename string, expiry time.Duration) (string, error) {
	// Parse bucket and object from filename
	parts := strings.SplitN(filename, "/", 2)
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid filename format: %s", filename)
	}

	bucketName, objectName := parts[0], parts[1]

	// Generate presigned URL
	url, err := s.client.PresignedGetObject(ctx, bucketName, objectName, expiry, nil)
	if err != nil {
		s.logger.Error("Failed to generate presigned URL", 
			zap.String("bucket", bucketName),
			zap.String("object", objectName),
			zap.Error(err))
		return "", fmt.Errorf("failed to generate signed URL: %w", err)
	}

	return url.String(), nil
}

// ListObjects lists objects in a bucket with optional prefix.
func (s *MinIOStorage) ListObjects(ctx context.Context, bucketName, prefix string) ([]minio.ObjectInfo, error) {
	var objects []minio.ObjectInfo

	// Create a done channel to control 'ListObjects' go routine.
	doneCh := make(chan struct{})
	defer close(doneCh)

	// List objects with prefix
	objectCh := s.client.ListObjects(ctx, bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})

	for object := range objectCh {
		if object.Err != nil {
			s.logger.Error("Error listing objects", 
				zap.String("bucket", bucketName),
				zap.Error(object.Err))
			return nil, object.Err
		}
		objects = append(objects, object)
	}

	return objects, nil
}

// generateFileName creates a unique filename preserving the original extension.
func (s *MinIOStorage) generateFileName(originalName string) string {
	ext := path.Ext(originalName)
	uuid := uuid.New().String()
	timestamp := time.Now().Format("20060102150405")
	return fmt.Sprintf("%s_%s%s", timestamp, uuid, ext)
}

// getBucketName determines the appropriate bucket based on file extension.
func (s *MinIOStorage) getBucketName(filename string) string {
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
		return fmt.Sprintf("%s-images", s.bucketPrefix)
	case documentExts[ext]:
		return fmt.Sprintf("%s-documents", s.bucketPrefix)
	default:
		return fmt.Sprintf("%s-attachments", s.bucketPrefix)
	}
}

// GetObject returns an object reader for streaming file content.
func (s *MinIOStorage) GetObject(ctx context.Context, filename string) (*minio.Object, error) {
	// Parse bucket and object from filename
	parts := strings.SplitN(filename, "/", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid filename format: %s", filename)
	}

	bucketName, objectName := parts[0], parts[1]

	// Get object
	object, err := s.client.GetObject(ctx, bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		s.logger.Error("Failed to get object", 
			zap.String("bucket", bucketName),
			zap.String("object", objectName),
			zap.Error(err))
		return nil, fmt.Errorf("failed to get object: %w", err)
	}

	return object, nil
}

// GetObjectInfo returns object information.
func (s *MinIOStorage) GetObjectInfo(ctx context.Context, filename string) (*minio.ObjectInfo, error) {
	// Parse bucket and object from filename
	parts := strings.SplitN(filename, "/", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid filename format: %s", filename)
	}

	bucketName, objectName := parts[0], parts[1]

	// Get object info
	info, err := s.client.StatObject(ctx, bucketName, objectName, minio.StatObjectOptions{})
	if err != nil {
		s.logger.Error("Failed to get object info", 
			zap.String("bucket", bucketName),
			zap.String("object", objectName),
			zap.Error(err))
		return nil, fmt.Errorf("failed to get object info: %w", err)
	}

	return &info, nil
}