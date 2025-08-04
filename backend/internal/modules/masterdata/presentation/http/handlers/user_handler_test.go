package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
)

// MockUserService is a mock implementation of UserService for testing.
type MockUserService struct {
	mock.Mock
}

// AuthenticateUser mocks the AuthenticateUser method.
func (m *MockUserService) AuthenticateUser(ctx context.Context, username, password string) (string, error) {
	args := m.Called(ctx, username, password)
	return args.String(0), args.Error(1)
}

// CreateUser mocks the CreateUser method.
func (m *MockUserService) CreateUser(ctx context.Context, user *entities.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

// GetUserByID mocks the GetUserByID method.
func (m *MockUserService) GetUserByID(ctx context.Context, id string) (*entities.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.User), args.Error(1)
}

// GetAllUsers mocks the GetAllUsers method.
func (m *MockUserService) GetAllUsers(ctx context.Context) ([]*entities.User, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entities.User), args.Error(1)
}

// UpdateUser mocks the UpdateUser method.
func (m *MockUserService) UpdateUser(ctx context.Context, user *entities.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

// DeleteUser mocks the DeleteUser method.
func (m *MockUserService) DeleteUser(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestUserHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Successful Login", func(t *testing.T) {
		mockService := new(MockUserService)
		expectedToken := "test-jwt-token"
		mockService.On("AuthenticateUser", mock.AnythingOfType("context.Context"), "testuser", "password123").Return(expectedToken, nil)

		handler := NewUserHandler(mockService)

		r := gin.Default()
		r.POST("/login", handler.Login)

		loginReq := map[string]string{
			"username": "testuser",
			"password": "password123",
		}
		jsonValue, _ := json.Marshal(loginReq)

		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, expectedToken, response["token"])
		mockService.AssertExpectations(t)
	})

	t.Run("Invalid Credentials", func(t *testing.T) {
		mockService := new(MockUserService)
		mockService.On("AuthenticateUser", mock.AnythingOfType("context.Context"), "wronguser", "wrongpass").Return("", errors.New("invalid credentials"))

		handler := NewUserHandler(mockService)

		r := gin.Default()
		r.POST("/login", handler.Login)

		loginReq := map[string]string{
			"username": "wronguser",
			"password": "wrongpass",
		}
		jsonValue, _ := json.Marshal(loginReq)

		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Invalid credentials", response["error"])
		mockService.AssertExpectations(t)
	})

	t.Run("Invalid Request Body", func(t *testing.T) {
		mockService := new(MockUserService)
		handler := NewUserHandler(mockService)

		r := gin.Default()
		r.POST("/login", handler.Login)

		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		mockService.AssertNotCalled(t, "AuthenticateUser", mock.Anything, mock.Anything, mock.Anything)
	})
}