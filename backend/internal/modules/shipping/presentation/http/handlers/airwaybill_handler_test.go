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

	shipping_domain "malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/presentation/http/handlers"
	"malaka/internal/shared/response"
)

// MockAirwaybillService is a mock type for the AirwaybillService type
type MockAirwaybillService struct {
	mock.Mock
}

func (m *MockAirwaybillService) CreateAirwaybill(ctx context.Context, req *dtos.CreateAirwaybillRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockAirwaybillService) GetAirwaybillByID(ctx context.Context, id uuid.UUID) (*shipping_domain.Airwaybill, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*shipping_domain.Airwaybill), args.Error(1)
}

func (m *MockAirwaybillService) GetAllAirwaybills(ctx context.Context) ([]shipping_domain.Airwaybill, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]shipping_domain.Airwaybill), args.Error(1)
}

func (m *MockAirwaybillService) UpdateAirwaybill(ctx context.Context, req *dtos.UpdateAirwaybillRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockAirwaybillService) DeleteAirwaybill(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func setupAirwaybillRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

func TestAirwaybillHandler_CreateAirwaybill(t *testing.T) {
	mockService := new(MockAirwaybillService)
	handler := handlers.NewAirwaybillHandler(mockService)
	router := setupAirwaybillRouter()
	router.POST("/shipping/airwaybills", handler.CreateAirwaybill)

	t.Run("Success", func(t *testing.T) {
		reqDTO := dtos.CreateAirwaybillRequest{
			// Populate with valid data
		}
		mockService.On("CreateAirwaybill", mock.Anything, &reqDTO).Return(nil).Once()

		body, _ := json.Marshal(reqDTO)
		req, _ := http.NewRequest(http.MethodPost, "/shipping/airwaybills", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Invalid Request Body", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodPost, "/shipping/airwaybills", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAirwaybillHandler_GetAirwaybillByID(t *testing.T) {
	mockService := new(MockAirwaybillService)
	handler := handlers.NewAirwaybillHandler(mockService)
	router := setupAirwaybillRouter()
	router.GET("/shipping/airwaybills/:id", handler.GetAirwaybillByID)

	t.Run("Success", func(t *testing.T) {
		airwaybillID := uuid.New()
		airwaybill := &shipping_domain.Airwaybill{ID: airwaybillID, AirwaybillNumber: "AWB123"}
		mockService.On("GetAirwaybillByID", mock.Anything, airwaybillID).Return(airwaybill, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/airwaybills/"+airwaybillID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp response.Response
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NotNil(t, resp.Data)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		airwaybillID := uuid.New()
		mockService.On("GetAirwaybillByID", mock.Anything, airwaybillID).Return(nil, gorm.ErrRecordNotFound).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/airwaybills/"+airwaybillID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestAirwaybillHandler_GetAllAirwaybills(t *testing.T) {
	mockService := new(MockAirwaybillService)
	handler := handlers.NewAirwaybillHandler(mockService)
	router := setupAirwaybillRouter()
	router.GET("/shipping/airwaybills", handler.GetAllAirwaybills)

	t.Run("Success", func(t *testing.T) {
		airwaybills := []domain.Airwaybill{
			{ID: uuid.New(), AirwaybillNumber: "AWB123"},
			{ID: uuid.New(), AirwaybillNumber: "AWB456"},
		}
		mockService.On("GetAllAirwaybills", mock.Anything).Return(airwaybills, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/airwaybills", nil)
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

func TestAirwaybillHandler_UpdateAirwaybill(t *testing.T) {
	mockService := new(MockAirwaybillService)
	handler := handlers.NewAirwaybillHandler(mockService)
	router := setupAirwaybillRouter()
	router.PUT("/shipping/airwaybills/:id", handler.UpdateAirwaybill)

	airwaybillID := uuid.New()
	updateDTO := dtos.UpdateAirwaybillRequest{
		ID: airwaybillID,
		// Populate with valid data
	}

	t.Run("Success", func(t *testing.T) {
		mockService.On("UpdateAirwaybill", mock.Anything, &updateDTO).Return(nil).Once()

		body, _ := json.Marshal(updateDTO)
		req, _ := http.NewRequest(http.MethodPut, "/shipping/airwaybills/"+airwaybillID.String(), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockService.On("UpdateAirwaybill", mock.Anything, &updateDTO).Return(gorm.ErrRecordNotFound).Once()

		body, _ := json.Marshal(updateDTO)
		req, _ := http.NewRequest(http.MethodPut, "/shipping/airwaybills/"+airwaybillID.String(), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestAirwaybillHandler_DeleteAirwaybill(t *testing.T) {
	mockService := new(MockAirwaybillService)
	handler := handlers.NewAirwaybillHandler(mockService)
	router := setupAirwaybillRouter()
	router.DELETE("/shipping/airwaybills/:id", handler.DeleteAirwaybill)

	airwaybillID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mockService.On("DeleteAirwaybill", mock.Anything, airwaybillID).Return(nil).Once()

		req, _ := http.NewRequest(http.MethodDelete, "/shipping/airwaybills/"+airwaybillID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockService.On("DeleteAirwaybill", mock.Anything, airwaybillID).Return(gorm.ErrRecordNotFound).Once()

		req, _ := http.NewRequest(http.MethodDelete, "/shipping/airwaybills/"+airwaybillID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		mockService.AssertExpectations(t)
	})
}
