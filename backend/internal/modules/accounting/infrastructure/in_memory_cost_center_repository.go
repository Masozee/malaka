package infrastructure

import (
	"context"
	"fmt"
	"malaka/internal/modules/accounting/domain"
	sync "sync"
)

// InMemoryCostCenterRepository implements CostCenterRepository for in-memory storage.
type InMemoryCostCenterRepository struct {
	mu         sync.RWMutex
	costCenters map[string]*domain.CostCenter
}

// NewInMemoryCostCenterRepository creates a new InMemoryCostCenterRepository.
func NewInMemoryCostCenterRepository() *InMemoryCostCenterRepository {
	return &InMemoryCostCenterRepository{
		costCenters: make(map[string]*domain.CostCenter),
	}
}

// Save saves a cost center.
func (r *InMemoryCostCenterRepository) Save(ctx context.Context, costCenter *domain.CostCenter) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.costCenters[costCenter.ID] = costCenter
	return nil
}

// FindByID finds a cost center by ID.
func (r *InMemoryCostCenterRepository) FindByID(ctx context.Context, id string) (*domain.CostCenter, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	costCenter, ok := r.costCenters[id]
	if !ok {
		return nil, fmt.Errorf("cost center with ID %s not found", id)
	}
	return costCenter, nil
}

// FindAll returns all cost centers.
func (r *InMemoryCostCenterRepository) FindAll(ctx context.Context) ([]*domain.CostCenter, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	costCenters := make([]*domain.CostCenter, 0, len(r.costCenters))
	for _, cc := range r.costCenters {
		costCenters = append(costCenters, cc)
	}
	return costCenters, nil
}

// Update updates an existing cost center.
func (r *InMemoryCostCenterRepository) Update(ctx context.Context, costCenter *domain.CostCenter) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.costCenters[costCenter.ID]; !ok {
		return fmt.Errorf("cost center with ID %s not found", costCenter.ID)
	}
	r.costCenters[costCenter.ID] = costCenter
	return nil
}

// Delete deletes a cost center by ID.
func (r *InMemoryCostCenterRepository) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.costCenters[id]; !ok {
		return fmt.Errorf("cost center with ID %s not found", id)
	}
	delete(r.costCenters, id)
	return nil
}
