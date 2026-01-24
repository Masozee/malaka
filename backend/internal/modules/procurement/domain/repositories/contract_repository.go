package repositories

import (
	"context"

	"malaka/internal/modules/procurement/domain/entities"
)

// ContractFilter defines filter options for listing contracts.
type ContractFilter struct {
	Search       string
	Status       string
	ContractType string
	SupplierID   string
	ExpiringDays int // contracts expiring within N days
	Page         int
	Limit        int
	SortBy       string
	SortOrder    string
}

// ContractRepository defines the interface for contract data operations.
type ContractRepository interface {
	Create(ctx context.Context, contract *entities.Contract) error
	GetByID(ctx context.Context, id string) (*entities.Contract, error)
	GetAll(ctx context.Context, filter *ContractFilter) ([]*entities.Contract, int, error)
	Update(ctx context.Context, contract *entities.Contract) error
	Delete(ctx context.Context, id string) error

	// Special queries
	GetExpiring(ctx context.Context, days int) ([]*entities.Contract, error)
	GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.Contract, error)

	// Statistics
	GetStats(ctx context.Context) (*ContractStats, error)

	// Number generation
	GetNextContractNumber(ctx context.Context) (string, error)
}

// ContractStats holds statistics for contracts.
type ContractStats struct {
	Total      int     `json:"total"`
	Draft      int     `json:"draft"`
	Active     int     `json:"active"`
	Expired    int     `json:"expired"`
	Terminated int     `json:"terminated"`
	TotalValue float64 `json:"total_value"`
	Expiring   int     `json:"expiring"` // contracts expiring within 30 days
}
