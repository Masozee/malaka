package handlers

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
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/presentation/http/dto"
)



type MockCourierRateService struct {
	mock.Mock
}

func (m *MockCourierRateService) CreateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error {
	args := m.Called(ctx, courierRate)
	return args.Error(0)
}

func (m *MockCourierRateService) GetCourierRateByID(ctx context.Context, id uuid.UUID) (*entities.CourierRate, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.CourierRate), args.Error(1)
}

func (m *MockCourierRateService) UpdateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error {
	args := m.Called(ctx, courierRate)
	return args.Error(0)
}

func (m *MockCourierRateService) DeleteCourierRate(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestCourierRateHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockCourierRateService)
	h := NewCourierRateHandler(mockService)

	router := gin.Default()
	router.POST("/courier-rates", h.CreateCourierRate)
	router.GET("/courier-rates/:id", h.GetCourierRateByID)
	router.PUT("/courier-rates/:id", h.UpdateCourierRate)
	router.DELETE("/courier-rates/:id", h.DeleteCourierRate)

	t.Run("CreateCourierRate", func(t *testing.T) {
		courierID := uuid.New()
		reqBody := dto.CreateCourierRateRequest{
			CourierID:   courierID,
			Origin:      "Jakarta",
			Destination: "Bandung",
			Price:       10000,
		}
		j, _ := json.Marshal(reqBody)

		mockService.On("CreateCourierRate", mock.Anything, mock.AnythingOfType("*entities.CourierRate")).Return(nil)

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("POST", "/courier-rates", bytes.NewBuffer(j))
		httpReq.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusCreated, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("GetCourierRateByID", func(t *testing.T) {
		id := uuid.New()
		courierRate := &entities.CourierRate{ID: id}

		mockService.On("GetCourierRateByID", mock.Anything, id).Return(courierRate, nil)

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("GET", "/courier-rates/"+id.String(), nil)

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("UpdateCourierRate", func(t *testing.T) {
		id := uuid.New()
		courierID := uuid.New()
		reqBody := dto.UpdateCourierRateRequest{
			CourierID:   courierID,
			Origin:      "Jakarta",
			Destination: "Bandung",
			Price:       15000,
		}
		j, _ := json.Marshal(reqBody)

		courierRate := &entities.CourierRate{ID: id}
		mockService.On("GetCourierRateByID", mock.Anything, id).Return(courierRate, nil)
		mockService.On("UpdateCourierRate", mock.Anything, mock.AnythingOfType("*entities.CourierRate")).Return(nil)

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("PUT", "/courier-rates/"+id.String(), bytes.NewBuffer(j))
		httpReq.Header.Set("Content-Type", "application/json")

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("DeleteCourierRate", func(t *testing.T) {
		id := uuid.New()

		mockService.On("DeleteCourierRate", mock.Anything, id).Return(nil)

		w := httptest.NewRecorder()
		httpReq, _ := http.NewRequest("DELETE", "/courier-rates/"+id.String(), nil)

		router.ServeHTTP(w, httpReq)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})
}



