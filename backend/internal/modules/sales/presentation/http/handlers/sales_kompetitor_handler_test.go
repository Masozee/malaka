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

// MockSalesKompetitorService is a mock implementation of SalesKompetitorService.
type MockSalesKompetitorService struct {
	mock.Mock
}

func (m *MockSalesKompetitorService) CreateSalesKompetitor(ctx context.Context, sk *entities.SalesKompetitor) error {
	args := m.Called(ctx, sk)
	return args.Error(0)
}

func (m *MockSalesKompetitorService) GetSalesKompetitorByID(ctx context.Context, id string) (*entities.SalesKompetitor, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.SalesKompetitor), args.Error(1)
}

func (m *MockSalesKompetitorService) GetAllSalesKompetitors(ctx context.Context) ([]*entities.SalesKompetitor, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.SalesKompetitor), args.Error(1)
}

func (m *MockSalesKompetitorService) UpdateSalesKompetitor(ctx context.Context, sk *entities.SalesKompetitor) error {
	args := m.Called(ctx, sk)
	return args.Error(0)
}

func (m *MockSalesKompetitorService) DeleteSalesKompetitor(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestSalesKompetitorHandler_CreateSalesKompetitor(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.POST("/sales-kompetitors", handler.CreateSalesKompetitor)

	now := time.Now()
	reqBody := map[string]interface{}{
		"competitor_name": "Competitor A",
		"product_name":    "Product X",
		"price":           100.50,
		"date_observed":   now.Format(time.RFC3339),
		"notes":           "Observed in store",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("CreateSalesKompetitor", mock.Anything, mock.AnythingOfType("*entities.SalesKompetitor")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/sales-kompetitors", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_GetAllSalesKompetitors(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.GET("/sales-kompetitors", handler.GetAllSalesKompetitors)

	expectedSKs := []*entities.SalesKompetitor{
		{ID: "sk1", CompetitorName: "Comp1"},
		{ID: "sk2", CompetitorName: "Comp2"},
	}
	mockService.On("GetAllSalesKompetitors", mock.Anything).Return(expectedSKs, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/sales-kompetitors", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales competitor entries retrieved successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_GetSalesKompetitorByID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.GET("/sales-kompetitors/:id", handler.GetSalesKompetitorByID)

	expectedSK := &entities.SalesKompetitor{ID: "sk123", CompetitorName: "Competitor A"}
	mockService.On("GetSalesKompetitorByID", mock.Anything, "sk123").Return(expectedSK, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/sales-kompetitors/sk123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales competitor entry retrieved successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_GetSalesKompetitorByID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.GET("/sales-kompetitors/:id", handler.GetSalesKompetitorByID)

	mockService.On("GetSalesKompetitorByID", mock.Anything, "sk123").Return((*entities.SalesKompetitor)(nil), nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/sales-kompetitors/sk123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales competitor entry not found", response["error"])
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_UpdateSalesKompetitor(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.PUT("/sales-kompetitors/:id", handler.UpdateSalesKompetitor)

	now := time.Now()
	reqBody := map[string]interface{}{
		"competitor_name": "Updated Competitor",
		"product_name":    "Updated Product",
		"price":           120.00,
		"date_observed":   now.Format(time.RFC3339),
		"notes":           "Updated notes",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("UpdateSalesKompetitor", mock.Anything, mock.AnythingOfType("*entities.SalesKompetitor")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/sales-kompetitors/sk123", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales competitor entry updated successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_UpdateSalesKompetitor_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.PUT("/sales-kompetitors/:id", handler.UpdateSalesKompetitor)

	now := time.Now()
	reqBody := map[string]interface{}{
		"competitor_name": "Updated Competitor",
		"product_name":    "Updated Product",
		"price":           120.00,
		"date_observed":   now.Format(time.RFC3339),
		"notes":           "Updated notes",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("UpdateSalesKompetitor", mock.Anything, mock.AnythingOfType("*entities.SalesKompetitor")).Return(errors.New("service error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/sales-kompetitors/sk123", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "service error", response["error"])
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_DeleteSalesKompetitor(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.DELETE("/sales-kompetitors/:id", handler.DeleteSalesKompetitor)

	mockService.On("DeleteSalesKompetitor", mock.Anything, "sk123").Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/sales-kompetitors/sk123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales competitor entry deleted successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesKompetitorHandler_DeleteSalesKompetitor_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesKompetitorService)
	handler := NewSalesKompetitorHandler(mockService)

	r := gin.Default()
	r.DELETE("/sales-kompetitors/:id", handler.DeleteSalesKompetitor)

	mockService.On("DeleteSalesKompetitor", mock.Anything, "sk123").Return(errors.New("service error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/sales-kompetitors/sk123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "service error", response["error"])
	mockService.AssertExpectations(t)
}
