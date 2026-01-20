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

// MinIOService provides high-level MinIO operations with Redis caching.
type MinIOService struct {
	storage     *upload.MinIOStorage
	redisClient *redis.Client
	logger      *zap.Logger
	cachePrefix string
	cacheTTL    time.Duration
}

// ObjectMetadata represents cached object metadata.
type ObjectMetadata struct {
	Key          string            `json:"key"`
	Size         int64             `json:"size"`
	LastModified time.Time         `json:"last_modified"`
	ContentType  string            `json:"content_type"`
	ETag         string            `json:"etag"`
	UserMetadata map[string]string `json:"user_metadata"`
	CachedAt     time.Time         `json:"cached_at"`
}

// UploadResult represents the result of an upload operation.
type UploadResult struct {
	ObjectKey string            `json:"object_key"`
	Size      int64             `json:"size"`
	URL       string            `json:"url"`
	Metadata  map[string]string `json:"metadata"`
}

// NewMinIOService creates a new MinIO service with Redis caching.
func NewMinIOService(storage *upload.MinIOStorage, redisClient *redis.Client, logger *zap.Logger) *MinIOService {
	return &MinIOService{
		storage:     storage,
		redisClient: redisClient,
		logger:      logger,
		cachePrefix: "minio:metadata:",
		cacheTTL:    24 * time.Hour, // Cache metadata for 24 hours
	}
}

// UploadWithMetadata uploads a file and caches its metadata in Redis.
func (s *MinIOService) UploadWithMetadata(ctx context.Context, file *multipart.FileHeader) (*UploadResult, error) {
	// Upload file to MinIO
	objectKey, err := s.storage.Upload(ctx, file)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Get object info for metadata
	objectInfo, err := s.storage.GetObjectInfo(ctx, objectKey)
	if err != nil {
		s.logger.Warn("Failed to get object info after upload", 
			zap.String("object_key", objectKey), 
			zap.Error(err))
		// Continue without caching if we can't get info
	} else {
		// Cache metadata in Redis
		metadata := &ObjectMetadata{
			Key:          objectKey,
			Size:         objectInfo.Size,
			LastModified: objectInfo.LastModified,
			ContentType:  objectInfo.ContentType,
			ETag:         objectInfo.ETag,
			UserMetadata: objectInfo.UserMetadata,
			CachedAt:     time.Now(),
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
		URL:       fmt.Sprintf("/api/v1/storage/download/%s", objectKey),
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
func (s *MinIOService) UploadBytesWithMetadata(ctx context.Context, data []byte, filename, contentType string) (*UploadResult, error) {
	// Upload bytes to MinIO
	objectKey, err := s.storage.UploadBytes(ctx, data, filename, contentType)
	if err != nil {
		return nil, fmt.Errorf("failed to upload bytes: %w", err)
	}

	// Get object info for metadata
	objectInfo, err := s.storage.GetObjectInfo(ctx, objectKey)
	if err != nil {
		s.logger.Warn("Failed to get object info after upload", 
			zap.String("object_key", objectKey), 
			zap.Error(err))
		// Continue without caching if we can't get info
	} else {
		// Cache metadata in Redis
		metadata := &ObjectMetadata{
			Key:          objectKey,
			Size:         objectInfo.Size,
			LastModified: objectInfo.LastModified,
			ContentType:  objectInfo.ContentType,
			ETag:         objectInfo.ETag,
			UserMetadata: objectInfo.UserMetadata,
			CachedAt:     time.Now(),
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
		URL:       fmt.Sprintf("/api/v1/storage/download/%s", objectKey),
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

// GetObjectMetadata retrieves object metadata from cache or MinIO.
func (s *MinIOService) GetObjectMetadata(ctx context.Context, objectKey string) (*ObjectMetadata, error) {
	// Try to get from cache first
	if metadata, err := s.getMetadataFromCache(ctx, objectKey); err == nil {
		s.logger.Debug("Retrieved metadata from cache", zap.String("object_key", objectKey))
		return metadata, nil
	}

	// If not in cache, get from MinIO
	objectInfo, err := s.storage.GetObjectInfo(ctx, objectKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get object info: %w", err)
	}

	metadata := &ObjectMetadata{
		Key:          objectKey,
		Size:         objectInfo.Size,
		LastModified: objectInfo.LastModified,
		ContentType:  objectInfo.ContentType,
		ETag:         objectInfo.ETag,
		UserMetadata: objectInfo.UserMetadata,
		CachedAt:     time.Now(),
	}

	// Cache for future requests
	if err := s.cacheMetadata(ctx, objectKey, metadata); err != nil {
		s.logger.Warn("Failed to cache metadata", 
			zap.String("object_key", objectKey), 
			zap.Error(err))
	}

	s.logger.Debug("Retrieved metadata from MinIO and cached", zap.String("object_key", objectKey))
	return metadata, nil
}

// GenerateDownloadURL creates a presigned URL for downloading objects.
func (s *MinIOService) GenerateDownloadURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
	// Check if object exists (from cache or MinIO)
	_, err := s.GetObjectMetadata(ctx, objectKey)
	if err != nil {
		return "", fmt.Errorf("object not found: %w", err)
	}

	// Generate presigned URL
	url, err := s.storage.GetSignedURL(ctx, objectKey, expiry)
	if err != nil {
		return "", fmt.Errorf("failed to generate download URL: %w", err)
	}

	s.logger.Debug("Generated download URL", 
		zap.String("object_key", objectKey),
		zap.Duration("expiry", expiry))

	return url, nil
}

// DeleteWithCache removes an object from MinIO and clears its cache.
func (s *MinIOService) DeleteWithCache(ctx context.Context, objectKey string) error {
	// Delete from MinIO
	if err := s.storage.Delete(ctx, objectKey); err != nil {
		return fmt.Errorf("failed to delete from MinIO: %w", err)
	}

	// Remove from cache
	cacheKey := s.cachePrefix + objectKey
	if err := s.redisClient.Del(ctx, cacheKey).Err(); err != nil {
		s.logger.Warn("Failed to remove from cache", 
			zap.String("object_key", objectKey), 
			zap.Error(err))
	}

	s.logger.Info("Object deleted and cache cleared", zap.String("object_key", objectKey))
	return nil
}

// ListObjectsWithCache lists objects with cached metadata.
func (s *MinIOService) ListObjectsWithCache(ctx context.Context, bucketName, prefix string) ([]*ObjectMetadata, error) {
	// Get objects from MinIO
	objects, err := s.storage.ListObjects(ctx, bucketName, prefix)
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}

	var results []*ObjectMetadata
	for _, obj := range objects {
		objectKey := fmt.Sprintf("%s/%s", bucketName, obj.Key)
		
		// Try to get from cache first
		if metadata, err := s.getMetadataFromCache(ctx, objectKey); err == nil {
			results = append(results, metadata)
			continue
		}

		// If not in cache, create metadata and cache it
		metadata := &ObjectMetadata{
			Key:          objectKey,
			Size:         obj.Size,
			LastModified: obj.LastModified,
			ContentType:  obj.ContentType,
			ETag:         obj.ETag,
			UserMetadata: obj.UserMetadata,
			CachedAt:     time.Now(),
		}

		// Cache for future requests
		if err := s.cacheMetadata(ctx, objectKey, metadata); err != nil {
			s.logger.Warn("Failed to cache metadata during listing", 
				zap.String("object_key", objectKey), 
				zap.Error(err))
		}

		results = append(results, metadata)
	}

	s.logger.Debug("Listed objects with caching", 
		zap.String("bucket", bucketName),
		zap.String("prefix", prefix),
		zap.Int("count", len(results)))

	return results, nil
}

// ClearCache removes all cached metadata for objects matching a prefix.
func (s *MinIOService) ClearCache(ctx context.Context, keyPrefix string) error {
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

// GetCacheStats returns statistics about cached objects.
func (s *MinIOService) GetCacheStats(ctx context.Context) (map[string]interface{}, error) {
	pattern := s.cachePrefix + "*"
	
	keys, err := s.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get cache keys: %w", err)
	}

	var totalSize int64
	var oldestCache, newestCache time.Time
	
	for i, key := range keys {
		val, err := s.redisClient.Get(ctx, key).Result()
		if err != nil {
			continue
		}

		var metadata ObjectMetadata
		if err := json.Unmarshal([]byte(val), &metadata); err != nil {
			continue
		}

		totalSize += metadata.Size
		
		if i == 0 {
			oldestCache = metadata.CachedAt
			newestCache = metadata.CachedAt
		} else {
			if metadata.CachedAt.Before(oldestCache) {
				oldestCache = metadata.CachedAt
			}
			if metadata.CachedAt.After(newestCache) {
				newestCache = metadata.CachedAt
			}
		}
	}

	stats := map[string]interface{}{
		"cached_objects":   len(keys),
		"total_size_bytes": totalSize,
		"oldest_cache":     oldestCache,
		"newest_cache":     newestCache,
		"cache_prefix":     s.cachePrefix,
		"cache_ttl":        s.cacheTTL,
	}

	return stats, nil
}

// cacheMetadata stores object metadata in Redis.
func (s *MinIOService) cacheMetadata(ctx context.Context, objectKey string, metadata *ObjectMetadata) error {
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
func (s *MinIOService) getMetadataFromCache(ctx context.Context, objectKey string) (*ObjectMetadata, error) {
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