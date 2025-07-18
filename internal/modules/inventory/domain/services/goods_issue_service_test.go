package services_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
)

// MockGoodsIssueRepository is a mock implementation of GoodsIssueRepository.
type MockGoodsIssueRepository struct {
	mock.Mock
}

func (m *MockGoodsIssueRepository) Save(ctx context.Context, goodsIssue *entities.GoodsIssue) error {
	args := m.Called(ctx, goodsIssue)
	return args.Error(0)
}

func (m *MockGoodsIssueRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.GoodsIssue), args.Error(1)
}

func (m *MockGoodsIssueRepository) FindAll(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error) {
	args := m.Called(ctx, limit, offset, filter)
	return args.Get(0).([]*entities.GoodsIssue), args.Error(1)
}

func (m *MockGoodsIssueRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestCreateGoodsIssue(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	issueDate := time.Now()
	warehouseID := uuid.New()
	notes := "Test notes"
	items := []services.CreateGoodsIssueItemRequest{
		{ArticleID: uuid.New(), Quantity: 10, UnitPrice: 100.0, Unit: "pcs"},
	}

	mockRepo.On("Save", ctx, mock.AnythingOfType("*entities.GoodsIssue")).Return(nil)

	gi, err := service.CreateGoodsIssue(ctx, issueDate, warehouseID, notes, items)

	assert.NoError(t, err)
	assert.NotNil(t, gi)
	assert.Equal(t, warehouseID, gi.WarehouseID)
	assert.Equal(t, notes, gi.Notes)
	assert.Len(t, gi.Items, 1)
	mockRepo.AssertExpectations(t)
}

func TestCreateGoodsIssue_RepositoryError(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	issueDate := time.Now()
	warehouseID := uuid.New()
	notes := "Test notes"
	items := []services.CreateGoodsIssueItemRequest{
		{ArticleID: uuid.New(), Quantity: 10, UnitPrice: 100.0, Unit: "pcs"},
	}

	mockRepo.On("Save", ctx, mock.AnythingOfType("*entities.GoodsIssue")).Return(errors.New("db error"))

	gi, err := service.CreateGoodsIssue(ctx, issueDate, warehouseID, notes, items)

	assert.Error(t, err)
	assert.Nil(t, gi)
	assert.Contains(t, err.Error(), "db error")
	mockRepo.AssertExpectations(t)
}

func TestGetGoodsIssueByID(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	expectedGI, _ := entities.NewGoodsIssue(uuid.New(), time.Now(), uuid.New(), "Draft", "")
	mockRepo.On("FindByID", ctx, expectedGI.ID).Return(expectedGI, nil)

	gi, err := service.GetGoodsIssueByID(ctx, expectedGI.ID)

	assert.NoError(t, err)
	assert.NotNil(t, gi)
	assert.Equal(t, expectedGI.ID, gi.ID)
	mockRepo.AssertExpectations(t)
}

func TestGetGoodsIssueByID_NotFound(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	mockRepo.On("FindByID", ctx, id).Return(&entities.GoodsIssue{}, errors.New("not found"))

	gi, err := service.GetGoodsIssueByID(ctx, id)

	assert.Error(t, err)
	assert.Nil(t, gi)
	assert.Contains(t, err.Error(), "not found")
	mockRepo.AssertExpectations(t)
}

func TestListGoodsIssues(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	expectedGIs := []*entities.GoodsIssue{
		{ID: uuid.New(), Status: "Draft"},
		{ID: uuid.New(), Status: "Completed"},
	}
	mockRepo.On("FindAll", ctx, 10, 0, mock.Anything).Return(expectedGIs, nil)

	gis, err := service.ListGoodsIssues(ctx, 10, 0, nil)

	assert.NoError(t, err)
	assert.NotNil(t, gis)
	assert.Len(t, gis, 2)
	mockRepo.AssertExpectations(t)
}

func TestUpdateGoodsIssue(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	issueDate := time.Now()
	warehouseID := uuid.New()
	status := "Completed"
	notes := "Updated notes"
	items := []services.UpdateGoodsIssueItemRequest{
		{ID: uuid.New(), ArticleID: uuid.New(), Quantity: 5, UnitPrice: 50.0, Unit: "pcs"},
	}

	existingGI, _ := entities.NewGoodsIssue(id, time.Now(), uuid.New(), "Draft", "Old notes")
	mockRepo.On("FindByID", ctx, id).Return(existingGI, nil)
	mockRepo.On("Save", ctx, mock.AnythingOfType("*entities.GoodsIssue")).Return(nil)

	gi, err := service.UpdateGoodsIssue(ctx, id, issueDate, warehouseID, status, notes, items)

	assert.NoError(t, err)
	assert.NotNil(t, gi)
	assert.Equal(t, status, gi.Status)
	assert.Equal(t, notes, gi.Notes)
	assert.Len(t, gi.Items, 1)
	mockRepo.AssertExpectations(t)
}

func TestUpdateGoodsIssue_NotFound(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	mockRepo.On("FindByID", ctx, id).Return(&entities.GoodsIssue{}, errors.New("not found"))

	gi, err := service.UpdateGoodsIssue(ctx, id, time.Now(), uuid.New(), "Completed", "", nil)

	assert.Error(t, err)
	assert.Nil(t, gi)
	assert.Contains(t, err.Error(), "not found")
	mockRepo.AssertExpectations(t)
}

func TestDeleteGoodsIssue(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	mockRepo.On("Delete", ctx, id).Return(nil)

	err := service.DeleteGoodsIssue(ctx, id)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestDeleteGoodsIssue_RepositoryError(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	mockRepo.On("Delete", ctx, id).Return(errors.New("db error"))

	err := service.DeleteGoodsIssue(ctx, id)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "db error")
	mockRepo.AssertExpectations(t)
}

func TestUpdateGoodsIssueStatus(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	existingGI, _ := entities.NewGoodsIssue(id, time.Now(), uuid.New(), "Draft", "")
	mockRepo.On("FindByID", ctx, id).Return(existingGI, nil)
	mockRepo.On("Save", ctx, mock.AnythingOfType("*entities.GoodsIssue")).Return(nil)

	err := service.UpdateGoodsIssueStatus(ctx, id, "Completed")

	assert.NoError(t, err)
	assert.Equal(t, "Completed", existingGI.Status)
	mockRepo.AssertExpectations(t)
}

func TestUpdateGoodsIssueStatus_InvalidStatus(t *testing.T) {
	mockRepo := new(MockGoodsIssueRepository)
	service := services.NewGoodsIssueService(mockRepo)
	ctx := context.Background()

	id := uuid.New()
	existingGI, _ := entities.NewGoodsIssue(id, time.Now(), uuid.New(), "Draft", "")
	mockRepo.On("FindByID", ctx, id).Return(existingGI, nil)

	err := service.UpdateGoodsIssueStatus(ctx, id, "Invalid")

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid status")
	mockRepo.AssertExpectations(t)
}
