package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"malaka/internal/modules/sales/domain/entities"
)

// MockProsesMarginService is a mock implementation of ProsesMarginService.
type MockProsesMarginService struct {
	mock.Mock
}

func (m *MockProsesMarginService) CreateProsesMargin(ctx context.Context, pm *entities.ProsesMargin) error {
	args := m.Called(ctx, pm)
	return args.Error(0)
}

func (m *MockProsesMarginService) GetProsesMarginByID(ctx context.Context, id string) (*entities.ProsesMargin, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.ProsesMargin), args.Error(1)
}

func (m *MockProsesMarginService) GetAllProsesMargins(ctx context.Context) ([]*entities.ProsesMargin, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.ProsesMargin), args.Error(1)
}

func (m *MockProsesMarginService) UpdateProsesMargin(ctx context.Context, pm *entities.ProsesMargin) error {
	args := m.Called(ctx, pm)
	return args.Error(0)
}

func (m *MockProsesMarginService) DeleteProsesMargin(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestProsesMarginHandler_CreateProsesMargin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.POST("/proses-margins", handler.CreateProsesMargin)

	now := time.Now()
	reqBody := map[string]interface{}{
		"sales_order_id":    "so123",
		"cost_of_goods":     50.00,
		"selling_price":     100.00,
		"margin_amount":     50.00,
		"margin_percentage": 50.00,
		"calculated_at":     now.Format(time.RFC3339),
		"notes":             "Test notes",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("CreateProsesMargin", mock.Anything, mock.AnythingOfType("*entities.ProsesMargin")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/proses-margins", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_GetAllProsesMargins(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.GET("/proses-margins", handler.GetAllProsesMargins)

	expectedPMs := []*entities.ProsesMargin{
		{ID: "pm1", SalesOrderID: "so1"},
		{ID: "pm2", SalesOrderID: "so2"},
	}
	mockService.On("GetAllProsesMargins", mock.Anything).Return(expectedPMs, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/proses-margins", nil)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Proses margin entries retrieved successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_GetProsesMarginByID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.GET("/proses-margins/:id", handler.GetProsesMarginByID)

	expectedPM := &entities.ProsesMargin{ID: "pm123", SalesOrderID: "so123"}
	mockService.On("GetProsesMarginByID", mock.Anything, "pm123").Return(expectedPM, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/proses-margins/pm123", nil)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Proses margin entry retrieved successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_GetProsesMarginByID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.GET("/proses-margins/:id", handler.GetProsesMarginByID)

	mockService.On("GetProsesMarginByID", mock.Anything, "pm123").Return((*entities.ProsesMargin)(nil), nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/proses-margins/pm123", nil)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Proses margin entry not found", response["error"])
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_UpdateProsesMargin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.PUT("/proses-margins/:id", handler.UpdateProsesMargin)

	now := time.Now()
	reqBody := map[string]interface{}{
		"sales_order_id":    "so123",
		"cost_of_goods":     55.00,
		"selling_price":     110.00,
		"margin_amount":     55.00,
		"margin_percentage": 50.00,
		"calculated_at":     now.Format(time.RFC3339),
		"notes":             "Updated notes",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("UpdateProsesMargin", mock.Anything, mock.AnythingOfType("*entities.ProsesMargin")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/proses-margins/pm123", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Proses margin entry updated successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_UpdateProsesMargin_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.PUT("/proses-margins/:id", handler.UpdateProsesMargin)

	now := time.Now()
	reqBody := map[string]interface{}{
		"sales_order_id":    "so123",
		"cost_of_goods":     55.00,
		"selling_price":     110.00,
		"margin_amount":     55.00,
		"margin_percentage": 50.00,
		"calculated_at":     now.Format(time.RFC3339),
		"notes":             "Updated notes",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("UpdateProsesMargin", mock.Anything, mock.AnythingOfType("*entities.ProsesMargin")).Return(errors.New("service error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/proses-margins/pm123", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "service error", response["error"])
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_DeleteProsesMargin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.DELETE("/proses-margins/:id", handler.DeleteProsesMargin)

	mockService.On("DeleteProsesMargin", mock.Anything, "pm123").Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/proses-margins/pm123", nil)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Proses margin entry deleted successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestProsesMarginHandler_DeleteProsesMargin_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockProsesMarginService)
	handler := NewProsesMarginHandler(mockService)

	r := gin.Default()
	r.DELETE("/proses-margins/:id", handler.DeleteProsesMargin)

	mockService.On("DeleteProsesMargin", mock.Anything, "pm123").Return(errors.New("service error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/proses-margins/pm123", nil)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "service error", response["error"])
	mockService.AssertExpectations(t)
}