package repositories

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"malaka/internal/modules/inventory/domain/entities"
)

// MockGoodsIssueRepository is a mock implementation of GoodsIssueRepository for testing.
type MockGoodsIssueRepository struct {
	SaveFunc   func(ctx context.Context, goodsIssue *entities.GoodsIssue) error
	FindByIDFunc func(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error)
	FindAllFunc  func(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error)
	DeleteFunc func(ctx context.Context, id uuid.UUID) error
}

func (m *MockGoodsIssueRepository) Save(ctx context.Context, goodsIssue *entities.GoodsIssue) error {
	return m.SaveFunc(ctx, goodsIssue)
}

func (m *MockGoodsIssueRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error) {
	return m.FindByIDFunc(ctx, id)
}

func (m *MockGoodsIssueRepository) FindAll(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error) {
	return m.FindAllFunc(ctx, limit, offset, filter)
}

func (m *MockGoodsIssueRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DeleteFunc(ctx, id)
}

func TestGoodsIssueRepository_Interface(t *testing.T) {
	// This test ensures that MockGoodsIssueRepository implements GoodsIssueRepository interface.
	// If it doesn't, the compilation will fail.
	var _ GoodsIssueRepository = &MockGoodsIssueRepository{}

	ctx := context.Background()

	// Test Save method
	mockRepo := &MockGoodsIssueRepository{
		SaveFunc: func(ctx context.Context, goodsIssue *entities.GoodsIssue) error {
			assert.NotNil(t, goodsIssue)
			return nil
		},
	}
	gi, _ := entities.NewGoodsIssue(uuid.New(), time.Now(), uuid.New(), "Draft", "")
	err := mockRepo.Save(ctx, gi)
	assert.NoError(t, err)

	// Test FindByID method
	mockRepo.FindByIDFunc = func(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error) {
		assert.NotNil(t, id)
		return gi, nil
	}
	foundGI, err := mockRepo.FindByID(ctx, gi.ID)
	assert.NoError(t, err)
	assert.Equal(t, gi, foundGI)

	// Test FindAll method
	mockRepo.FindAllFunc = func(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error) {
		assert.Equal(t, 10, limit)
		assert.Equal(t, 0, offset)
		return []*entities.GoodsIssue{gi}, nil
	}
	foundGIs, err := mockRepo.FindAll(ctx, 10, 0, nil)
	assert.NoError(t, err)
	assert.Len(t, foundGIs, 1)

	// Test Delete method
	mockRepo.DeleteFunc = func(ctx context.Context, id uuid.UUID) error {
		assert.NotNil(t, id)
		return nil
	}
	err = mockRepo.Delete(ctx, gi.ID)
	assert.NoError(t, err)
}
