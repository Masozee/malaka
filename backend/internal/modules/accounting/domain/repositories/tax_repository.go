package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// TaxRepository defines methods for tax operations
type TaxRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, tax *entities.Tax) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Tax, error)
	GetAll(ctx context.Context) ([]*entities.Tax, error)
	Update(ctx context.Context, tax *entities.Tax) error
	Delete(ctx context.Context, id uuid.ID) error

	// Tax transaction operations
	CreateTransaction(ctx context.Context, transaction *entities.TaxTransaction) error
	GetTransactionByID(ctx context.Context, id uuid.ID) (*entities.TaxTransaction, error)
	GetTransactionsByTax(ctx context.Context, taxID uuid.ID) ([]*entities.TaxTransaction, error)
	UpdateTransaction(ctx context.Context, transaction *entities.TaxTransaction) error
	DeleteTransaction(ctx context.Context, id uuid.ID) error

	// Tax return operations
	CreateReturn(ctx context.Context, taxReturn *entities.TaxReturn) error
	GetReturnByID(ctx context.Context, id uuid.ID) (*entities.TaxReturn, error)
	GetReturnsByCompany(ctx context.Context, companyID string) ([]*entities.TaxReturn, error)
	UpdateReturn(ctx context.Context, taxReturn *entities.TaxReturn) error
	DeleteReturn(ctx context.Context, id uuid.ID) error

	// Query operations
	GetByCode(ctx context.Context, taxCode string) (*entities.Tax, error)
	GetByType(ctx context.Context, taxType entities.TaxType) ([]*entities.Tax, error)
	GetActiveTaxes(ctx context.Context, companyID string, date time.Time) ([]*entities.Tax, error)
	GetTaxByTypeAndCompany(ctx context.Context, companyID string, taxType entities.TaxType) ([]*entities.Tax, error)
	
	// Company-specific operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.Tax, error)
	GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.Tax, error)
	
	// Transaction queries
	GetTransactionsByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TaxTransaction, error)
	GetTransactionsByType(ctx context.Context, companyID string, transactionType string) ([]*entities.TaxTransaction, error)
	GetTransactionsByReference(ctx context.Context, referenceType, referenceID string) ([]*entities.TaxTransaction, error)
	GetTransactionsByCustomer(ctx context.Context, customerID string) ([]*entities.TaxTransaction, error)
	GetTransactionsBySupplier(ctx context.Context, supplierID string) ([]*entities.TaxTransaction, error)
	
	// Tax return queries
	GetReturnByNumber(ctx context.Context, returnNumber string) (*entities.TaxReturn, error)
	GetReturnsByType(ctx context.Context, companyID string, taxType entities.TaxType) ([]*entities.TaxReturn, error)
	GetReturnsByStatus(ctx context.Context, companyID string, status entities.TaxStatus) ([]*entities.TaxReturn, error)
	GetReturnsByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TaxReturn, error)
	GetOverdueReturns(ctx context.Context, companyID string) ([]*entities.TaxReturn, error)
	GetDueReturns(ctx context.Context, companyID string, dueDate time.Time) ([]*entities.TaxReturn, error)
	
	// Tax calculation operations
	CalculateTax(ctx context.Context, taxID uuid.ID, baseAmount float64) (float64, error)
	GetApplicableTaxes(ctx context.Context, companyID string, transactionType string, date time.Time) ([]*entities.Tax, error)
	
	// Tax return management
	SubmitReturn(ctx context.Context, returnID uuid.ID, userID string) error
	PayReturn(ctx context.Context, returnID uuid.ID, paymentAmount float64) error
	GenerateReturn(ctx context.Context, companyID string, taxType entities.TaxType, periodStart, periodEnd time.Time) (*entities.TaxReturn, error)
	
	// Reporting operations
	GetTaxReport(ctx context.Context, companyID string, taxType entities.TaxType, startDate, endDate time.Time) (*entities.TaxReport, error)
	GetTaxLiabilityReport(ctx context.Context, companyID string, asOfDate time.Time) (map[entities.TaxType]float64, error)
	GetTaxComplianceReport(ctx context.Context, companyID string, year int) (map[string]interface{}, error)
	GetVATReport(ctx context.Context, companyID string, startDate, endDate time.Time) (map[string]float64, error)
	GetWithholdingTaxReport(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TaxTransaction, error)
	
	// Batch operations
	CreateTransactionBatch(ctx context.Context, transactions []*entities.TaxTransaction) error
	UpdateReturnTotals(ctx context.Context, returnID uuid.ID) error
	ProcessPeriodicReturns(ctx context.Context, companyID string, period time.Time) error
	
	// Integration operations
	SyncWithExternalSystem(ctx context.Context, companyID string) error
	ValidateReturnData(ctx context.Context, returnID uuid.ID) ([]string, error)
	
	// Historical operations
	GetTaxHistory(ctx context.Context, companyID string, taxType entities.TaxType) ([]*entities.TaxReturn, error)
	GetTaxTrends(ctx context.Context, companyID string, taxType entities.TaxType, periods int) ([]float64, error)
}