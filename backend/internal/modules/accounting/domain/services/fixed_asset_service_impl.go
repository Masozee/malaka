package services

import (
	"context"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// fixedAssetServiceImpl implements FixedAssetService
type fixedAssetServiceImpl struct {
	repo repositories.FixedAssetRepository
}

// NewFixedAssetService creates a new FixedAssetService
func NewFixedAssetService(repo repositories.FixedAssetRepository) FixedAssetService {
	return &fixedAssetServiceImpl{repo: repo}
}

// CreateFixedAsset creates a new fixed asset
func (s *fixedAssetServiceImpl) CreateFixedAsset(ctx context.Context, asset *entities.FixedAsset) error {
	// Generate ID if not set
	if asset.ID == uuid.Nil {
		asset.ID = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	asset.CreatedAt = now
	asset.UpdatedAt = now

	// Set default status
	if asset.Status == "" {
		asset.Status = entities.FixedAssetStatusActive
	}

	// Calculate initial book value
	asset.BookValue = asset.PurchasePrice - asset.AccumulatedDepreciation

	// Validate
	if err := asset.Validate(); err != nil {
		return err
	}

	return s.repo.Create(ctx, asset)
}

// GetFixedAssetByID retrieves a fixed asset by ID
func (s *fixedAssetServiceImpl) GetFixedAssetByID(ctx context.Context, id uuid.ID) (*entities.FixedAsset, error) {
	asset, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if asset == nil {
		return nil, fmt.Errorf("fixed asset not found: %s", id)
	}
	return asset, nil
}

// GetAllFixedAssets retrieves all fixed assets
func (s *fixedAssetServiceImpl) GetAllFixedAssets(ctx context.Context) ([]*entities.FixedAsset, error) {
	return s.repo.GetAll(ctx)
}

// UpdateFixedAsset updates a fixed asset
func (s *fixedAssetServiceImpl) UpdateFixedAsset(ctx context.Context, asset *entities.FixedAsset) error {
	// Recalculate book value
	asset.BookValue = asset.PurchasePrice - asset.AccumulatedDepreciation
	asset.UpdatedAt = time.Now()

	// Validate
	if err := asset.Validate(); err != nil {
		return err
	}

	return s.repo.Update(ctx, asset)
}

// DeleteFixedAsset deletes a fixed asset
func (s *fixedAssetServiceImpl) DeleteFixedAsset(ctx context.Context, id uuid.ID) error {
	// Check if asset exists
	asset, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if asset == nil {
		return fmt.Errorf("fixed asset not found: %s", id)
	}

	// Don't allow deletion of active assets with book value
	if asset.Status == entities.FixedAssetStatusActive && asset.BookValue > 0 {
		return fmt.Errorf("cannot delete active asset with book value; dispose first")
	}

	return s.repo.Delete(ctx, id)
}

// GetFixedAssetByCode retrieves a fixed asset by code
func (s *fixedAssetServiceImpl) GetFixedAssetByCode(ctx context.Context, assetCode string) (*entities.FixedAsset, error) {
	return s.repo.GetByCode(ctx, assetCode)
}

// GetFixedAssetsByCategory retrieves fixed assets by category
func (s *fixedAssetServiceImpl) GetFixedAssetsByCategory(ctx context.Context, category string) ([]*entities.FixedAsset, error) {
	return s.repo.GetByCategory(ctx, category)
}

// GetFixedAssetsByStatus retrieves fixed assets by status
func (s *fixedAssetServiceImpl) GetFixedAssetsByStatus(ctx context.Context, status entities.FixedAssetStatus) ([]*entities.FixedAsset, error) {
	return s.repo.GetByStatus(ctx, status)
}

// GetFixedAssetsByLocation retrieves fixed assets by location
func (s *fixedAssetServiceImpl) GetFixedAssetsByLocation(ctx context.Context, locationID string) ([]*entities.FixedAsset, error) {
	return s.repo.GetByLocation(ctx, locationID)
}

// SearchFixedAssets searches fixed assets by term
func (s *fixedAssetServiceImpl) SearchFixedAssets(ctx context.Context, companyID string, searchTerm string) ([]*entities.FixedAsset, error) {
	return s.repo.SearchAssets(ctx, companyID, searchTerm)
}

// GetFixedAssetsByCompany retrieves fixed assets by company
func (s *fixedAssetServiceImpl) GetFixedAssetsByCompany(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	return s.repo.GetByCompanyID(ctx, companyID)
}

// GetActiveFixedAssetsByCompany retrieves active fixed assets by company
func (s *fixedAssetServiceImpl) GetActiveFixedAssetsByCompany(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	return s.repo.GetActiveByCompany(ctx, companyID)
}

// ProcessDepreciation processes depreciation for a single asset
func (s *fixedAssetServiceImpl) ProcessDepreciation(ctx context.Context, assetID uuid.ID) (*entities.FixedAssetDepreciation, error) {
	asset, err := s.repo.GetByID(ctx, assetID)
	if err != nil {
		return nil, err
	}
	if asset == nil {
		return nil, fmt.Errorf("fixed asset not found: %s", assetID)
	}

	// Check if depreciation is needed
	if !asset.NeedsDepreciation() {
		return nil, fmt.Errorf("asset does not need depreciation")
	}

	// Calculate depreciation amount
	depreciationAmount := asset.CalculateMonthlyDepreciation()

	// Ensure we don't depreciate below salvage value
	if asset.BookValue-depreciationAmount < asset.SalvageValue {
		depreciationAmount = asset.BookValue - asset.SalvageValue
	}

	if depreciationAmount <= 0 {
		return nil, fmt.Errorf("asset is fully depreciated")
	}

	// Create depreciation entry
	now := time.Now()
	depreciation := &entities.FixedAssetDepreciation{
		ID:                      uuid.New(),
		FixedAssetID:            assetID,
		DepreciationDate:        now,
		DepreciationAmount:      depreciationAmount,
		AccumulatedDepreciation: asset.AccumulatedDepreciation + depreciationAmount,
		BookValue:               asset.BookValue - depreciationAmount,
		Period:                  now.Format("2006-01"),
		CreatedBy:               "system",
		CreatedAt:               now,
	}

	// Save depreciation
	if err := s.repo.CreateDepreciation(ctx, depreciation); err != nil {
		return nil, err
	}

	// Update asset
	asset.AccumulatedDepreciation = depreciation.AccumulatedDepreciation
	asset.BookValue = depreciation.BookValue
	asset.LastDepreciationDate = &now

	if err := s.repo.Update(ctx, asset); err != nil {
		return nil, err
	}

	return depreciation, nil
}

// GetDepreciationSchedule retrieves depreciation schedule for an asset
func (s *fixedAssetServiceImpl) GetDepreciationSchedule(ctx context.Context, assetID uuid.ID) ([]*entities.FixedAssetDepreciation, error) {
	return s.repo.GetDepreciationSchedule(ctx, assetID)
}

// ProcessMonthlyDepreciation processes monthly depreciation for all assets
func (s *fixedAssetServiceImpl) ProcessMonthlyDepreciation(ctx context.Context, companyID string, month time.Time) error {
	assets, err := s.repo.GetAssetsNeedingDepreciation(ctx, companyID, month)
	if err != nil {
		return err
	}

	for _, asset := range assets {
		_, err := s.ProcessDepreciation(ctx, asset.ID)
		if err != nil {
			// Log but continue with other assets
			continue
		}
	}

	return nil
}

// DisposeAsset disposes a fixed asset
func (s *fixedAssetServiceImpl) DisposeAsset(ctx context.Context, disposal *entities.FixedAssetDisposal) error {
	// Get the asset
	asset, err := s.repo.GetByID(ctx, disposal.FixedAssetID)
	if err != nil {
		return err
	}
	if asset == nil {
		return fmt.Errorf("fixed asset not found: %s", disposal.FixedAssetID)
	}

	// Check if already disposed
	if asset.Status != entities.FixedAssetStatusActive {
		return fmt.Errorf("asset is not active")
	}

	// Generate ID
	if disposal.ID == uuid.Nil {
		disposal.ID = uuid.New()
	}

	// Set book value at disposal
	disposal.BookValueAtDisposal = asset.BookValue

	// Calculate gain/loss
	disposal.CalculateGainLoss()

	// Set timestamps
	now := time.Now()
	disposal.CreatedAt = now

	// Validate
	if err := disposal.Validate(); err != nil {
		return err
	}

	// Create disposal record
	if err := s.repo.CreateDisposal(ctx, disposal); err != nil {
		return err
	}

	// Update asset status
	asset.Status = entities.FixedAssetStatusDisposed
	asset.UpdatedAt = now

	return s.repo.Update(ctx, asset)
}

// GetDisposalByAsset retrieves the disposal record for an asset
func (s *fixedAssetServiceImpl) GetDisposalByAsset(ctx context.Context, assetID uuid.ID) (*entities.FixedAssetDisposal, error) {
	return s.repo.GetDisposalByAsset(ctx, assetID)
}

// GetAssetSummary retrieves a summary of fixed assets
func (s *fixedAssetServiceImpl) GetAssetSummary(ctx context.Context, companyID string) (*FixedAssetSummary, error) {
	assets, err := s.repo.GetByCompanyID(ctx, companyID)
	if err != nil {
		return nil, err
	}

	summary := &FixedAssetSummary{}

	for _, asset := range assets {
		summary.TotalAssets++
		summary.TotalCost += asset.PurchasePrice
		summary.TotalBookValue += asset.BookValue
		summary.TotalDepreciation += asset.AccumulatedDepreciation

		if asset.Status == entities.FixedAssetStatusActive {
			summary.ActiveAssets++
		} else if asset.Status == entities.FixedAssetStatusDisposed {
			summary.DisposedAssets++
		}
	}

	return summary, nil
}

// GetTotalBookValue retrieves total book value
func (s *fixedAssetServiceImpl) GetTotalBookValue(ctx context.Context, companyID string) (float64, error) {
	return s.repo.GetTotalBookValue(ctx, companyID, time.Now())
}

// GetFullyDepreciatedAssets retrieves fully depreciated assets
func (s *fixedAssetServiceImpl) GetFullyDepreciatedAssets(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	return s.repo.GetFullyDepreciatedAssets(ctx, companyID)
}

// GetAssetsNearEndOfLife retrieves assets near end of useful life
func (s *fixedAssetServiceImpl) GetAssetsNearEndOfLife(ctx context.Context, companyID string, thresholdYears float64) ([]*entities.FixedAsset, error) {
	return s.repo.GetAssetsNearEndOfLife(ctx, companyID, thresholdYears)
}

// GetAssetsWithExpiredWarranty retrieves assets with expired warranty
func (s *fixedAssetServiceImpl) GetAssetsWithExpiredWarranty(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	return s.repo.GetAssetsWithExpiredWarranty(ctx, companyID)
}

// GetAssetsWithExpiredInsurance retrieves assets with expired insurance
func (s *fixedAssetServiceImpl) GetAssetsWithExpiredInsurance(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	return s.repo.GetAssetsWithExpiredInsurance(ctx, companyID)
}
