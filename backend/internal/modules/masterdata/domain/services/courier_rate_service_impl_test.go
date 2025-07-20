package services

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/masterdata/domain/entities"
)



type MockCourierRateRepository struct {
	mock.Mock
}

func (m *MockCourierRateRepository) Create(ctx context.Context, courierRate *entities.CourierRate) error {
	args := m.Called(ctx, courierRate)
	return args.Error(0)
}

func (m *MockCourierRateRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.CourierRate, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.CourierRate), args.Error(1)
}

func (m *MockCourierRateRepository) Update(ctx context.Context, courierRate *entities.CourierRate) error {
	args := m.Called(ctx, courierRate)
	return args.Error(0)
}

func (m *MockCourierRateRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestCourierRateService(t *testing.T) {
	
	mockRepo := new(MockCourierRateRepository)
	service := NewCourierRateService(mockRepo)

	t.Run("CreateCourierRate", func(t *testing.T) {
		courierRate := &entities.CourierRate{}
		mockRepo.On("Create", context.Background(), courierRate).Return(nil)
		err := service.CreateCourierRate(context.Background(), courierRate)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetCourierRateByID", func(t *testing.T) {
		id := uuid.New()
		courierRate := &entities.CourierRate{ID: id}
		mockRepo.On("GetByID", context.Background(), id).Return(courierRate, nil)
		result, err := service.GetCourierRateByID(context.Background(), id)
		assert.NoError(t, err)
		assert.Equal(t, courierRate, result)
		mockRepo.AssertExpectations(t)
	})

	t.Run("UpdateCourierRate", func(t *testing.T) {
		courierRate := &entities.CourierRate{}
		mockRepo.On("Update", context.Background(), courierRate).Return(nil)
		err := service.UpdateCourierRate(context.Background(), courierRate)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("DeleteCourierRate", func(t *testing.T) {
		id := uuid.New()
		mockRepo.On("Delete", context.Background(), id).Return(nil)
		err := service.DeleteCourierRate(context.Background(), id)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})
}
