package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// FixedAssetRepository defines methods for fixed asset operations
type FixedAssetRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, asset *entities.FixedAsset) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.FixedAsset, error)
	GetAll(ctx context.Context) ([]*entities.FixedAsset, error)
	Update(ctx context.Context, asset *entities.FixedAsset) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Depreciation operations
	CreateDepreciation(ctx context.Context, depreciation *entities.FixedAssetDepreciation) error
	GetDepreciationByID(ctx context.Context, id uuid.UUID) (*entities.FixedAssetDepreciation, error)
	GetDepreciationsByAsset(ctx context.Context, assetID uuid.UUID) ([]*entities.FixedAssetDepreciation, error)
	UpdateDepreciation(ctx context.Context, depreciation *entities.FixedAssetDepreciation) error
	DeleteDepreciation(ctx context.Context, id uuid.UUID) error

	// Disposal operations
	CreateDisposal(ctx context.Context, disposal *entities.FixedAssetDisposal) error
	GetDisposalByID(ctx context.Context, id uuid.UUID) (*entities.FixedAssetDisposal, error)
	GetDisposalByAsset(ctx context.Context, assetID uuid.UUID) (*entities.FixedAssetDisposal, error)
	UpdateDisposal(ctx context.Context, disposal *entities.FixedAssetDisposal) error
	DeleteDisposal(ctx context.Context, id uuid.UUID) error

	// Query operations
	GetByCode(ctx context.Context, assetCode string) (*entities.FixedAsset, error)
	GetByCategory(ctx context.Context, category string) ([]*entities.FixedAsset, error)
	GetByStatus(ctx context.Context, status entities.FixedAssetStatus) ([]*entities.FixedAsset, error)
	GetByLocation(ctx context.Context, locationID string) ([]*entities.FixedAsset, error)
	GetByDepartment(ctx context.Context, departmentID string) ([]*entities.FixedAsset, error)
	GetByResponsiblePerson(ctx context.Context, personID string) ([]*entities.FixedAsset, error)
	GetBySerialNumber(ctx context.Context, serialNumber string) (*entities.FixedAsset, error)
	
	// Company-specific operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	
	// Depreciation management
	GetAssetsNeedingDepreciation(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.FixedAsset, error)
	ProcessMonthlyDepreciation(ctx context.Context, companyID string, month time.Time) error
	GetDepreciationSchedule(ctx context.Context, assetID uuid.UUID) ([]*entities.FixedAssetDepreciation, error)
	GetDepreciationByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAssetDepreciation, error)
	
	// Asset valuation
	GetAssetRegister(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.FixedAsset, error)
	GetBookValues(ctx context.Context, companyID string, asOfDate time.Time) (map[uuid.UUID]float64, error)
	GetTotalBookValue(ctx context.Context, companyID string, asOfDate time.Time) (float64, error)
	
	// Maintenance and warranty
	GetAssetsWithExpiredWarranty(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetAssetsWithExpiredInsurance(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetMaintenanceSchedule(ctx context.Context, companyID string, fromDate, toDate time.Time) ([]*entities.FixedAsset, error)
	
	// Reporting operations
	GetDepreciationReport(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAssetDepreciation, error)
	GetAssetAgeAnalysis(ctx context.Context, companyID string) (map[string]int, error)
	GetAssetUtilization(ctx context.Context, companyID string) (map[uuid.UUID]float64, error)
	GetDisposalReport(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAssetDisposal, error)
	
	// Asset lifecycle
	GetAssetHistory(ctx context.Context, assetID uuid.UUID) (map[string]interface{}, error)
	GetFullyDepreciatedAssets(ctx context.Context, companyID string) ([]*entities.FixedAsset, error)
	GetAssetsNearEndOfLife(ctx context.Context, companyID string, thresholdYears float64) ([]*entities.FixedAsset, error)
	
	// Batch operations
	CreateBatch(ctx context.Context, assets []*entities.FixedAsset) error
	UpdateBookValues(ctx context.Context, companyID string, asOfDate time.Time) error
	RecalculateDepreciation(ctx context.Context, assetID uuid.UUID) error
	
	// Search operations
	SearchAssets(ctx context.Context, companyID string, searchTerm string) ([]*entities.FixedAsset, error)
	GetAssetsByDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAsset, error)
}