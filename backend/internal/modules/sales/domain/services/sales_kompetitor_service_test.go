package services

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
)

func TestSalesKompetitorService_CreateSalesKompetitor(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()
	salesKompetitor := &entities.SalesKompetitor{CompetitorName: "Test Competitor"}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*entities.SalesKompetitor")).Return(nil)

	err := service.CreateSalesKompetitor(ctx, salesKompetitor)
	assert.NoError(t, err)
	assert.NotEmpty(t, salesKompetitor.ID)
	mockRepo.AssertExpectations(t)
}

func TestSalesKompetitorService_GetSalesKompetitorByID(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()
	expectedSK := &entities.SalesKompetitor{ID: "sk123", CompetitorName: "Test Competitor"}

	mockRepo.On("GetByID", ctx, "sk123").Return(expectedSK, nil)

	sk, err := service.GetSalesKompetitorByID(ctx, "sk123")
	assert.NoError(t, err)
	assert.Equal(t, expectedSK, sk)
	mockRepo.AssertExpectations(t)
}

func TestSalesKompetitorService_GetAllSalesKompetitors(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()
	expectedSKs := []*entities.SalesKompetitor{{ID: "sk123"}, {ID: "sk124"}}

	mockRepo.On("GetAll", ctx).Return(expectedSKs, nil)

	sks, err := service.GetAllSalesKompetitors(ctx)
	assert.NoError(t, err)
	assert.Equal(t, expectedSKs, sks)
	mockRepo.AssertExpectations(t)
}

func TestSalesKompetitorService_UpdateSalesKompetitor(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()
	salesKompetitor := &entities.SalesKompetitor{ID: "sk123", CompetitorName: "Updated Competitor"}

	mockRepo.On("GetByID", ctx, "sk123").Return(salesKompetitor, nil)
	mockRepo.On("Update", ctx, salesKompetitor).Return(nil)

	err := service.UpdateSalesKompetitor(ctx, salesKompetitor)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSalesKompetitorService_UpdateSalesKompetitor_NotFound(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()
	salesKompetitor := &entities.SalesKompetitor{ID: "sk123", CompetitorName: "Updated Competitor"}

	mockRepo.On("GetByID", ctx, "sk123").Return(nil, nil)

	err := service.UpdateSalesKompetitor(ctx, salesKompetitor)
	assert.Error(t, err)
	assert.EqualError(t, err, "sales competitor entry not found")
	mockRepo.AssertExpectations(t)
}

func TestSalesKompetitorService_DeleteSalesKompetitor(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()
	salesKompetitor := &entities.SalesKompetitor{ID: "sk123"}

	mockRepo.On("GetByID", ctx, "sk123").Return(salesKompetitor, nil)
	mockRepo.On("Delete", ctx, "sk123").Return(nil)

	err := service.DeleteSalesKompetitor(ctx, "sk123")
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSalesKompetitorService_DeleteSalesKompetitor_NotFound(t *testing.T) {
	mockRepo := new(repositories.MockSalesKompetitorRepository)
	service := NewSalesKompetitorService(mockRepo)
	ctx := context.Background()

	mockRepo.On("GetByID", ctx, "sk123").Return(nil, nil)

	err := service.DeleteSalesKompetitor(ctx, "sk123")
	assert.Error(t, err)
	assert.EqualError(t, err, "sales competitor entry not found")
	mockRepo.AssertExpectations(t)
}
