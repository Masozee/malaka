package repositories

import (
	"context"

	"github.com/stretchr/testify/mock"

	"malaka/internal/modules/sales/domain/entities"
)

// MockProsesMarginRepository is a mock implementation of ProsesMarginRepository.
type MockProsesMarginRepository struct {
	mock.Mock
}

func (m *MockProsesMarginRepository) Create(ctx context.Context, pm *entities.ProsesMargin) error {
	args := m.Called(ctx, pm)
	return args.Error(0)
}

func (m *MockProsesMarginRepository) GetByID(ctx context.Context, id string) (*entities.ProsesMargin, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.ProsesMargin), args.Error(1)
}

func (m *MockProsesMarginRepository) GetAll(ctx context.Context) ([]*entities.ProsesMargin, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.ProsesMargin), args.Error(1)
}

func (m *MockProsesMarginRepository) Update(ctx context.Context, pm *entities.ProsesMargin) error {
	args := m.Called(ctx, pm)
	return args.Error(0)
}

func (m *MockProsesMarginRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// MockSalesKompetitorRepository is a mock implementation of SalesKompetitorRepository.
type MockSalesKompetitorRepository struct {
	mock.Mock
}

func (m *MockSalesKompetitorRepository) Create(ctx context.Context, sk *entities.SalesKompetitor) error {
	args := m.Called(ctx, sk)
	return args.Error(0)
}

func (m *MockSalesKompetitorRepository) GetByID(ctx context.Context, id string) (*entities.SalesKompetitor, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.SalesKompetitor), args.Error(1)
}

func (m *MockSalesKompetitorRepository) GetAll(ctx context.Context) ([]*entities.SalesKompetitor, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.SalesKompetitor), args.Error(1)
}

func (m *MockSalesKompetitorRepository) Update(ctx context.Context, sk *entities.SalesKompetitor) error {
	args := m.Called(ctx, sk)
	return args.Error(0)
}

func (m *MockSalesKompetitorRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// MockSalesRekonsiliasiRepository is a mock implementation of SalesRekonsiliasiRepository.
type MockSalesRekonsiliasiRepository struct {
	mock.Mock
}

func (m *MockSalesRekonsiliasiRepository) Create(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	args := m.Called(ctx, sr)
	return args.Error(0)
}

func (m *MockSalesRekonsiliasiRepository) GetByID(ctx context.Context, id string) (*entities.SalesRekonsiliasi, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.SalesRekonsiliasi), args.Error(1)
}

func (m *MockSalesRekonsiliasiRepository) GetAll(ctx context.Context) ([]*entities.SalesRekonsiliasi, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.SalesRekonsiliasi), args.Error(1)
}

func (m *MockSalesRekonsiliasiRepository) Update(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	args := m.Called(ctx, sr)
	return args.Error(0)
}

func (m *MockSalesRekonsiliasiRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
