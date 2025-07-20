package http

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/presentation/http/dtos"
)

// MockChartOfAccountService is a mock implementation of services.ChartOfAccountService
type MockChartOfAccountService struct {
	mock.Mock
}

func (m *MockChartOfAccountService) CreateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error {
	args := m.Called(ctx, coa)
	return args.Error(0)
}

func (m *MockChartOfAccountService) GetChartOfAccountByID(ctx context.Context, id uuid.UUID) (*entities.ChartOfAccount, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.ChartOfAccount), args.Error(1)
}

func (m *MockChartOfAccountService) GetChartOfAccountByCode(ctx context.Context, code string) (*entities.ChartOfAccount, error) {
	args := m.Called(ctx, code)
	return args.Get(0).(*entities.ChartOfAccount), args.Error(1)
}

func (m *MockChartOfAccountService) GetAllChartOfAccounts(ctx context.Context) ([]*entities.ChartOfAccount, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*entities.ChartOfAccount), args.Error(1)
}

func (m *MockChartOfAccountService) UpdateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error {
	args := m.Called(ctx, coa)
	return args.Error(0)
}

func (m *MockChartOfAccountService) DeleteChartOfAccount(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

func TestChartOfAccountHandler_CreateChartOfAccount(t *testing.T) {
	mockService := new(MockChartOfAccountService)
	handler := NewChartOfAccountHandler(mockService)

	r := setupRouter()
	r.POST("/accounting/chart-of-accounts", handler.CreateChartOfAccount)

	var apiResponse struct {
		Success bool        `json:"success"`
		Message string      `json:"message"`
		Data    interface{} `json:"data"`
	}

	// Test case 1: Successful creation
	createReq := dtos.CreateChartOfAccountRequest{
		AccountCode:   "101",
		AccountName:   "Cash",
		AccountType:   "Asset",
		NormalBalance: "Debit",
		IsActive:      true,
	}
	coaEntity := &entities.ChartOfAccount{
		ID:            uuid.New(),
		AccountCode:   createReq.AccountCode,
		AccountName:   createReq.AccountName,
		AccountType:   createReq.AccountType,
		NormalBalance: createReq.NormalBalance,
		IsActive:      createReq.IsActive,
	}
	mockService.On("CreateChartOfAccount", mock.Anything, mock.AnythingOfType("*entities.ChartOfAccount")).Return(nil).Run(func(args mock.Arguments) {
		argCoa := args.Get(1).(*entities.ChartOfAccount)
		*argCoa = *coaEntity // Simulate ID and timestamps being set by service
	}).Once()

	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest(http.MethodPost, "/accounting/chart-of-accounts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of account created successfully", apiResponse.Message)
	assert.NotNil(t, apiResponse.Data)
	mockService.AssertExpectations(t)

	// Test case 2: Invalid request body
	req, _ = http.NewRequest(http.MethodPost, "/accounting/chart-of-accounts", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Contains(t, apiResponse.Message, "invalid character")
	mockService.AssertExpectations(t)

	// Test case 3: Service error
	createReq = dtos.CreateChartOfAccountRequest{
		AccountCode:   "102",
		AccountName:   "Bank",
		AccountType:   "Asset",
		NormalBalance: "Debit",
		IsActive:      true,
	}
	mockService.On("CreateChartOfAccount", mock.Anything, mock.AnythingOfType("*entities.ChartOfAccount")).Return(errors.New("service error")).Once()

	body, _ = json.Marshal(createReq)
	req, _ = http.NewRequest(http.MethodPost, "/accounting/chart-of-accounts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "service error", apiResponse.Message)
	mockService.AssertExpectations(t)
}

func TestChartOfAccountHandler_GetChartOfAccountByID(t *testing.T) {
	mockService := new(MockChartOfAccountService)
	handler := NewChartOfAccountHandler(mockService)

	r := setupRouter()
	r.GET("/accounting/chart-of-accounts/:id", handler.GetChartOfAccountByID)

	// Test case 1: Successful retrieval
	id := uuid.New()
	expectedCoa := &entities.ChartOfAccount{ID: id, AccountCode: "101", AccountName: "Cash"}
	mockService.On("GetChartOfAccountByID", mock.Anything, id).Return(expectedCoa, nil).Once()

	req, _ := http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts/"+id.String(), nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var apiResponse struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Data    dtos.ChartOfAccountResponse `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of account retrieved successfully", apiResponse.Message)
	assert.Equal(t, expectedCoa.ID.String(), apiResponse.Data.ID.String())
	mockService.AssertExpectations(t)

	// Test case 2: Invalid ID
	req, _ = http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts/invalid-uuid", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	json.Unmarshal(w.Body.Bytes(), &res)
	assert.Equal(t, "Invalid Chart of Account ID", apiResponse.Message)
	mockService.AssertExpectations(t)

	// Test case 3: Not found
	id = uuid.New()
	mockService.On("GetChartOfAccountByID", mock.Anything, id).Return((*entities.ChartOfAccount)(nil), nil).Once()

	req, _ = http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts/"+id.String(), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of Account not found", apiResponse.Message)
	mockService.AssertExpectations(t)

	// Test case 4: Service error
	id = uuid.New()
	mockService.On("GetChartOfAccountByID", mock.Anything, id).Return((*entities.ChartOfAccount)(nil), errors.New("service error")).Once()

	req, _ = http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts/"+id.String(), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "service error", apiResponse.Message)
	mockService.AssertExpectations(t)
}

func TestChartOfAccountHandler_GetAllChartOfAccounts(t *testing.T) {
	mockService := new(MockChartOfAccountService)
	handler := NewChartOfAccountHandler(mockService)

	r := setupRouter()
	r.GET("/accounting/chart-of-accounts", handler.GetAllChartOfAccounts)

	// Test case 1: Successful retrieval of multiple COAs
	expectedCoas := []*entities.ChartOfAccount{
		{ID: uuid.New(), AccountCode: "101", AccountName: "Cash"},
		{ID: uuid.New(), AccountCode: "102", AccountName: "Bank"},
	}
	mockService.On("GetAllChartOfAccounts", mock.Anything).Return(expectedCoas, nil).Once()

	req, _ := http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var apiResponse struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Data    []dtos.ChartOfAccountResponse `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of accounts retrieved successfully", apiResponse.Message)
	assert.Len(t, apiResponse.Data, 2)
	assert.Equal(t, expectedCoas[0].ID.String(), apiResponse.Data[0].ID.String())
	mockService.AssertExpectations(t)

	// Test case 2: No COAs found (empty list)
	mockService.On("GetAllChartOfAccounts", mock.Anything).Return([]*entities.ChartOfAccount{}, nil).Once()

	req, _ = http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of accounts retrieved successfully", apiResponse.Message)
	assert.Len(t, apiResponse.Data, 0)
	mockService.AssertExpectations(t)

	// Test case 3: Service error
	mockService.On("GetAllChartOfAccounts", mock.Anything).Return([]*entities.ChartOfAccount{}, errors.New("service error")).Once()

	req, _ = http.NewRequest(http.MethodGet, "/accounting/chart-of-accounts", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "service error", apiResponse.Message)
	mockService.AssertExpectations(t)
}

func TestChartOfAccountHandler_UpdateChartOfAccount(t *testing.T) {
	mockService := new(MockChartOfAccountService)
	handler := NewChartOfAccountHandler(mockService)

	r := setupRouter()
	r.PUT("/accounting/chart-of-accounts/:id", handler.UpdateChartOfAccount)

	// Test case 1: Successful update
	id := uuid.New()
	updateReq := dtos.UpdateChartOfAccountRequest{
		AccountCode:   "101-updated",
		AccountName:   "Cash Updated",
		AccountType:   "Asset",
		NormalBalance: "Debit",
		IsActive:      false,
	}
	coaEntity := &entities.ChartOfAccount{
		ID:            id,
		AccountCode:   updateReq.AccountCode,
		AccountName:   updateReq.AccountName,
		AccountType:   updateReq.AccountType,
		NormalBalance: updateReq.NormalBalance,
		IsActive:      updateReq.IsActive,
	}
	mockService.On("UpdateChartOfAccount", mock.Anything, mock.AnythingOfType("*entities.ChartOfAccount")).Return(nil).Run(func(args mock.Arguments) {
		argCoa := args.Get(1).(*entities.ChartOfAccount)
		*argCoa = *coaEntity // Simulate updated fields
	}).Once()

	body, _ := json.Marshal(updateReq)
	req, _ := http.NewRequest(http.MethodPut, "/accounting/chart-of-accounts/"+id.String(), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var apiResponse struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Data    dtos.ChartOfAccountResponse `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of account updated successfully", apiResponse.Message)
	assert.Equal(t, coaEntity.AccountName, apiResponse.Data.AccountName)
	mockService.AssertExpectations(t)

	// Test case 2: Invalid ID
	req, _ = http.NewRequest(http.MethodPut, "/accounting/chart-of-accounts/invalid-uuid", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	json.Unmarshal(w.Body.Bytes(), &res)
	assert.Equal(t, "Invalid Chart of Account ID", apiResponse.Message)
	mockService.AssertExpectations(t)

	// Test case 3: Invalid request body
	req, _ = http.NewRequest(http.MethodPut, "/accounting/chart-of-accounts/"+id.String(), bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Contains(t, apiResponse.Message, "invalid character")
	mockService.AssertExpectations(t)

	// Test case 4: Service error
	id = uuid.New()
	mockService.On("UpdateChartOfAccount", mock.Anything, mock.AnythingOfType("*entities.ChartOfAccount")).Return(errors.New("service error")).Once()

	body, _ = json.Marshal(updateReq)
	req, _ = http.NewRequest(http.MethodPut, "/accounting/chart-of-accounts/"+id.String(), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "service error", apiResponse.Message)
	mockService.AssertExpectations(t)
}

func TestChartOfAccountHandler_DeleteChartOfAccount(t *testing.T) {
	mockService := new(MockChartOfAccountService)
	handler := NewChartOfAccountHandler(mockService)

	r := setupRouter()
	r.DELETE("/accounting/chart-of-accounts/:id", handler.DeleteChartOfAccount)

	// Test case 1: Successful deletion
	id := uuid.New()
	mockService.On("DeleteChartOfAccount", mock.Anything, id).Return(nil).Once()

	req, _ := http.NewRequest(http.MethodDelete, "/accounting/chart-of-accounts/"+id.String(), nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var apiResponse struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Data    dtos.ChartOfAccountResponse `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "Chart of account retrieved successfully", apiResponse.Message)
	assert.Equal(t, expectedCoa.ID.String(), apiResponse.Data.ID.String())
	mockService.AssertExpectations(t)

	// Test case 2: Invalid ID
	req, _ = http.NewRequest(http.MethodDelete, "/accounting/chart-of-accounts/invalid-uuid", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	json.Unmarshal(w.Body.Bytes(), &res)
	assert.Equal(t, "Invalid Chart of Account ID", apiResponse.Message)
	mockService.AssertExpectations(t)

	// Test case 3: Service error
	id = uuid.New()
	mockService.On("DeleteChartOfAccount", mock.Anything, id).Return(errors.New("service error")).Once()

	req, _ = http.NewRequest(http.MethodDelete, "/accounting/chart-of-accounts/"+id.String(), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	json.Unmarshal(w.Body.Bytes(), &apiResponse)
	assert.Equal(t, "service error", apiResponse.Message)
	mockService.AssertExpectations(t)
}
