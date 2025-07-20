package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/modules/inventory/presentation/http/handlers"
)

// MockDraftOrderService is a mock implementation of DraftOrderService.
type MockDraftOrderService struct {
	mock.Mock
}

func (m *MockDraftOrderService) CreateDraftOrder(ctx context.Context, draftOrder *entities.DraftOrder) error {
	args := m.Called(ctx, draftOrder)
	return args.Error(0)
}

func (m *MockDraftOrderService) GetDraftOrderByID(ctx context.Context, id string) (*entities.DraftOrder, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.DraftOrder), args.Error(1)
}

func (m *MockDraftOrderService) UpdateDraftOrder(ctx context.Context, draftOrder *entities.DraftOrder) error {
	args := m.Called(ctx, draftOrder)
	return args.Error(0)
}

func (m *MockDraftOrderService) DeleteDraftOrder(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockDraftOrderService) GetAllDraftOrders(ctx context.Context) ([]*entities.DraftOrder, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.DraftOrder), args.Error(1)
}

func TestDraftOrderHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockDraftOrderService)
	h := handlers.NewDraftOrderHandler(mockService)

	router := gin.Default()
	router.POST("/draft-orders", h.CreateDraftOrder)
	router.GET("/draft-orders/:id", h.GetDraftOrderByID)
	router.PUT("/draft-orders/:id", h.UpdateDraftOrder)
	router.DELETE("/draft-orders/:id", h.DeleteDraftOrder)
	router.GET("/draft-orders", h.GetAllDraftOrders)

	t.Run("CreateDraftOrder - Success", func(t *testing.T) {
		reqBody := dto.CreateDraftOrderRequest{
			SupplierID:  uuid.New().String(),
			OrderDate:   time.Now(),
			Status:      "draft",
			TotalAmount: 100.50,
		}
		j, _ := json.Marshal(reqBody)

		mockService.On("CreateDraftOrder", mock.Anything, mock.AnythingOfType("*entities.DraftOrder")).Return(nil).Once()

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("POST", "/draft-orders", bytes.NewBuffer(j))
		httpReq.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusCreated, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("GetDraftOrderByID - Success", func(t *testing.T) {
		id := uuid.New()
		expectedDraftOrder := &entities.DraftOrder{ID: id.String(), SupplierID: uuid.New().String()}
		mockService.On("GetDraftOrderByID", mock.Anything, id.String()).Return(expectedDraftOrder, nil).Once()

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("GET", "/draft-orders/"+id.String(), nil)

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("UpdateDraftOrder - Success", func(t *testing.T) {
		id := uuid.New()
		reqBody := dto.UpdateDraftOrderRequest{
			Status:      "approved",
			TotalAmount: 150.75,
		}
		j, _ := json.Marshal(reqBody)

		existingDraftOrder := &entities.DraftOrder{ID: id}
		mockService.On("GetDraftOrderByID", mock.Anything, id.String()).Return(existingDraftOrder, nil).Once()
		mockService.On("UpdateDraftOrder", mock.Anything, mock.AnythingOfType("*entities.DraftOrder")).Return(nil).Once()

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("PUT", "/draft-orders/"+id.String(), bytes.NewBuffer(j))
		httpReq.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("DeleteDraftOrder - Success", func(t *testing.T) {
		id := uuid.New()
		existingDraftOrder := &entities.DraftOrder{ID: id}
		mockService.On("GetDraftOrderByID", mock.Anything, id.String()).Return(existingDraftOrder, nil).Once()
		mockService.On("DeleteDraftOrder", mock.Anything, id.String()).Return(nil).Once()

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("DELETE", "/draft-orders/"+id.String(), nil)

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("GetAllDraftOrders - Success", func(t *testing.T) {
		expectedDraftOrders := []*entities.DraftOrder{
			{ID: uuid.New().String(), SupplierID: uuid.New().String()},
			{ID: uuid.New().String(), SupplierID: uuid.New().String()},
		}
		mockService.On("GetAllDraftOrders", mock.Anything).Return(expectedDraftOrders, nil).Once()

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("GET", "/draft-orders", nil)

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})
}
