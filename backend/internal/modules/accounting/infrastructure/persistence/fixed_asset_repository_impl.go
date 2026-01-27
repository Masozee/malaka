package persistence

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// fixedAssetRepository implements FixedAssetRepository
type fixedAssetRepository struct {
	db *sqlx.DB
}

// NewFixedAssetRepository creates a new fixed asset repository
func NewFixedAssetRepository(db *sqlx.DB) repositories.FixedAssetRepository {
	return &fixedAssetRepository{db: db}
}

// Create creates a new fixed asset
func (r *fixedAssetRepository) Create(ctx context.Context, asset *entities.FixedAsset) error {
	query := `
		INSERT INTO fixed_assets (
			id, asset_code, asset_name, asset_category, status,
			purchase_date, purchase_price, salvage_value, useful_life,
			depreciation_method, accumulated_depreciation, book_value,
			last_depreciation_date, location_id, department_id,
			responsible_person_id, vendor, serial_number, model_number,
			warranty_expiry, insurance_value, insurance_expiry,
			maintenance_schedule, notes, company_id, created_by,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
			$21, $22, $23, $24, $25, $26, $27, $28
		)
	`
	_, err := r.db.ExecContext(ctx, query,
		asset.ID, asset.AssetCode, asset.AssetName, asset.AssetCategory, asset.Status,
		asset.PurchaseDate, asset.PurchasePrice, asset.SalvageValue, asset.UsefulLife,
		asset.DepreciationMethod, asset.AccumulatedDepreciation, asset.BookValue,
		asset.LastDepreciationDate, asset.LocationID, asset.DepartmentID,
		asset.ResponsiblePersonID, asset.Vendor, asset.SerialNumber, asset.ModelNumber,
		asset.WarrantyExpiry, asset.InsuranceValue, asset.InsuranceExpiry,
		asset.MaintenanceSchedule, asset.Notes, asset.CompanyID, asset.CreatedBy,
		asset.CreatedAt, asset.UpdatedAt,
	)
	return err
}

// GetByID retrieves a fixed asset by ID
func (r *fixedAssetRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE id = $1
	`
	var asset entities.FixedAsset
	err := r.db.GetContext(ctx, &asset, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// GetAll retrieves all fixed assets
func (r *fixedAssetRepository) GetAll(ctx context.Context) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query)
	return assets, err
}

// Update updates a fixed asset
func (r *fixedAssetRepository) Update(ctx context.Context, asset *entities.FixedAsset) error {
	query := `
		UPDATE fixed_assets SET
			asset_name = $2, asset_category = $3, status = $4,
			purchase_date = $5, purchase_price = $6, salvage_value = $7,
			useful_life = $8, depreciation_method = $9,
			accumulated_depreciation = $10, book_value = $11,
			last_depreciation_date = $12, location_id = $13,
			department_id = $14, responsible_person_id = $15,
			vendor = $16, serial_number = $17, model_number = $18,
			warranty_expiry = $19, insurance_value = $20, insurance_expiry = $21,
			maintenance_schedule = $22, notes = $23, updated_at = $24
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		asset.ID, asset.AssetName, asset.AssetCategory, asset.Status,
		asset.PurchaseDate, asset.PurchasePrice, asset.SalvageValue,
		asset.UsefulLife, asset.DepreciationMethod,
		asset.AccumulatedDepreciation, asset.BookValue,
		asset.LastDepreciationDate, asset.LocationID,
		asset.DepartmentID, asset.ResponsiblePersonID,
		asset.Vendor, asset.SerialNumber, asset.ModelNumber,
		asset.WarrantyExpiry, asset.InsuranceValue, asset.InsuranceExpiry,
		asset.MaintenanceSchedule, asset.Notes, time.Now(),
	)
	return err
}

// Delete deletes a fixed asset
func (r *fixedAssetRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM fixed_assets WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateDepreciation creates a new depreciation entry
func (r *fixedAssetRepository) CreateDepreciation(ctx context.Context, depreciation *entities.FixedAssetDepreciation) error {
	query := `
		INSERT INTO fixed_asset_depreciations (
			id, fixed_asset_id, depreciation_date, depreciation_amount,
			accumulated_depreciation, book_value, period, journal_entry_id,
			created_by, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		depreciation.ID, depreciation.FixedAssetID, depreciation.DepreciationDate,
		depreciation.DepreciationAmount, depreciation.AccumulatedDepreciation,
		depreciation.BookValue, depreciation.Period, depreciation.JournalEntryID,
		depreciation.CreatedBy, depreciation.CreatedAt,
	)
	return err
}

// GetDepreciationByID retrieves a depreciation entry by ID
func (r *fixedAssetRepository) GetDepreciationByID(ctx context.Context, id uuid.UUID) (*entities.FixedAssetDepreciation, error) {
	query := `
		SELECT id, fixed_asset_id, depreciation_date, depreciation_amount,
			   accumulated_depreciation, book_value, period, journal_entry_id,
			   created_by, created_at
		FROM fixed_asset_depreciations
		WHERE id = $1
	`
	var depreciation entities.FixedAssetDepreciation
	err := r.db.GetContext(ctx, &depreciation, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &depreciation, nil
}

// GetDepreciationsByAsset retrieves all depreciations for an asset
func (r *fixedAssetRepository) GetDepreciationsByAsset(ctx context.Context, assetID uuid.UUID) ([]*entities.FixedAssetDepreciation, error) {
	query := `
		SELECT id, fixed_asset_id, depreciation_date, depreciation_amount,
			   accumulated_depreciation, book_value, period, journal_entry_id,
			   created_by, created_at
		FROM fixed_asset_depreciations
		WHERE fixed_asset_id = $1
		ORDER BY depreciation_date DESC
	`
	var depreciations []*entities.FixedAssetDepreciation
	err := r.db.SelectContext(ctx, &depreciations, query, assetID)
	return depreciations, err
}

// UpdateDepreciation updates a depreciation entry
func (r *fixedAssetRepository) UpdateDepreciation(ctx context.Context, depreciation *entities.FixedAssetDepreciation) error {
	query := `
		UPDATE fixed_asset_depreciations SET
			depreciation_date = $2, depreciation_amount = $3,
			accumulated_depreciation = $4, book_value = $5,
			period = $6, journal_entry_id = $7
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		depreciation.ID, depreciation.DepreciationDate, depreciation.DepreciationAmount,
		depreciation.AccumulatedDepreciation, depreciation.BookValue,
		depreciation.Period, depreciation.JournalEntryID,
	)
	return err
}

// DeleteDepreciation deletes a depreciation entry
func (r *fixedAssetRepository) DeleteDepreciation(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM fixed_asset_depreciations WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateDisposal creates a new disposal entry
func (r *fixedAssetRepository) CreateDisposal(ctx context.Context, disposal *entities.FixedAssetDisposal) error {
	query := `
		INSERT INTO fixed_asset_disposals (
			id, fixed_asset_id, disposal_date, disposal_method,
			disposal_price, book_value_at_disposal, gain_loss,
			reason, authorized_by, journal_entry_id, created_by, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.db.ExecContext(ctx, query,
		disposal.ID, disposal.FixedAssetID, disposal.DisposalDate,
		disposal.DisposalMethod, disposal.DisposalPrice, disposal.BookValueAtDisposal,
		disposal.GainLoss, disposal.Reason, disposal.AuthorizedBy,
		disposal.JournalEntryID, disposal.CreatedBy, disposal.CreatedAt,
	)
	return err
}

// GetDisposalByID retrieves a disposal entry by ID
func (r *fixedAssetRepository) GetDisposalByID(ctx context.Context, id uuid.UUID) (*entities.FixedAssetDisposal, error) {
	query := `
		SELECT id, fixed_asset_id, disposal_date, disposal_method,
			   disposal_price, book_value_at_disposal, gain_loss,
			   COALESCE(reason, '') as reason, COALESCE(authorized_by, '') as authorized_by,
			   journal_entry_id, created_by, created_at
		FROM fixed_asset_disposals
		WHERE id = $1
	`
	var disposal entities.FixedAssetDisposal
	err := r.db.GetContext(ctx, &disposal, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &disposal, nil
}

// GetDisposalByAsset retrieves the disposal for an asset
func (r *fixedAssetRepository) GetDisposalByAsset(ctx context.Context, assetID uuid.UUID) (*entities.FixedAssetDisposal, error) {
	query := `
		SELECT id, fixed_asset_id, disposal_date, disposal_method,
			   disposal_price, book_value_at_disposal, gain_loss,
			   COALESCE(reason, '') as reason, COALESCE(authorized_by, '') as authorized_by,
			   journal_entry_id, created_by, created_at
		FROM fixed_asset_disposals
		WHERE fixed_asset_id = $1
	`
	var disposal entities.FixedAssetDisposal
	err := r.db.GetContext(ctx, &disposal, query, assetID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &disposal, nil
}

// UpdateDisposal updates a disposal entry
func (r *fixedAssetRepository) UpdateDisposal(ctx context.Context, disposal *entities.FixedAssetDisposal) error {
	query := `
		UPDATE fixed_asset_disposals SET
			disposal_date = $2, disposal_method = $3,
			disposal_price = $4, book_value_at_disposal = $5,
			gain_loss = $6, reason = $7, authorized_by = $8,
			journal_entry_id = $9
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		disposal.ID, disposal.DisposalDate, disposal.DisposalMethod,
		disposal.DisposalPrice, disposal.BookValueAtDisposal,
		disposal.GainLoss, disposal.Reason, disposal.AuthorizedBy,
		disposal.JournalEntryID,
	)
	return err
}

// DeleteDisposal deletes a disposal entry
func (r *fixedAssetRepository) DeleteDisposal(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM fixed_asset_disposals WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByCode retrieves an asset by code
func (r *fixedAssetRepository) GetByCode(ctx context.Context, assetCode string) (*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE asset_code = $1
	`
	var asset entities.FixedAsset
	err := r.db.GetContext(ctx, &asset, query, assetCode)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// GetByCategory retrieves assets by category
func (r *fixedAssetRepository) GetByCategory(ctx context.Context, category string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE asset_category = $1
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, category)
	return assets, err
}

// GetByStatus retrieves assets by status
func (r *fixedAssetRepository) GetByStatus(ctx context.Context, status entities.FixedAssetStatus) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE status = $1
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, status)
	return assets, err
}

// GetByLocation retrieves assets by location
func (r *fixedAssetRepository) GetByLocation(ctx context.Context, locationID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE location_id = $1
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, locationID)
	return assets, err
}

// GetByDepartment retrieves assets by department
func (r *fixedAssetRepository) GetByDepartment(ctx context.Context, departmentID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE department_id = $1
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, departmentID)
	return assets, err
}

// GetByResponsiblePerson retrieves assets by responsible person
func (r *fixedAssetRepository) GetByResponsiblePerson(ctx context.Context, personID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE responsible_person_id = $1
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, personID)
	return assets, err
}

// GetBySerialNumber retrieves an asset by serial number
func (r *fixedAssetRepository) GetBySerialNumber(ctx context.Context, serialNumber string) (*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE serial_number = $1
	`
	var asset entities.FixedAsset
	err := r.db.GetContext(ctx, &asset, query, serialNumber)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// GetByCompanyID retrieves assets by company
func (r *fixedAssetRepository) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID)
	return assets, err
}

// GetActiveByCompany retrieves active assets by company
func (r *fixedAssetRepository) GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1 AND status = 'ACTIVE'
		ORDER BY created_at DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID)
	return assets, err
}

// GetAssetsNeedingDepreciation retrieves assets needing depreciation
func (r *fixedAssetRepository) GetAssetsNeedingDepreciation(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND status = 'ACTIVE'
		  AND book_value > salvage_value
		  AND (last_depreciation_date IS NULL OR last_depreciation_date < $2)
		ORDER BY asset_code
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID, asOfDate)
	return assets, err
}

// ProcessMonthlyDepreciation processes monthly depreciation (stub - actual logic in service)
func (r *fixedAssetRepository) ProcessMonthlyDepreciation(ctx context.Context, companyID string, month time.Time) error {
	// This would be implemented in the service layer
	return nil
}

// GetDepreciationSchedule retrieves depreciation schedule for an asset
func (r *fixedAssetRepository) GetDepreciationSchedule(ctx context.Context, assetID uuid.UUID) ([]*entities.FixedAssetDepreciation, error) {
	return r.GetDepreciationsByAsset(ctx, assetID)
}

// GetDepreciationByPeriod retrieves depreciations by period
func (r *fixedAssetRepository) GetDepreciationByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAssetDepreciation, error) {
	query := `
		SELECT d.id, d.fixed_asset_id, d.depreciation_date, d.depreciation_amount,
			   d.accumulated_depreciation, d.book_value, d.period, d.journal_entry_id,
			   d.created_by, d.created_at
		FROM fixed_asset_depreciations d
		JOIN fixed_assets a ON d.fixed_asset_id = a.id
		WHERE a.company_id = $1
		  AND d.depreciation_date >= $2
		  AND d.depreciation_date <= $3
		ORDER BY d.depreciation_date DESC
	`
	var depreciations []*entities.FixedAssetDepreciation
	err := r.db.SelectContext(ctx, &depreciations, query, companyID, startDate, endDate)
	return depreciations, err
}

// GetAssetRegister retrieves asset register
func (r *fixedAssetRepository) GetAssetRegister(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.FixedAsset, error) {
	return r.GetByCompanyID(ctx, companyID)
}

// GetBookValues retrieves book values for assets
func (r *fixedAssetRepository) GetBookValues(ctx context.Context, companyID string, asOfDate time.Time) (map[uuid.UUID]float64, error) {
	query := `
		SELECT id, book_value
		FROM fixed_assets
		WHERE company_id = $1
	`
	var results []struct {
		ID        uuid.UUID `db:"id"`
		BookValue float64   `db:"book_value"`
	}
	err := r.db.SelectContext(ctx, &results, query, companyID)
	if err != nil {
		return nil, err
	}
	bookValues := make(map[uuid.UUID]float64)
	for _, r := range results {
		bookValues[r.ID] = r.BookValue
	}
	return bookValues, nil
}

// GetTotalBookValue retrieves total book value
func (r *fixedAssetRepository) GetTotalBookValue(ctx context.Context, companyID string, asOfDate time.Time) (float64, error) {
	query := `
		SELECT COALESCE(SUM(book_value), 0)
		FROM fixed_assets
		WHERE company_id = $1 AND status = 'ACTIVE'
	`
	var total float64
	err := r.db.GetContext(ctx, &total, query, companyID)
	return total, err
}

// GetAssetsWithExpiredWarranty retrieves assets with expired warranty
func (r *fixedAssetRepository) GetAssetsWithExpiredWarranty(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND warranty_expiry IS NOT NULL
		  AND warranty_expiry < CURRENT_DATE
		  AND status = 'ACTIVE'
		ORDER BY warranty_expiry
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID)
	return assets, err
}

// GetAssetsWithExpiredInsurance retrieves assets with expired insurance
func (r *fixedAssetRepository) GetAssetsWithExpiredInsurance(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND insurance_expiry IS NOT NULL
		  AND insurance_expiry < CURRENT_DATE
		  AND status = 'ACTIVE'
		ORDER BY insurance_expiry
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID)
	return assets, err
}

// GetMaintenanceSchedule retrieves maintenance schedule
func (r *fixedAssetRepository) GetMaintenanceSchedule(ctx context.Context, companyID string, fromDate, toDate time.Time) ([]*entities.FixedAsset, error) {
	// Simple implementation - returns all active assets with maintenance schedule
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND maintenance_schedule IS NOT NULL
		  AND maintenance_schedule != ''
		  AND status = 'ACTIVE'
		ORDER BY asset_name
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID)
	return assets, err
}

// GetDepreciationReport retrieves depreciation report
func (r *fixedAssetRepository) GetDepreciationReport(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAssetDepreciation, error) {
	return r.GetDepreciationByPeriod(ctx, companyID, startDate, endDate)
}

// GetAssetAgeAnalysis retrieves asset age analysis
func (r *fixedAssetRepository) GetAssetAgeAnalysis(ctx context.Context, companyID string) (map[string]int, error) {
	query := `
		SELECT
			CASE
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)) < 1 THEN '< 1 year'
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)) < 3 THEN '1-3 years'
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)) < 5 THEN '3-5 years'
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)) < 10 THEN '5-10 years'
				ELSE '> 10 years'
			END as age_group,
			COUNT(*) as count
		FROM fixed_assets
		WHERE company_id = $1 AND status = 'ACTIVE'
		GROUP BY age_group
		ORDER BY age_group
	`
	var results []struct {
		AgeGroup string `db:"age_group"`
		Count    int    `db:"count"`
	}
	err := r.db.SelectContext(ctx, &results, query, companyID)
	if err != nil {
		return nil, err
	}
	ageAnalysis := make(map[string]int)
	for _, r := range results {
		ageAnalysis[r.AgeGroup] = r.Count
	}
	return ageAnalysis, nil
}

// GetAssetUtilization retrieves asset utilization (stub)
func (r *fixedAssetRepository) GetAssetUtilization(ctx context.Context, companyID string) (map[uuid.UUID]float64, error) {
	// Simple implementation - returns 100% for all active assets
	query := `SELECT id FROM fixed_assets WHERE company_id = $1 AND status = 'ACTIVE'`
	var ids []uuid.UUID
	err := r.db.SelectContext(ctx, &ids, query, companyID)
	if err != nil {
		return nil, err
	}
	utilization := make(map[uuid.UUID]float64)
	for _, id := range ids {
		utilization[id] = 100.0
	}
	return utilization, nil
}

// GetDisposalReport retrieves disposal report
func (r *fixedAssetRepository) GetDisposalReport(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAssetDisposal, error) {
	query := `
		SELECT d.id, d.fixed_asset_id, d.disposal_date, d.disposal_method,
			   d.disposal_price, d.book_value_at_disposal, d.gain_loss,
			   COALESCE(d.reason, '') as reason, COALESCE(d.authorized_by, '') as authorized_by,
			   d.journal_entry_id, d.created_by, d.created_at
		FROM fixed_asset_disposals d
		JOIN fixed_assets a ON d.fixed_asset_id = a.id
		WHERE a.company_id = $1
		  AND d.disposal_date >= $2
		  AND d.disposal_date <= $3
		ORDER BY d.disposal_date DESC
	`
	var disposals []*entities.FixedAssetDisposal
	err := r.db.SelectContext(ctx, &disposals, query, companyID, startDate, endDate)
	return disposals, err
}

// GetAssetHistory retrieves asset history (stub)
func (r *fixedAssetRepository) GetAssetHistory(ctx context.Context, assetID uuid.UUID) (map[string]interface{}, error) {
	asset, err := r.GetByID(ctx, assetID)
	if err != nil {
		return nil, err
	}
	if asset == nil {
		return nil, nil
	}
	depreciations, _ := r.GetDepreciationsByAsset(ctx, assetID)
	disposal, _ := r.GetDisposalByAsset(ctx, assetID)

	history := map[string]interface{}{
		"asset":         asset,
		"depreciations": depreciations,
		"disposal":      disposal,
	}
	return history, nil
}

// GetFullyDepreciatedAssets retrieves fully depreciated assets
func (r *fixedAssetRepository) GetFullyDepreciatedAssets(ctx context.Context, companyID string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND book_value <= salvage_value
		  AND status = 'ACTIVE'
		ORDER BY asset_name
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID)
	return assets, err
}

// GetAssetsNearEndOfLife retrieves assets near end of useful life
func (r *fixedAssetRepository) GetAssetsNearEndOfLife(ctx context.Context, companyID string, thresholdYears float64) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND status = 'ACTIVE'
		  AND (useful_life - EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date))) <= $2
		ORDER BY (useful_life - EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)))
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID, thresholdYears)
	return assets, err
}

// CreateBatch creates multiple assets
func (r *fixedAssetRepository) CreateBatch(ctx context.Context, assets []*entities.FixedAsset) error {
	for _, asset := range assets {
		if err := r.Create(ctx, asset); err != nil {
			return err
		}
	}
	return nil
}

// UpdateBookValues updates book values for all assets
func (r *fixedAssetRepository) UpdateBookValues(ctx context.Context, companyID string, asOfDate time.Time) error {
	query := `
		UPDATE fixed_assets
		SET book_value = purchase_price - accumulated_depreciation,
			updated_at = CURRENT_TIMESTAMP
		WHERE company_id = $1
	`
	_, err := r.db.ExecContext(ctx, query, companyID)
	return err
}

// RecalculateDepreciation recalculates depreciation for an asset
func (r *fixedAssetRepository) RecalculateDepreciation(ctx context.Context, assetID uuid.UUID) error {
	// Get total depreciation from entries
	query := `
		SELECT COALESCE(SUM(depreciation_amount), 0)
		FROM fixed_asset_depreciations
		WHERE fixed_asset_id = $1
	`
	var total float64
	if err := r.db.GetContext(ctx, &total, query, assetID); err != nil {
		return err
	}

	// Update asset
	updateQuery := `
		UPDATE fixed_assets
		SET accumulated_depreciation = $2,
			book_value = purchase_price - $2,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, updateQuery, assetID, total)
	return err
}

// SearchAssets searches assets by term
func (r *fixedAssetRepository) SearchAssets(ctx context.Context, companyID string, searchTerm string) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND (asset_code ILIKE $2 OR asset_name ILIKE $2 OR serial_number ILIKE $2)
		ORDER BY asset_name
	`
	searchPattern := "%" + searchTerm + "%"
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID, searchPattern)
	return assets, err
}

// GetAssetsByDateRange retrieves assets by purchase date range
func (r *fixedAssetRepository) GetAssetsByDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.FixedAsset, error) {
	query := `
		SELECT id, asset_code, asset_name, asset_category, status,
			   purchase_date, purchase_price, salvage_value, useful_life,
			   depreciation_method, accumulated_depreciation, book_value,
			   last_depreciation_date, COALESCE(location_id, '') as location_id,
			   COALESCE(department_id, '') as department_id,
			   COALESCE(responsible_person_id, '') as responsible_person_id,
			   COALESCE(vendor, '') as vendor, COALESCE(serial_number, '') as serial_number,
			   COALESCE(model_number, '') as model_number, warranty_expiry,
			   COALESCE(insurance_value, 0) as insurance_value, insurance_expiry,
			   COALESCE(maintenance_schedule, '') as maintenance_schedule,
			   COALESCE(notes, '') as notes, company_id, created_by, created_at, updated_at
		FROM fixed_assets
		WHERE company_id = $1
		  AND purchase_date >= $2
		  AND purchase_date <= $3
		ORDER BY purchase_date DESC
	`
	var assets []*entities.FixedAsset
	err := r.db.SelectContext(ctx, &assets, query, companyID, startDate, endDate)
	return assets, err
}
