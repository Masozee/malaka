package services

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
)

func TestSalesRekonsiliasiService_CreateSalesRekonsiliasi(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()
	salesRekonsiliasi := &entities.SalesRekonsiliasi{Status: "Pending"}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*entities.SalesRekonsiliasi")).Return(nil)

	err := service.CreateSalesRekonsiliasi(ctx, salesRekonsiliasi)
	assert.NoError(t, err)
	assert.NotEmpty(t, salesRekonsiliasi.ID)
	mockRepo.AssertExpectations(t)
}

func TestSalesRekonsiliasiService_GetSalesRekonsiliasiByID(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()
	expectedSR := &entities.SalesRekonsiliasi{ID: "sr123", Status: "Pending"}

	mockRepo.On("GetByID", ctx, "sr123").Return(expectedSR, nil)

	sr, err := service.GetSalesRekonsiliasiByID(ctx, "sr123")
	assert.NoError(t, err)
	assert.Equal(t, expectedSR, sr)
	mockRepo.AssertExpectations(t)
}

func TestSalesRekonsiliasiService_GetAllSalesRekonsiliasi(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()
	expectedSRs := []*entities.SalesRekonsiliasi{{ID: "sr123"}, {ID: "sr124"}}

	mockRepo.On("GetAll", ctx).Return(expectedSRs, nil)

	srs, err := service.GetAllSalesRekonsiliasi(ctx)
	assert.NoError(t, err)
	assert.Equal(t, expectedSRs, srs)
	mockRepo.AssertExpectations(t)
}

func TestSalesRekonsiliasiService_UpdateSalesRekonsiliasi(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()
	salesRekonsiliasi := &entities.SalesRekonsiliasi{ID: "sr123", Status: "Reconciled"}

	mockRepo.On("GetByID", ctx, "sr123").Return(salesRekonsiliasi, nil)
	mockRepo.On("Update", ctx, salesRekonsiliasi).Return(nil)

	err := service.UpdateSalesRekonsiliasi(ctx, salesRekonsiliasi)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSalesRekonsiliasiService_UpdateSalesRekonsiliasi_NotFound(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()
	salesRekonsiliasi := &entities.SalesRekonsiliasi{ID: "sr123", Status: "Reconciled"}

	mockRepo.On("GetByID", ctx, "sr123").Return(nil, nil)

	err := service.UpdateSalesRekonsiliasi(ctx, salesRekonsiliasi)
	assert.Error(t, err)
	assert.EqualError(t, err, "sales reconciliation entry not found")
	mockRepo.AssertExpectations(t)
}

func TestSalesRekonsiliasiService_DeleteSalesRekonsiliasi(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()
	salesRekonsiliasi := &entities.SalesRekonsiliasi{ID: "sr123"}

	mockRepo.On("GetByID", ctx, "sr123").Return(salesRekonsiliasi, nil)
	mockRepo.On("Delete", ctx, "sr123").Return(nil)

	err := service.DeleteSalesRekonsiliasi(ctx, "sr123")
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSalesRekonsiliasiService_DeleteSalesRekonsiliasi_NotFound(t *testing.T) {
	mockRepo := new(repositories.MockSalesRekonsiliasiRepository)
	service := NewSalesRekonsiliasiService(mockRepo)
	ctx := context.Background()

	mockRepo.On("GetByID", ctx, "sr123").Return(nil, nil)

	err := service.DeleteSalesRekonsiliasi(ctx, "sr123")
	assert.Error(t, err)
	assert.EqualError(t, err, "sales reconciliation entry not found")
	mockRepo.AssertExpectations(t)
}
