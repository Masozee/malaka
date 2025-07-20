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

// MockSalesRekonsiliasiService is a mock implementation of SalesRekonsiliasiService.
type MockSalesRekonsiliasiService struct {
	mock.Mock
}

func (m *MockSalesRekonsiliasiService) CreateSalesRekonsiliasi(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	args := m.Called(ctx, sr)
	return args.Error(0)
}

func (m *MockSalesRekonsiliasiService) GetSalesRekonsiliasiByID(ctx context.Context, id string) (*entities.SalesRekonsiliasi, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.SalesRekonsiliasi), args.Error(1)
}

func (m *MockSalesRekonsiliasiService) GetAllSalesRekonsiliasi(ctx context.Context) ([]*entities.SalesRekonsiliasi, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.SalesRekonsiliasi), args.Error(1)
}

func (m *MockSalesRekonsiliasiService) UpdateSalesRekonsiliasi(ctx context.Context, sr *entities.SalesRekonsiliasi) error {
	args := m.Called(ctx, sr)
	return args.Error(0)
}

func (m *MockSalesRekonsiliasiService) DeleteSalesRekonsiliasi(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestSalesRekonsiliasiHandler_CreateSalesRekonsiliasi(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.POST("/sales-rekonsiliasi", handler.CreateSalesRekonsiliasi)

	now := time.Now()
	reqBody := map[string]interface{}{
		"reconciliation_date": now.Format(time.RFC3339),
		"sales_amount":        1000.00,
		"payment_amount":      950.00,
		"discrepancy":         50.00,
		"status":              "Pending",
		"notes":               "Initial reconciliation",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("CreateSalesRekonsiliasi", mock.Anything, mock.AnythingOfType("*entities.SalesRekonsiliasi")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/sales-rekonsiliasi", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_GetAllSalesRekonsiliasi(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.GET("/sales-rekonsiliasi", handler.GetAllSalesRekonsiliasi)

	expectedSRs := []*entities.SalesRekonsiliasi{
		{ID: "sr1", Status: "Pending"},
		{ID: "sr2", Status: "Reconciled"},
	}
	mockService.On("GetAllSalesRekonsiliasi", mock.Anything).Return(expectedSRs, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/sales-rekonsiliasi", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales reconciliation entries retrieved successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_GetSalesRekonsiliasiByID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.GET("/sales-rekonsiliasi/:id", handler.GetSalesRekonsiliasiByID)

	expectedSR := &entities.SalesRekonsiliasi{ID: "sr123", Status: "Pending"}
	mockService.On("GetSalesRekonsiliasiByID", mock.Anything, "sr123").Return(expectedSR, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/sales-rekonsiliasi/sr123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales reconciliation entry retrieved successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_GetSalesRekonsiliasiByID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.GET("/sales-rekonsiliasi/:id", handler.GetSalesRekonsiliasiByID)

	mockService.On("GetSalesRekonsiliasiByID", mock.Anything, "sr123").Return((*entities.SalesRekonsiliasi)(nil), nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/sales-rekonsiliasi/sr123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales reconciliation entry not found", response["error"])
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_UpdateSalesRekonsiliasi(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.PUT("/sales-rekonsiliasi/:id", handler.UpdateSalesRekonsiliasi)

	now := time.Now()
	reqBody := map[string]interface{}{
		"reconciliation_date": now.Format(time.RFC3339),
		"sales_amount":        1000.00,
		"payment_amount":      1000.00,
		"discrepancy":         0.00,
		"status":              "Reconciled",
		"notes":               "Updated reconciliation",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("UpdateSalesRekonsiliasi", mock.Anything, mock.AnythingOfType("*entities.SalesRekonsiliasi")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/sales-rekonsiliasi/sr123", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales reconciliation entry updated successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_UpdateSalesRekonsiliasi_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.PUT("/sales-rekonsiliasi/:id", handler.UpdateSalesRekonsiliasi)

	now := time.Now()
	reqBody := map[string]interface{}{
		"reconciliation_date": now.Format(time.RFC3339),
		"sales_amount":        1000.00,
		"payment_amount":      1000.00,
		"discrepancy":         0.00,
		"status":              "Reconciled",
		"notes":               "Updated reconciliation",
	}
	jsonBody, _ := json.Marshal(reqBody)

	mockService.On("UpdateSalesRekonsiliasi", mock.Anything, mock.AnythingOfType("*entities.SalesRekonsiliasi")).Return(errors.New("service error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/sales-rekonsiliasi/sr123", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "service error", response["error"])
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_DeleteSalesRekonsiliasi(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.DELETE("/sales-rekonsiliasi/:id", handler.DeleteSalesRekonsiliasi)

	mockService.On("DeleteSalesRekonsiliasi", mock.Anything, "sr123").Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/sales-rekonsiliasi/sr123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Sales reconciliation entry deleted successfully", response["message"])
	mockService.AssertExpectations(t)
}

func TestSalesRekonsiliasiHandler_DeleteSalesRekonsiliasi_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := new(MockSalesRekonsiliasiService)
	handler := NewSalesRekonsiliasiHandler(mockService)

	r := gin.Default()
	r.DELETE("/sales-rekonsiliasi/:id", handler.DeleteSalesRekonsiliasi)

	mockService.On("DeleteSalesRekonsiliasi", mock.Anything, "sr123").Return(errors.New("service error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/sales-rekonsiliasi/sr123", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "service error", response["error"])
	mockService.AssertExpectations(t)
}