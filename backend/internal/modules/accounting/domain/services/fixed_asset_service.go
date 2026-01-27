package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// FixedAssetService defines methods for fixed asset business logic
type FixedAssetService interface {
	// Basic CRUD operations
	CreateFixedAsset(ctx context.Context, asset *entities.FixedAsset) error
	GetFixedAssetByID(ctx context.Context, id uuid.UUID) (*entities.FixedAsset, error)
	GetAllFixedAssets(ctx context.Context) ([]*entities.FixedAsset, error)
	UpdateFixedAsset(ctx context.Context, asset *entities.FixedAsset) error
	DeleteFixedAsset(ctx context.Context, id uuid.UUID) error

	// Query operations
	GetFixedAssetByCode(ctx context.Context, assetCode string) (*entities.FixedAsset, error)
	GetFixedAssetsByCategory(ctx context.Context, category string) ([]*entities.FixedAsset, error)
	GetFixedAssetsByStatus(ctx context.Context, status entities.FixedAssetStatus) ([]*entities.FixedAsset, error)
	GetFixedAssetsByLocation(ctx context.Context, locationID string) ([]*entities.FixedAsset, error)
	SearchFixedAssets(ctx context.Context, companyID string, searchTerm string) ([]*entities.FixedAsset, error)

	// Company-specific operations
	GetFixedAssetsByCompany(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetActiveFixedAssetsByCompany(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)

	// Depreciation operations
	ProcessDepreciation(ctx context.Context, assetID uuid.UUID) (*entities.FixedAssetDepreciation, error)
	GetDepreciationSchedule(ctx context.Context, assetID uuid.UUID) ([]*entities.FixedAssetDepreciation, error)
	ProcessMonthlyDepreciation(ctx context.Context, companyID string, month time.Time) error

	// Disposal operations
	DisposeAsset(ctx context.Context, disposal *entities.FixedAssetDisposal) error
	GetDisposalByAsset(ctx context.Context, assetID uuid.UUID) (*entities.FixedAssetDisposal, error)

	// Reporting operations
	GetAssetSummary(ctx context.Context, companyID string) (*FixedAssetSummary, error)
	GetTotalBookValue(ctx context.Context, companyID string) (float64, error)
	GetFullyDepreciatedAssets(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetAssetsNearEndOfLife(ctx context.Context, companyID string, thresholdYears float64) ([]*entities.FixedAsset, error)

	// Maintenance operations
	GetAssetsWithExpiredWarranty(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetAssetsWithExpiredInsurance(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
}

// FixedAssetSummary represents a summary of fixed assets
type FixedAssetSummary struct {
	TotalAssets       int     `json:"total_assets"`
	TotalCost         float64 `json:"total_cost"`
	TotalBookValue    float64 `json:"total_book_value"`
	TotalDepreciation float64 `json:"total_depreciation"`
	ActiveAssets      int     `json:"active_assets"`
	DisposedAssets    int     `json:"disposed_assets"`
}
