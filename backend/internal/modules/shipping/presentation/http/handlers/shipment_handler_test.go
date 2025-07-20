package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"

	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/presentation/http/handlers"
	"malaka/internal/shared/response"
)

// MockShipmentService is a mock type for the ShipmentService type
type MockShipmentService struct {
	mock.Mock
}

func (m *MockShipmentService) CreateShipment(ctx context.Context, req *dtos.CreateShipmentRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockShipmentService) GetShipmentByID(ctx context.Context, id uuid.UUID) (*domain.Shipment, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Shipment), args.Error(1)
}

func (m *MockShipmentService) GetAllShipments(ctx context.Context) ([]domain.Shipment, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Shipment), args.Error(1)
}

func (m *MockShipmentService) UpdateShipment(ctx context.Context, req *dtos.UpdateShipmentRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockShipmentService) DeleteShipment(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

func TestShipmentHandler_CreateShipment(t *testing.T) {
	mockService := new(MockShipmentService)
	handler := handlers.NewShipmentHandler(mockService)
	router := setupRouter()
	router.POST("/shipping/shipments", handler.CreateShipment)

	t.Run("Success", func(t *testing.T) {
		reqDTO := dtos.CreateShipmentRequest{
			// Populate with valid data
		}
		mockService.On("CreateShipment", mock.Anything, &reqDTO).Return(nil).Once()

		body, _ := json.Marshal(reqDTO)
		req, _ := http.NewRequest(http.MethodPost, "/shipping/shipments", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Invalid Request Body", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodPost, "/shipping/shipments", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestShipmentHandler_GetShipmentByID(t *testing.T) {
	mockService := new(MockShipmentService)
	handler := handlers.NewShipmentHandler(mockService)
	router := setupRouter()
	router.GET("/shipping/shipments/:id", handler.GetShipmentByID)

	t.Run("Success", func(t *testing.T) {
		shipmentID := uuid.New()
		shipment := &domain.Shipment{ID: shipmentID, TrackingNumber: "TRACK123"}
		mockService.On("GetShipmentByID", mock.Anything, shipmentID).Return(shipment, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/shipments/"+shipmentID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp response.Response
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NotNil(t, resp.Data)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		shipmentID := uuid.New()
		mockService.On("GetShipmentByID", mock.Anything, shipmentID).Return(nil, gorm.ErrRecordNotFound).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/shipments/"+shipmentID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestShipmentHandler_GetAllShipments(t *testing.T) {
	mockService := new(MockShipmentService)
	handler := handlers.NewShipmentHandler(mockService)
	router := setupRouter()
	router.GET("/shipping/shipments", handler.GetAllShipments)

	t.Run("Success", func(t *testing.T) {
		shipments := []domain.Shipment{
			{ID: uuid.New(), TrackingNumber: "TRACK123"},
			{ID: uuid.New(), TrackingNumber: "TRACK456"},
		}
		mockService.On("GetAllShipments", mock.Anything).Return(shipments, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/shipments", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp response.Response
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NotNil(t, resp.Data)
		assert.Len(t, resp.Data, 2)
		mockService.AssertExpectations(t)
	})
}

func TestShipmentHandler_UpdateShipment(t *testing.T) {
	mockService := new(MockShipmentService)
	handler := handlers.NewShipmentHandler(mockService)
	router := setupRouter()
	router.PUT("/shipping/shipments/:id", handler.UpdateShipment)

	shipmentID := uuid.New()
	updateDTO := dtos.UpdateShipmentRequest{
		ID: shipmentID,
		// Populate with valid data
	}

	t.Run("Success", func(t *testing.T) {
		mockService.On("UpdateShipment", mock.Anything, &updateDTO).Return(nil).Once()

		body, _ := json.Marshal(updateDTO)
		req, _ := http.NewRequest(http.MethodPut, "/shipping/shipments/"+shipmentID.String(), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockService.On("UpdateShipment", mock.Anything, &updateDTO).Return(gorm.ErrRecordNotFound).Once()

		body, _ := json.Marshal(updateDTO)
		req, _ := http.NewRequest(http.MethodPut, "/shipping/shipments/"+shipmentID.String(), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestShipmentHandler_DeleteShipment(t *testing.T) {
	mockService := new(MockShipmentService)
	handler := handlers.NewShipmentHandler(mockService)
	router := setupRouter()
	router.DELETE("/shipping/shipments/:id", handler.DeleteShipment)

	shipmentID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mockService.On("DeleteShipment", mock.Anything, shipmentID).Return(nil).Once()

		req, _ := http.NewRequest(http.MethodDelete, "/shipping/shipments/"+shipmentID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockService.On("DeleteShipment", mock.Anything, shipmentID).Return(gorm.ErrRecordNotFound).Once()

		req, _ := http.NewRequest(http.MethodDelete, "/shipping/shipments/"+shipmentID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		mockService.AssertExpectations(t)
	})
}
