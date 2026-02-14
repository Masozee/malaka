package services

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/accounting/domain/entities"

)

// MockChartOfAccountRepository is a mock implementation of repositories.ChartOfAccountRepository
type MockChartOfAccountRepository struct {
	mock.Mock
}

func (m *MockChartOfAccountRepository) Create(ctx context.Context, coa *entities.ChartOfAccount) error {
	args := m.Called(ctx, coa)
	return args.Error(0)
}

func (m *MockChartOfAccountRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.ChartOfAccount, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.ChartOfAccount), args.Error(1)
}

func (m *MockChartOfAccountRepository) GetByCode(ctx context.Context, companyID string, code string) (*entities.ChartOfAccount, error) {
	args := m.Called(ctx, companyID, code)
	return args.Get(0).(*entities.ChartOfAccount), args.Error(1)
}

func (m *MockChartOfAccountRepository) GetAll(ctx context.Context, companyID string) ([]*entities.ChartOfAccount, error) {
	args := m.Called(ctx, companyID)
	return args.Get(0).([]*entities.ChartOfAccount), args.Error(1)
}

func (m *MockChartOfAccountRepository) Update(ctx context.Context, coa *entities.ChartOfAccount) error {
	args := m.Called(ctx, coa)
	return args.Error(0)
}

func (m *MockChartOfAccountRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestChartOfAccountService_CreateChartOfAccount(t *testing.T) {
	mockRepo := new(MockChartOfAccountRepository)
	service := NewChartOfAccountService(mockRepo)
	ctx := context.Background()

	coa := &entities.ChartOfAccount{
		ID:          uuid.New(),
		CompanyID:   "default",
		AccountCode: "101",
		AccountName: "Cash",
	}

	// Test case 1: Successful creation
	mockRepo.On("GetByCode", ctx, coa.CompanyID, coa.AccountCode).Return((*entities.ChartOfAccount)(nil), nil).Once()
	mockRepo.On("Create", ctx, coa).Return(nil).Once()
	err := service.CreateChartOfAccount(ctx, coa)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)

	// Test case 2: Empty account code
	coa.AccountCode = ""
	err = service.CreateChartOfAccount(ctx, coa)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "account code cannot be empty")

	// Test case 3: Account code already exists
	coa.AccountCode = "101"
	mockRepo.On("GetByCode", ctx, coa.CompanyID, coa.AccountCode).Return(coa, nil).Once()
	err = service.CreateChartOfAccount(ctx, coa)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "already exists")
	mockRepo.AssertExpectations(t)
}

func TestChartOfAccountService_GetChartOfAccountByID(t *testing.T) {
	mockRepo := new(MockChartOfAccountRepository)
	service := NewChartOfAccountService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	expectedCoa := &entities.ChartOfAccount{ID: id, CompanyID: "default", AccountCode: "101"}

	// Test case 1: Successful retrieval
	mockRepo.On("GetByID", ctx, id).Return(expectedCoa, nil).Once()
	coa, err := service.GetChartOfAccountByID(ctx, id)
	assert.NoError(t, err)
	assert.Equal(t, expectedCoa, coa)
	mockRepo.AssertExpectations(t)

	// Test case 2: Not found
	mockRepo.On("GetByID", ctx, id).Return((*entities.ChartOfAccount)(nil), nil).Once()
	coa, err = service.GetChartOfAccountByID(ctx, id)
	assert.NoError(t, err)
	assert.Nil(t, coa)
	mockRepo.AssertExpectations(t)
}

func TestChartOfAccountService_GetChartOfAccountByCode(t *testing.T) {
	mockRepo := new(MockChartOfAccountRepository)
	service := NewChartOfAccountService(mockRepo)
	ctx := context.Background()

	companyID := "default"
	code := "101"
	expectedCoa := &entities.ChartOfAccount{ID: uuid.New(), CompanyID: companyID, AccountCode: code}

	// Test case 1: Successful retrieval
	mockRepo.On("GetByCode", ctx, companyID, code).Return(expectedCoa, nil).Once()
	coa, err := service.GetChartOfAccountByCode(ctx, companyID, code)
	assert.NoError(t, err)
	assert.Equal(t, expectedCoa, coa)
	mockRepo.AssertExpectations(t)

	// Test case 2: Not found
	mockRepo.On("GetByCode", ctx, companyID, code).Return((*entities.ChartOfAccount)(nil), nil).Once()
	coa, err = service.GetChartOfAccountByCode(ctx, companyID, code)
	assert.NoError(t, err)
	assert.Nil(t, coa)
	mockRepo.AssertExpectations(t)
}

func TestChartOfAccountService_GetAllChartOfAccounts(t *testing.T) {
	mockRepo := new(MockChartOfAccountRepository)
	service := NewChartOfAccountService(mockRepo)
	ctx := context.Background()

	companyID := "default"
	expectedCoas := []*entities.ChartOfAccount{
		{ID: uuid.New(), CompanyID: companyID, AccountCode: "101"},
		{ID: uuid.New(), CompanyID: companyID, AccountCode: "102"},
	}

	// Test case 1: Successful retrieval
	mockRepo.On("GetAll", ctx, companyID).Return(expectedCoas, nil).Once()
	coas, err := service.GetAllChartOfAccounts(ctx, companyID)
	assert.NoError(t, err)
	assert.Equal(t, expectedCoas, coas)
	mockRepo.AssertExpectations(t)

	// Test case 2: Error from repository
	mockRepo.On("GetAll", ctx, companyID).Return([]*entities.ChartOfAccount{}, errors.New("database error")).Once()
	coas, err = service.GetAllChartOfAccounts(ctx, companyID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "database error")
	mockRepo.AssertExpectations(t)
}

func TestChartOfAccountService_UpdateChartOfAccount(t *testing.T) {
	ctx := context.Background()

	t.Run("Successful update", func(t *testing.T) {
		mockRepo := new(MockChartOfAccountRepository)
		service := NewChartOfAccountService(mockRepo)

		coa := &entities.ChartOfAccount{
			ID:          uuid.New(),
			CompanyID:   "default",
			AccountCode: "101",
			AccountName: "Cash",
		}

		mockRepo.On("GetByID", ctx, coa.ID).Return(coa, nil).Once()
		mockRepo.On("Update", ctx, coa).Return(nil).Once()

		err := service.UpdateChartOfAccount(ctx, coa)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Empty account code", func(t *testing.T) {
		mockRepo := new(MockChartOfAccountRepository)
		service := NewChartOfAccountService(mockRepo)

		coa := &entities.ChartOfAccount{
			ID:          uuid.New(),
			CompanyID:   "default",
			AccountCode: "",
			AccountName: "Cash",
		}

		err := service.UpdateChartOfAccount(ctx, coa)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "account code cannot be empty")
		mockRepo.AssertExpectations(t)
	})

	t.Run("COA not found", func(t *testing.T) {
		mockRepo := new(MockChartOfAccountRepository)
		service := NewChartOfAccountService(mockRepo)

		coa := &entities.ChartOfAccount{
			ID:          uuid.New(),
			CompanyID:   "default",
			AccountCode: "101",
			AccountName: "Cash",
		}

		mockRepo.On("GetByID", ctx, coa.ID).Return((*entities.ChartOfAccount)(nil), nil).Once()

		err := service.UpdateChartOfAccount(ctx, coa)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not found")
		mockRepo.AssertExpectations(t)
	})

	t.Run("Account code conflict", func(t *testing.T) {
		mockRepo := new(MockChartOfAccountRepository)
		service := NewChartOfAccountService(mockRepo)

		originalCoa := &entities.ChartOfAccount{
			ID:          uuid.New(),
			CompanyID:   "default",
			AccountCode: "101",
			AccountName: "Original Cash",
		}
		conflictingCoa := &entities.ChartOfAccount{
			ID:          uuid.New(),
			CompanyID:   "default",
			AccountCode: "102",
			AccountName: "Conflicting Cash",
		}

		updatedCoa := &entities.ChartOfAccount{
			ID:          originalCoa.ID,
			CompanyID:   "default",
			AccountCode: "102",
			AccountName: "Updated Cash",
		}

		mockRepo.On("GetByID", ctx, originalCoa.ID).Return(originalCoa, nil).Once()
		mockRepo.On("GetByCode", ctx, updatedCoa.CompanyID, updatedCoa.AccountCode).Return(conflictingCoa, nil).Once()

		err := service.UpdateChartOfAccount(ctx, updatedCoa)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "already exists")
		mockRepo.AssertExpectations(t)
	})
}

func TestChartOfAccountService_DeleteChartOfAccount(t *testing.T) {
	mockRepo := new(MockChartOfAccountRepository)
	service := NewChartOfAccountService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	existingCoa := &entities.ChartOfAccount{ID: id, CompanyID: "default", AccountCode: "101"}

	// Test case 1: Successful deletion
	mockRepo.On("GetByID", ctx, id).Return(existingCoa, nil).Once()
	mockRepo.On("Delete", ctx, id).Return(nil).Once()
	err := service.DeleteChartOfAccount(ctx, id)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)

	// Test case 2: COA not found
	mockRepo.On("GetByID", ctx, id).Return((*entities.ChartOfAccount)(nil), nil).Once()
	err = service.DeleteChartOfAccount(ctx, id)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}
