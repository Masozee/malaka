package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/auth"
	"malaka/internal/shared/response"
)

// UserHandler handles HTTP requests for user operations.
type UserHandler struct {
	service *services.UserService
	jwtSecret string
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(service *services.UserService, jwtSecret string) *UserHandler {
	return &UserHandler{service: service, jwtSecret: jwtSecret}
}

// CreateUser handles the creation of a new user.
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	user := &entities.User{
		Username:  req.Username,
		Password:  req.Password,
		Email:     req.Email,
		CompanyID: req.CompanyID,
	}

	if err := h.service.CreateUser(c.Request.Context(), user); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "User created successfully", user)
}

// GetUserByID handles retrieving a user by its ID.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")
	user, err := h.service.GetUserByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if user == nil {
		response.NotFound(c, "User not found", nil)
		return
	}

	response.OK(c, "User retrieved successfully", user)
}

// GetAllUsers handles retrieving all users.
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.service.GetAllUsers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Users retrieved successfully", users)
}

// UpdateUser handles updating an existing user.
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	user := &entities.User{
		Username:  req.Username,
		Password:  req.Password,
		Email:     req.Email,
		CompanyID: req.CompanyID,
	}
	user.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateUser(c.Request.Context(), user); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "User updated successfully", user)
}

// DeleteUser handles deleting a user by its ID.
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteUser(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "User deleted successfully", nil)
}

// Login handles user login and returns a JWT token.
func (h *UserHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	user, err := h.service.AuthenticateUser(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	token, err := auth.NewJWT(user.ID, h.jwtSecret, 24) // Token valid for 24 hours
	if err != nil {
		response.InternalServerError(c, "Failed to generate token", nil)
		return
	}

	response.OK(c, "Login successful", gin.H{"token": token})
}
