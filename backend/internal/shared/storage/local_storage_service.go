package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"

	"malaka/internal/shared/upload"
)

// LocalStorageService provides high-level local storage operations with Redis caching.
type LocalStorageService struct {
	storage     *upload.LocalStorage
	redisClient *redis.Client
	logger      *zap.Logger
	cachePrefix string
	cacheTTL    time.Duration
}

// NewLocalStorageService creates a new local storage service with Redis caching.
func NewLocalStorageService(storage *upload.LocalStorage, redisClient *redis.Client, logger *zap.Logger) *LocalStorageService {
	return &LocalStorageService{
		storage:     storage,
		redisClient: redisClient,
		logger:      logger,
		cachePrefix: "local:metadata:",
		cacheTTL:    24 * time.Hour,
	}
}

// UploadWithMetadata uploads a file and caches its metadata in Redis.
func (s *LocalStorageService) UploadWithMetadata(ctx context.Context, file *multipart.FileHeader) (*UploadResult, error) {
	// Upload file to local storage
	objectKey, err := s.storage.Upload(ctx, file)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Get file info for metadata
	fileInfo, err := s.storage.GetFileInfo(ctx, objectKey)
	if err != nil {
		s.logger.Warn("Failed to get file info after upload",
			zap.String("object_key", objectKey),
			zap.Error(err))
	} else {
		// Cache metadata in Redis
		metadata := &ObjectMetadata{
			Key:          objectKey,
			Size:         fileInfo.Size,
			LastModified: fileInfo.LastModified,
			ContentType:  fileInfo.ContentType,
			CachedAt:     time.Now(),
			UserMetadata: map[string]string{
				"original_name": file.Filename,
			},
		}

		if err := s.cacheMetadata(ctx, objectKey, metadata); err != nil {
			s.logger.Warn("Failed to cache object metadata",
				zap.String("object_key", objectKey),
				zap.Error(err))
		}
	}

	// Generate result
	result := &UploadResult{
		ObjectKey: objectKey,
		Size:      file.Size,
		URL:       fmt.Sprintf("/api/v1/media/%s", objectKey),
		Metadata: map[string]string{
			"original_name": file.Filename,
			"content_type":  file.Header.Get("Content-Type"),
		},
	}

	s.logger.Info("File uploaded and cached successfully",
		zap.String("object_key", objectKey),
		zap.Int64("size", result.Size))

	return result, nil
}

// UploadBytesWithMetadata uploads raw bytes and caches metadata in Redis.
func (s *LocalStorageService) UploadBytesWithMetadata(ctx context.Context, data []byte, filename, contentType string) (*UploadResult, error) {
	// Upload bytes to local storage
	objectKey, err := s.storage.UploadBytes(ctx, data, filename, contentType)
	if err != nil {
		return nil, fmt.Errorf("failed to upload bytes: %w", err)
	}

	// Get file info for metadata
	fileInfo, err := s.storage.GetFileInfo(ctx, objectKey)
	if err != nil {
		s.logger.Warn("Failed to get file info after upload",
			zap.String("object_key", objectKey),
			zap.Error(err))
	} else {
		// Cache metadata in Redis
		metadata := &ObjectMetadata{
			Key:          objectKey,
			Size:         fileInfo.Size,
			LastModified: fileInfo.LastModified,
			ContentType:  fileInfo.ContentType,
			CachedAt:     time.Now(),
			UserMetadata: map[string]string{
				"original_name": filename,
			},
		}

		if err := s.cacheMetadata(ctx, objectKey, metadata); err != nil {
			s.logger.Warn("Failed to cache object metadata",
				zap.String("object_key", objectKey),
				zap.Error(err))
		}
	}

	// Generate result
	result := &UploadResult{
		ObjectKey: objectKey,
		Size:      int64(len(data)),
		URL:       fmt.Sprintf("/api/v1/media/%s", objectKey),
		Metadata: map[string]string{
			"original_name": filename,
			"content_type":  contentType,
		},
	}

	s.logger.Info("Bytes uploaded and cached successfully",
		zap.String("object_key", objectKey),
		zap.Int64("size", result.Size))

	return result, nil
}

// GetObjectMetadata retrieves object metadata from cache or filesystem.
func (s *LocalStorageService) GetObjectMetadata(ctx context.Context, objectKey string) (*ObjectMetadata, error) {
	// Try to get from cache first
	if metadata, err := s.getMetadataFromCache(ctx, objectKey); err == nil {
		s.logger.Debug("Retrieved metadata from cache", zap.String("object_key", objectKey))
		return metadata, nil
	}

	// If not in cache, get from filesystem
	fileInfo, err := s.storage.GetFileInfo(ctx, objectKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	metadata := &ObjectMetadata{
		Key:          objectKey,
		Size:         fileInfo.Size,
		LastModified: fileInfo.LastModified,
		ContentType:  fileInfo.ContentType,
		CachedAt:     time.Now(),
	}

	// Cache for future requests
	if err := s.cacheMetadata(ctx, objectKey, metadata); err != nil {
		s.logger.Warn("Failed to cache metadata",
			zap.String("object_key", objectKey),
			zap.Error(err))
	}

	s.logger.Debug("Retrieved metadata from filesystem and cached", zap.String("object_key", objectKey))
	return metadata, nil
}

// GetDownloadURL returns the URL for downloading a file.
func (s *LocalStorageService) GetDownloadURL(ctx context.Context, objectKey string) (string, error) {
	// Check if file exists
	_, err := s.storage.GetFileInfo(ctx, objectKey)
	if err != nil {
		return "", fmt.Errorf("file not found: %w", err)
	}

	return s.storage.GetURL(objectKey), nil
}

// GenerateDownloadURL generates a URL for downloading the object.
// For local storage, this returns a direct URL (expiry is ignored since files are served directly).
func (s *LocalStorageService) GenerateDownloadURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
	// For local storage, we don't use presigned URLs, just return the direct URL
	return s.GetDownloadURL(ctx, objectKey)
}

// DeleteWithCache removes a file from storage and clears its cache.
func (s *LocalStorageService) DeleteWithCache(ctx context.Context, objectKey string) error {
	// Delete from filesystem
	if err := s.storage.Delete(ctx, objectKey); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	// Remove from cache
	cacheKey := s.cachePrefix + objectKey
	if err := s.redisClient.Del(ctx, cacheKey).Err(); err != nil {
		s.logger.Warn("Failed to remove from cache",
			zap.String("object_key", objectKey),
			zap.Error(err))
	}

	s.logger.Info("File deleted and cache cleared", zap.String("object_key", objectKey))
	return nil
}

// GetFilePath returns the full filesystem path for an object.
func (s *LocalStorageService) GetFilePath(objectKey string) string {
	return s.storage.GetFilePath(objectKey)
}

// GetFileReader returns a file reader for streaming.
func (s *LocalStorageService) GetFileReader(ctx context.Context, objectKey string) (*struct {
	Reader      interface{}
	ContentType string
	Size        int64
}, error) {
	fileInfo, err := s.storage.GetFileInfo(ctx, objectKey)
	if err != nil {
		return nil, err
	}

	reader, err := s.storage.GetFileReader(ctx, objectKey)
	if err != nil {
		return nil, err
	}

	return &struct {
		Reader      interface{}
		ContentType string
		Size        int64
	}{
		Reader:      reader,
		ContentType: fileInfo.ContentType,
		Size:        fileInfo.Size,
	}, nil
}

// ListFilesWithCache lists files with cached metadata.
func (s *LocalStorageService) ListFilesWithCache(ctx context.Context, subDir, prefix string) ([]*ObjectMetadata, error) {
	files, err := s.storage.ListFiles(ctx, subDir, prefix)
	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}

	var results []*ObjectMetadata
	for _, file := range files {
		// Try to get from cache first
		if metadata, err := s.getMetadataFromCache(ctx, file.Key); err == nil {
			results = append(results, metadata)
			continue
		}

		// If not in cache, create metadata and cache it
		metadata := &ObjectMetadata{
			Key:          file.Key,
			Size:         file.Size,
			LastModified: file.LastModified,
			ContentType:  file.ContentType,
			CachedAt:     time.Now(),
		}

		if err := s.cacheMetadata(ctx, file.Key, metadata); err != nil {
			s.logger.Warn("Failed to cache metadata during listing",
				zap.String("object_key", file.Key),
				zap.Error(err))
		}

		results = append(results, metadata)
	}

	s.logger.Debug("Listed files with caching",
		zap.String("sub_dir", subDir),
		zap.String("prefix", prefix),
		zap.Int("count", len(results)))

	return results, nil
}

// ClearCache removes all cached metadata for objects matching a prefix.
func (s *LocalStorageService) ClearCache(ctx context.Context, keyPrefix string) error {
	pattern := s.cachePrefix + keyPrefix + "*"

	keys, err := s.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed to get cache keys: %w", err)
	}

	if len(keys) > 0 {
		if err := s.redisClient.Del(ctx, keys...).Err(); err != nil {
			return fmt.Errorf("failed to clear cache: %w", err)
		}
	}

	s.logger.Info("Cache cleared",
		zap.String("pattern", pattern),
		zap.Int("keys_cleared", len(keys)))

	return nil
}

// cacheMetadata stores object metadata in Redis.
func (s *LocalStorageService) cacheMetadata(ctx context.Context, objectKey string, metadata *ObjectMetadata) error {
	cacheKey := s.cachePrefix + objectKey

	data, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	if err := s.redisClient.Set(ctx, cacheKey, data, s.cacheTTL).Err(); err != nil {
		return fmt.Errorf("failed to cache metadata: %w", err)
	}

	return nil
}

// getMetadataFromCache retrieves object metadata from Redis cache.
func (s *LocalStorageService) getMetadataFromCache(ctx context.Context, objectKey string) (*ObjectMetadata, error) {
	cacheKey := s.cachePrefix + objectKey

	val, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, err
	}

	var metadata ObjectMetadata
	if err := json.Unmarshal([]byte(val), &metadata); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached metadata: %w", err)
	}

	return &metadata, nil
}

// GetStorage returns the underlying local storage instance.
func (s *LocalStorageService) GetStorage() *upload.LocalStorage {
	return s.storage
}
