package services

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"strconv"

	"malaka/internal/modules/settings/domain/entities"
	"malaka/internal/modules/settings/domain/repositories"
)

// SettingService provides business logic for settings management
type SettingService struct {
	repo          repositories.SettingRepository
	encryptionKey []byte
}

// NewSettingService creates a new SettingService
func NewSettingService(repo repositories.SettingRepository, encryptionKey string) *SettingService {
	key := []byte(encryptionKey)
	// Ensure key is 32 bytes for AES-256
	if len(key) < 32 {
		paddedKey := make([]byte, 32)
		copy(paddedKey, key)
		key = paddedKey
	} else if len(key) > 32 {
		key = key[:32]
	}
	
	return &SettingService{
		repo:          repo,
		encryptionKey: key,
	}
}

// GetPublicSettings retrieves settings that are safe to expose to frontend
func (s *SettingService) GetPublicSettings(ctx context.Context, category *string) ([]*entities.PublicSetting, error) {
	filters := &entities.SettingFilter{
		Category: category,
	}
	return s.repo.GetPublicSettings(ctx, filters)
}

// GetUserSettings retrieves settings accessible to a user with their role
func (s *SettingService) GetUserSettings(ctx context.Context, userRole string, category *string, includeValues bool) ([]*entities.Setting, error) {
	if category != nil {
		return s.repo.GetByCategory(ctx, *category, &userRole)
	}
	return s.repo.GetUserSettings(ctx, userRole, includeValues)
}

// GetSetting retrieves a specific setting by key
func (s *SettingService) GetSetting(ctx context.Context, category, subCategory, key string) (*entities.Setting, error) {
	setting, err := s.repo.GetByKey(ctx, category, subCategory, key)
	if err != nil {
		return nil, err
	}
	
	if setting != nil && setting.DataType == entities.DataTypeEncrypted && setting.SettingValue != nil {
		decrypted, err := s.decrypt(*setting.SettingValue)
		if err != nil {
			return nil, fmt.Errorf("failed to decrypt setting: %w", err)
		}
		setting.SettingValue = &decrypted
	}
	
	return setting, nil
}

// UpdateSetting updates a setting value with encryption if needed
func (s *SettingService) UpdateSetting(ctx context.Context, category, subCategory, key string, update *entities.SettingUpdate) error {
	setting, err := s.repo.GetByKey(ctx, category, subCategory, key)
	if err != nil {
		return err
	}
	if setting == nil {
		return fmt.Errorf("setting not found: %s.%s.%s", category, subCategory, key)
	}
	
	// Encrypt value if setting is marked as encrypted
	if setting.DataType == entities.DataTypeEncrypted {
		encrypted, err := s.encrypt(update.SettingValue)
		if err != nil {
			return fmt.Errorf("failed to encrypt setting: %w", err)
		}
		update.SettingValue = encrypted
	}
	
	// Validate data type
	if err := s.validateValue(update.SettingValue, setting.DataType); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	
	return s.repo.Update(ctx, setting.ID, update)
}

// UpdateBulkSettings updates multiple settings in a transaction
func (s *SettingService) UpdateBulkSettings(ctx context.Context, updates map[string]string, userID *string, changeReason *string) error {
	// Get all settings to update
	keys := make([]string, 0, len(updates))
	for key := range updates {
		keys = append(keys, key)
	}
	
	settings, err := s.repo.GetBulkByKeys(ctx, keys)
	if err != nil {
		return err
	}
	
	// Prepare updates with encryption and validation
	repoUpdates := make(map[string]*entities.SettingUpdate)
	for key, value := range updates {
		setting, exists := settings[key]
		if !exists {
			return fmt.Errorf("setting not found: %s", key)
		}
		
		finalValue := value
		
		// Encrypt if needed
		if setting.DataType == entities.DataTypeEncrypted {
			encrypted, err := s.encrypt(value)
			if err != nil {
				return fmt.Errorf("failed to encrypt setting %s: %w", key, err)
			}
			finalValue = encrypted
		}
		
		// Validate
		if err := s.validateValue(finalValue, setting.DataType); err != nil {
			return fmt.Errorf("validation failed for %s: %w", key, err)
		}
		
		repoUpdates[setting.ID] = &entities.SettingUpdate{
			SettingValue: finalValue,
			UpdatedBy:    userID,
			ChangeReason: changeReason,
		}
	}
	
	return s.repo.UpdateBulk(ctx, repoUpdates)
}

// CheckPermission checks if a user has permission to access a setting category
func (s *SettingService) CheckPermission(ctx context.Context, userRole, category, subCategory string) (canRead, canWrite bool, err error) {
	permission, err := s.repo.CheckPermission(ctx, userRole, category, subCategory)
	if err != nil {
		return false, false, err
	}
	
	if permission == nil {
		return false, false, nil
	}
	
	return permission.CanRead, permission.CanWrite, nil
}

// GetAuditLog retrieves audit log for a setting
func (s *SettingService) GetAuditLog(ctx context.Context, category, subCategory, key string, limit int) ([]*entities.SettingAudit, error) {
	setting, err := s.repo.GetByKey(ctx, category, subCategory, key)
	if err != nil {
		return nil, err
	}
	if setting == nil {
		return nil, fmt.Errorf("setting not found")
	}
	
	return s.repo.GetAuditLog(ctx, setting.ID, limit)
}

// GetSettingsForCategory retrieves all settings for a category, properly filtered by permissions
func (s *SettingService) GetSettingsForCategory(ctx context.Context, category string, userRole *string) (map[string]interface{}, error) {
	settings, err := s.repo.GetByCategory(ctx, category, userRole)
	if err != nil {
		return nil, err
	}
	
	result := make(map[string]interface{})
	
	for _, setting := range settings {
		value := setting.GetValueOrDefault()
		if value == nil {
			continue
		}
		
		// Decrypt if needed and user has permission
		if setting.DataType == entities.DataTypeEncrypted && !setting.IsPublic {
			if userRole != nil {
				canRead, _, err := s.CheckPermission(ctx, *userRole, category, "")
				if err != nil || !canRead {
					// Return masked value for unauthorized users
					result[setting.SettingKey] = "********"
					continue
				}
				
				decrypted, err := s.decrypt(*value)
				if err != nil {
					return nil, fmt.Errorf("failed to decrypt %s: %w", setting.SettingKey, err)
				}
				result[setting.SettingKey] = s.convertValue(decrypted, setting.DataType)
			} else {
				result[setting.SettingKey] = "********"
			}
		} else {
			result[setting.SettingKey] = s.convertValue(*value, setting.DataType)
		}
	}
	
	return result, nil
}

// encrypt encrypts a string value
func (s *SettingService) encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(s.encryptionKey)
	if err != nil {
		return "", err
	}
	
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// decrypt decrypts an encrypted string value
func (s *SettingService) decrypt(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}
	
	block, err := aes.NewCipher(s.encryptionKey)
	if err != nil {
		return "", err
	}
	
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}
	
	nonce, ciphertextBytes := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return "", err
	}
	
	return string(plaintext), nil
}

// validateValue validates a setting value based on its data type
func (s *SettingService) validateValue(value, dataType string) error {
	switch dataType {
	case entities.DataTypeBoolean:
		if value != "true" && value != "false" {
			return fmt.Errorf("boolean value must be 'true' or 'false'")
		}
	case entities.DataTypeNumber:
		if _, err := strconv.ParseFloat(value, 64); err != nil {
			return fmt.Errorf("invalid number format")
		}
	case entities.DataTypeJSON:
		// Could add JSON validation here
	}
	return nil
}

// convertValue converts string value to appropriate type for JSON response
func (s *SettingService) convertValue(value, dataType string) interface{} {
	switch dataType {
	case entities.DataTypeBoolean:
		return value == "true"
	case entities.DataTypeNumber:
		if num, err := strconv.ParseFloat(value, 64); err == nil {
			return num
		}
		return value
	default:
		return value
	}
}