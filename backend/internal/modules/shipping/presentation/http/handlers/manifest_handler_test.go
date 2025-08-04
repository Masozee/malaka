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

	shipping_domain "malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/presentation/http/handlers"
	"malaka/internal/shared/response"
)

// MockManifestService is a mock type for the ManifestService type
type MockManifestService struct {
	mock.Mock
}

func (m *MockManifestService) CreateManifest(ctx context.Context, req *dtos.CreateManifestRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockManifestService) GetManifestByID(ctx context.Context, id uuid.UUID) (*shipping_shipping_domain.Manifest, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*shipping_shipping_domain.Manifest), args.Error(1)
}

func (m *MockManifestService) GetAllManifests(ctx context.Context) ([]shipping_shipping_domain.Manifest, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]shipping_shipping_domain.Manifest), args.Error(1)
}

func (m *MockManifestService) UpdateManifest(ctx context.Context, req *dtos.UpdateManifestRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockManifestService) DeleteManifest(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestManifestHandler_CreateManifest(t *testing.T) {
	mockService := new(MockManifestService)
	handler := handlers.NewManifestHandler(mockService)
	router := setupManifestRouter()
	router.POST("/shipping/manifests", handler.CreateManifest)

	t.Run("Success", func(t *testing.T) {
		reqDTO := dtos.CreateManifestRequest{
			// Populate with valid data
		}
		mockService.On("CreateManifest", mock.Anything, &reqDTO).Return(nil).Once()

		body, _ := json.Marshal(reqDTO)
		req, _ := http.NewRequest(http.MethodPost, "/shipping/manifests", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Invalid Request Body", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodPost, "/shipping/manifests", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestManifestHandler_GetManifestByID(t *testing.T) {
	mockService := new(MockManifestService)
	handler := handlers.NewManifestHandler(mockService)
	router := setupManifestRouter()
	router.GET("/shipping/manifests/:id", handler.GetManifestByID)

	t.Run("Success", func(t *testing.T) {
		manifestID := uuid.New()
		manifest := &shipping_shipping_domain.Manifest{ID: manifestID, ManifestNumber: "MAN123"}
		mockService.On("GetManifestByID", mock.Anything, manifestID).Return(manifest, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/manifests/"+manifestID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp response.Response
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NotNil(t, resp.Data)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		manifestID := uuid.New()
		mockService.On("GetManifestByID", mock.Anything, manifestID).Return(nil, assert.AnError).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/manifests/"+manifestID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestManifestHandler_GetAllManifests(t *testing.T) {
	mockService := new(MockManifestService)
	handler := handlers.NewManifestHandler(mockService)
	router := setupManifestRouter()
	router.GET("/shipping/manifests", handler.GetAllManifests)

	t.Run("Success", func(t *testing.T) {
				manifests := []shipping_shipping_domain.Manifest{
			{ID: uuid.New(), ManifestNumber: "MAN123"},
			{ID: uuid.New(), ManifestNumber: "MAN456"},
		}
		mockService.On("GetAllManifests", mock.Anything).Return(manifests, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shipping/manifests", nil)
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

func TestManifestHandler_UpdateManifest(t *testing.T) {
	mockService := new(MockManifestService)
	handler := handlers.NewManifestHandler(mockService)
	router := setupManifestRouter()
	router.PUT("/shipping/manifests/:id", handler.UpdateManifest)

	manifestID := uuid.New()
	updateDTO := dtos.UpdateManifestRequest{
		ID: manifestID,
		// Populate with valid data
	}

	t.Run("Success", func(t *testing.T) {
		mockService.On("UpdateManifest", mock.Anything, &updateDTO).Return(nil).Once()

		body, _ := json.Marshal(updateDTO)
		req, _ := http.NewRequest(http.MethodPut, "/shipping/manifests/"+manifestID.String(), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockService.On("UpdateManifest", mock.Anything, &updateDTO).Return(assert.AnError).Once()

		body, _ := json.Marshal(updateDTO)
		req, _ := http.NewRequest(http.MethodPut, "/shipping/manifests/"+manifestID.String(), bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestManifestHandler_DeleteManifest(t *testing.T) {
	mockService := new(MockManifestService)
	handler := handlers.NewManifestHandler(mockService)
	router := setupManifestRouter()
	router.DELETE("/shipping/manifests/:id", handler.DeleteManifest)

	manifestID := uuid.New()

	t.Run("Success", func(t *testing.T) {
		mockService.On("DeleteManifest", mock.Anything, manifestID).Return(nil).Once()

		req, _ := http.NewRequest(http.MethodDelete, "/shipping/manifests/"+manifestID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockService.On("DeleteManifest", mock.Anything, manifestID).Return(assert.AnError).Once()

		req, _ := http.NewRequest(http.MethodDelete, "/shipping/manifests/"+manifestID.String(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		mockService.AssertExpectations(t)
	})
}
