package services

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
)

func TestProsesMarginService_CreateProsesMargin(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()
	prosesMargin := &entities.ProsesMargin{SalesOrderID: "so123"}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*entities.ProsesMargin")).Return(nil)

	err := service.CreateProsesMargin(ctx, prosesMargin)
	assert.NoError(t, err)
	assert.NotEmpty(t, prosesMargin.ID)
	mockRepo.AssertExpectations(t)
}

func TestProsesMarginService_GetProsesMarginByID(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()
	expectedPM := &entities.ProsesMargin{ID: "pm123", SalesOrderID: "so123"}

	mockRepo.On("GetByID", ctx, "pm123").Return(expectedPM, nil)

	pm, err := service.GetProsesMarginByID(ctx, "pm123")
	assert.NoError(t, err)
	assert.Equal(t, expectedPM, pm)
	mockRepo.AssertExpectations(t)
}

func TestProsesMarginService_GetAllProsesMargins(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()
	expectedPMs := []*entities.ProsesMargin{{ID: "pm123"}, {ID: "pm124"}}

	mockRepo.On("GetAll", ctx).Return(expectedPMs, nil)

	pms, err := service.GetAllProsesMargins(ctx)
	assert.NoError(t, err)
	assert.Equal(t, expectedPMs, pms)
	mockRepo.AssertExpectations(t)
}

func TestProsesMarginService_UpdateProsesMargin(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()
	prosesMargin := &entities.ProsesMargin{ID: "pm123", MarginAmount: 75.00}

	mockRepo.On("GetByID", ctx, "pm123").Return(prosesMargin, nil)
	mockRepo.On("Update", ctx, prosesMargin).Return(nil)

	err := service.UpdateProsesMargin(ctx, prosesMargin)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestProsesMarginService_UpdateProsesMargin_NotFound(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()
	prosesMargin := &entities.ProsesMargin{ID: "pm123", MarginAmount: 75.00}

	mockRepo.On("GetByID", ctx, "pm123").Return(nil, nil)

	err := service.UpdateProsesMargin(ctx, prosesMargin)
	assert.Error(t, err)
	assert.EqualError(t, err, "proses margin entry not found")
	mockRepo.AssertExpectations(t)
}

func TestProsesMarginService_DeleteProsesMargin(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()
	prosesMargin := &entities.ProsesMargin{ID: "pm123"}

	mockRepo.On("GetByID", ctx, "pm123").Return(prosesMargin, nil)
	mockRepo.On("Delete", ctx, "pm123").Return(nil)

	err := service.DeleteProsesMargin(ctx, "pm123")
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestProsesMarginService_DeleteProsesMargin_NotFound(t *testing.T) {
	mockRepo := new(repositories.MockProsesMarginRepository)
	service := NewProsesMarginService(mockRepo)
	ctx := context.Background()

	mockRepo.On("GetByID", ctx, "pm123").Return(nil, nil)

	err := service.DeleteProsesMargin(ctx, "pm123")
	assert.Error(t, err)
	assert.EqualError(t, err, "proses margin entry not found")
	mockRepo.AssertExpectations(t)
}
