package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// FixedAssetStatus represents the status of a fixed asset
type FixedAssetStatus string

const (
	FixedAssetStatusActive    FixedAssetStatus = "ACTIVE"
	FixedAssetStatusDisposed  FixedAssetStatus = "DISPOSED"
	FixedAssetStatusSold      FixedAssetStatus = "SOLD"
	FixedAssetStatusLost      FixedAssetStatus = "LOST"
	FixedAssetStatusDamaged   FixedAssetStatus = "DAMAGED"
)

// DepreciationMethod represents the depreciation method
type DepreciationMethod string

const (
	DepreciationMethodStraightLine        DepreciationMethod = "STRAIGHT_LINE"
	DepreciationMethodDecliningBalance    DepreciationMethod = "DECLINING_BALANCE"
	DepreciationMethodUnitsOfProduction   DepreciationMethod = "UNITS_OF_PRODUCTION"
	DepreciationMethodSumOfYearsDigits    DepreciationMethod = "SUM_OF_YEARS_DIGITS"
)

// FixedAsset represents a fixed asset
type FixedAsset struct {
	ID                    uuid.ID            `json:"id" db:"id"`
	AssetCode             string             `json:"asset_code" db:"asset_code"`
	AssetName             string             `json:"asset_name" db:"asset_name"`
	AssetCategory         string             `json:"asset_category" db:"asset_category"`
	Status                FixedAssetStatus   `json:"status" db:"status"`
	PurchaseDate          time.Time          `json:"purchase_date" db:"purchase_date"`
	PurchasePrice         float64            `json:"purchase_price" db:"purchase_price"`
	SalvageValue          float64            `json:"salvage_value" db:"salvage_value"`
	UsefulLife            int                `json:"useful_life" db:"useful_life"`           // In years
	DepreciationMethod    DepreciationMethod `json:"depreciation_method" db:"depreciation_method"`
	AccumulatedDepreciation float64          `json:"accumulated_depreciation" db:"accumulated_depreciation"`
	BookValue             float64            `json:"book_value" db:"book_value"`
	LastDepreciationDate  *time.Time         `json:"last_depreciation_date" db:"last_depreciation_date"`
	LocationID            string             `json:"location_id" db:"location_id"`
	DepartmentID          string             `json:"department_id" db:"department_id"`
	ResponsiblePersonID   string             `json:"responsible_person_id" db:"responsible_person_id"`
	Vendor                string             `json:"vendor" db:"vendor"`
	SerialNumber          string             `json:"serial_number" db:"serial_number"`
	ModelNumber           string             `json:"model_number" db:"model_number"`
	WarrantyExpiry        *time.Time         `json:"warranty_expiry" db:"warranty_expiry"`
	InsuranceValue        float64            `json:"insurance_value" db:"insurance_value"`
	InsuranceExpiry       *time.Time         `json:"insurance_expiry" db:"insurance_expiry"`
	MaintenanceSchedule   string             `json:"maintenance_schedule" db:"maintenance_schedule"`
	Notes                 string             `json:"notes" db:"notes"`
	CompanyID             string             `json:"company_id" db:"company_id"`
	CreatedBy             string             `json:"created_by" db:"created_by"`
	CreatedAt             time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time          `json:"updated_at" db:"updated_at"`
}

// FixedAssetDepreciation represents a depreciation entry
type FixedAssetDepreciation struct {
	ID                    uuid.ID   `json:"id" db:"id"`
	FixedAssetID          uuid.ID   `json:"fixed_asset_id" db:"fixed_asset_id"`
	DepreciationDate      time.Time `json:"depreciation_date" db:"depreciation_date"`
	DepreciationAmount    float64   `json:"depreciation_amount" db:"depreciation_amount"`
	AccumulatedDepreciation float64 `json:"accumulated_depreciation" db:"accumulated_depreciation"`
	BookValue             float64   `json:"book_value" db:"book_value"`
	Period                string    `json:"period" db:"period"`                       // e.g., "2024-01"
	JournalEntryID        *uuid.ID  `json:"journal_entry_id" db:"journal_entry_id"`
	CreatedBy             string    `json:"created_by" db:"created_by"`
	CreatedAt             time.Time `json:"created_at" db:"created_at"`
}

// FixedAssetDisposal represents an asset disposal
type FixedAssetDisposal struct {
	ID               uuid.ID   `json:"id" db:"id"`
	FixedAssetID     uuid.ID   `json:"fixed_asset_id" db:"fixed_asset_id"`
	DisposalDate     time.Time `json:"disposal_date" db:"disposal_date"`
	DisposalMethod   string    `json:"disposal_method" db:"disposal_method"`     // SALE, SCRAP, DONATION, LOSS
	DisposalPrice    float64   `json:"disposal_price" db:"disposal_price"`
	BookValueAtDisposal float64 `json:"book_value_at_disposal" db:"book_value_at_disposal"`
	GainLoss         float64   `json:"gain_loss" db:"gain_loss"`
	Reason           string    `json:"reason" db:"reason"`
	AuthorizedBy     string    `json:"authorized_by" db:"authorized_by"`
	JournalEntryID   *uuid.ID  `json:"journal_entry_id" db:"journal_entry_id"`
	CreatedBy        string    `json:"created_by" db:"created_by"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

// CalculateBookValue calculates the current book value
func (fa *FixedAsset) CalculateBookValue() {
	fa.BookValue = fa.PurchasePrice - fa.AccumulatedDepreciation
}

// CalculateMonthlyDepreciation calculates monthly depreciation amount
func (fa *FixedAsset) CalculateMonthlyDepreciation() float64 {
	switch fa.DepreciationMethod {
	case DepreciationMethodStraightLine:
		return fa.CalculateStraightLineDepreciation() / 12
	case DepreciationMethodDecliningBalance:
		return fa.CalculateDecliningBalanceDepreciation() / 12
	default:
		return 0
	}
}

// CalculateStraightLineDepreciation calculates annual straight line depreciation
func (fa *FixedAsset) CalculateStraightLineDepreciation() float64 {
	if fa.UsefulLife == 0 {
		return 0
	}
	return (fa.PurchasePrice - fa.SalvageValue) / float64(fa.UsefulLife)
}

// CalculateDecliningBalanceDepreciation calculates declining balance depreciation
func (fa *FixedAsset) CalculateDecliningBalanceDepreciation() float64 {
	if fa.UsefulLife == 0 {
		return 0
	}
	rate := 2.0 / float64(fa.UsefulLife) // Double declining balance
	return fa.BookValue * rate
}

// IsFullyDepreciated returns true if the asset is fully depreciated
func (fa *FixedAsset) IsFullyDepreciated() bool {
	return fa.BookValue <= fa.SalvageValue
}

// NeedsDepreciation returns true if the asset needs depreciation
func (fa *FixedAsset) NeedsDepreciation() bool {
	if fa.Status != FixedAssetStatusActive {
		return false
	}
	if fa.IsFullyDepreciated() {
		return false
	}
	if fa.LastDepreciationDate == nil {
		return true
	}
	
	// Check if a month has passed since last depreciation
	nextDepreciationDate := fa.LastDepreciationDate.AddDate(0, 1, 0)
	return time.Now().After(nextDepreciationDate)
}

// GetRemainingUsefulLife returns the remaining useful life in years
func (fa *FixedAsset) GetRemainingUsefulLife() float64 {
	yearsSincePurchase := time.Since(fa.PurchaseDate).Hours() / (24 * 365)
	remainingLife := float64(fa.UsefulLife) - yearsSincePurchase
	if remainingLife < 0 {
		return 0
	}
	return remainingLife
}

// IsWarrantyExpired returns true if warranty has expired
func (fa *FixedAsset) IsWarrantyExpired() bool {
	if fa.WarrantyExpiry == nil {
		return true
	}
	return time.Now().After(*fa.WarrantyExpiry)
}

// IsInsuranceExpired returns true if insurance has expired
func (fa *FixedAsset) IsInsuranceExpired() bool {
	if fa.InsuranceExpiry == nil {
		return true
	}
	return time.Now().After(*fa.InsuranceExpiry)
}

// CalculateGainLoss calculates gain or loss on disposal
func (fad *FixedAssetDisposal) CalculateGainLoss() {
	fad.GainLoss = fad.DisposalPrice - fad.BookValueAtDisposal
}

// Validate checks if the fixed asset is valid
func (fa *FixedAsset) Validate() error {
	if fa.AssetCode == "" {
		return NewValidationError("asset_code is required")
	}
	if fa.AssetName == "" {
		return NewValidationError("asset_name is required")
	}
	if fa.PurchaseDate.IsZero() {
		return NewValidationError("purchase_date is required")
	}
	if fa.PurchasePrice <= 0 {
		return NewValidationError("purchase_price must be positive")
	}
	if fa.SalvageValue < 0 {
		return NewValidationError("salvage_value cannot be negative")
	}
	if fa.SalvageValue >= fa.PurchasePrice {
		return NewValidationError("salvage_value must be less than purchase_price")
	}
	if fa.UsefulLife <= 0 {
		return NewValidationError("useful_life must be positive")
	}
	if fa.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	
	return nil
}

// Validate checks if the depreciation entry is valid
func (fad *FixedAssetDepreciation) Validate() error {
	if fad.FixedAssetID.IsNil() {
		return NewValidationError("fixed_asset_id is required")
	}
	if fad.DepreciationDate.IsZero() {
		return NewValidationError("depreciation_date is required")
	}
	if fad.DepreciationAmount <= 0 {
		return NewValidationError("depreciation_amount must be positive")
	}
	if fad.Period == "" {
		return NewValidationError("period is required")
	}
	
	return nil
}

// Validate checks if the disposal entry is valid
func (fad *FixedAssetDisposal) Validate() error {
	if fad.FixedAssetID.IsNil() {
		return NewValidationError("fixed_asset_id is required")
	}
	if fad.DisposalDate.IsZero() {
		return NewValidationError("disposal_date is required")
	}
	if fad.DisposalMethod == "" {
		return NewValidationError("disposal_method is required")
	}
	if fad.DisposalPrice < 0 {
		return NewValidationError("disposal_price cannot be negative")
	}
	if fad.Reason == "" {
		return NewValidationError("reason is required")
	}
	
	return nil
}