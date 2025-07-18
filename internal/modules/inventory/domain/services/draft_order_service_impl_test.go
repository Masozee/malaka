package services_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/shared/types"
)

// MockDraftOrderRepository is a mock implementation of DraftOrderRepository.
type MockDraftOrderRepository struct {
	mock.Mock
}

func (m *MockDraftOrderRepository) Create(ctx context.Context, draftOrder *entities.DraftOrder) error {
	args := m.Called(ctx, draftOrder)
	return args.Error(0)
}

func (m *MockDraftOrderRepository) GetByID(ctx context.Context, id string) (*entities.DraftOrder, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.DraftOrder), args.Error(1)
}

func (m *MockDraftOrderRepository) Update(ctx context.Context, draftOrder *entities.DraftOrder) error {
	args := m.Called(ctx, draftOrder)
	return args.Error(0)
}

func (m *MockDraftOrderRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockDraftOrderRepository) GetAll(ctx context.Context) ([]*entities.DraftOrder, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.DraftOrder), args.Error(1)
}

func TestDraftOrderService(t *testing.T) {
	mockRepo := new(MockDraftOrderRepository)
	service := services.NewDraftOrderService(mockRepo)

	t.Run("CreateDraftOrder - Success", func(t *testing.T) {
		draftOrder := &entities.DraftOrder{SupplierID: uuid.New().String(), Status: "draft"}
		mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*entities.DraftOrder")).Return(nil).Once()
		err := service.CreateDraftOrder(context.Background(), draftOrder)
		assert.NoError(t, err)
		assert.NotEmpty(t, draftOrder.ID)
		mockRepo.AssertExpectations(t)
	})

	t.Run("CreateDraftOrder - Repository Error", func(t *testing.T) {
		draftOrder := &entities.DraftOrder{SupplierID: uuid.New().String(), Status: "draft"}
		mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*entities.DraftOrder")).Return(errors.New("db error")).Once()
		err := service.CreateDraftOrder(context.Background(), draftOrder)
		assert.Error(t, err)
		assert.EqualError(t, err, "db error")
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetDraftOrderByID - Found", func(t *testing.T) {
		id := uuid.New()
		expectedDraftOrder := &entities.DraftOrder{BaseModel: types.BaseModel{ID: id.String()}, SupplierID: uuid.New().String()}
		mockRepo.On("GetByID", mock.Anything, id.String()).Return(expectedDraftOrder, nil).Once()
		foundDraftOrder, err := service.GetDraftOrderByID(context.Background(), id.String())
		assert.NoError(t, err)
		assert.Equal(t, expectedDraftOrder, foundDraftOrder)
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetDraftOrderByID - Not Found", func(t *testing.T) {
		id := uuid.New()
		mockRepo.On("GetByID", mock.Anything, id.String()).Return(nil, errors.New("not found")).Once()
		foundDraftOrder, err := service.GetDraftOrderByID(context.Background(), id.String())
		assert.Error(t, err)
		assert.Nil(t, foundDraftOrder)
		assert.EqualError(t, err, "not found")
		mockRepo.AssertExpectations(t)
	})

	t.Run("UpdateDraftOrder - Success", func(t *testing.T) {
		draftOrder := &entities.DraftOrder{BaseModel: types.BaseModel{ID: uuid.New().String()}, SupplierID: uuid.New().String(), Status: "approved"}
		mockRepo.On("GetByID", mock.Anything, draftOrder.ID).Return(draftOrder, nil).Once()
		mockRepo.On("Update", mock.Anything, draftOrder).Return(nil).Once()
		err := service.UpdateDraftOrder(context.Background(), draftOrder)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("UpdateDraftOrder - Not Found", func(t *testing.T) {
		draftOrder := &entities.DraftOrder{BaseModel: types.BaseModel{ID: uuid.New().String()}, SupplierID: uuid.New().String()}
		mockRepo.On("GetByID", mock.Anything, draftOrder.ID).Return(nil, errors.New("not found")).Once()
		err := service.UpdateDraftOrder(context.Background(), draftOrder)
		assert.Error(t, err)
		assert.EqualError(t, err, "not found")
		mockRepo.AssertExpectations(t)
	})

	t.Run("DeleteDraftOrder - Success", func(t *testing.T) {
		id := uuid.New()
		existingDraftOrder := &entities.DraftOrder{BaseModel: types.BaseModel{ID: id.String()}}
		mockRepo.On("GetByID", mock.Anything, id.String()).Return(existingDraftOrder, nil).Once()
		mockRepo.On("Delete", mock.Anything, id.String()).Return(nil).Once()
		err := service.DeleteDraftOrder(context.Background(), id.String())
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("DeleteDraftOrder - Not Found", func(t *testing.T) {
		id := uuid.New()
		mockRepo.On("GetByID", mock.Anything, id.String()).Return(nil, errors.New("not found")).Once()
		err := service.DeleteDraftOrder(context.Background(), id.String())
		assert.Error(t, err)
		assert.EqualError(t, err, "not found")
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetAllDraftOrders - Success", func(t *testing.T) {
		expectedDraftOrders := []*entities.DraftOrder{
			{BaseModel: types.BaseModel{ID: uuid.New().String()}, SupplierID: uuid.New().String()},
			{BaseModel: types.BaseModel{ID: uuid.New().String()}, SupplierID: uuid.New().String()},
		}
		mockRepo.On("GetAll", mock.Anything).Return(expectedDraftOrders, nil).Once()
		foundDraftOrders, err := service.GetAllDraftOrders(context.Background())
		assert.NoError(t, err)
		assert.Equal(t, expectedDraftOrders, foundDraftOrders)
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetAllDraftOrders - Repository Error", func(t *testing.T) {
		mockRepo.On("GetAll", mock.Anything).Return(nil, errors.New("db error")).Once()
		foundDraftOrders, err := service.GetAllDraftOrders(context.Background())
		assert.Error(t, err)
		assert.Nil(t, foundDraftOrders)
		assert.EqualError(t, err, "db error")
		mockRepo.AssertExpectations(t)
	})
}
