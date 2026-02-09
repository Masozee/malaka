package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// UserHandler handles HTTP requests for users.
type UserHandler struct {
	service *services.UserService
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// Login authenticates a user and returns a JWT token.
func (h *UserHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := h.service.AuthenticateUser(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

// CreateUser handles the creation of a new user.
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	user := &entities.User{
		Username:  req.Username,
		Password:  req.Password,
		Email:     req.Email,
		CompanyID: req.CompanyID,
		Role:      req.Role,
		Status:    req.Status,
	}
	
	// Handle nullable fields
	if req.FullName != "" {
		user.FullName = &req.FullName
	}
	if req.Phone != "" {
		user.Phone = &req.Phone
	}
	
	// Set default values if not provided
	if user.Role == "" {
		user.Role = "user"
	}
	if user.Status == "" {
		user.Status = "active"
	}

	if err := h.service.CreateUser(c.Request.Context(), user); err != nil {
		response.InternalServerError(c, "Failed to create user", err.Error())
		return
	}

	response.Created(c, "User created successfully", user)
}

// GetAllUsers handles retrieving all users.
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.service.GetAllUsers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve users", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Users retrieved successfully", users)
}

// GetUserByID handles retrieving a user by its ID.
func (h *UserHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "Invalid user ID", "User ID is required")
		return
	}

	user, err := h.service.GetUserByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve user", err.Error())
		return
	}
	if user == nil {
		response.NotFound(c, "User not found", "No user found with the given ID")
		return
	}

	response.Success(c, http.StatusOK, "User retrieved successfully", user)
}

// UpdateUser handles updating an existing user.
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "Invalid user ID", "User ID is required")
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// Get existing user first
	existingUser, err := h.service.GetUserByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve user", err.Error())
		return
	}
	if existingUser == nil {
		response.NotFound(c, "User not found", "No user found with the given ID")
		return
	}

	// Create updated user with existing values as defaults
	user := &entities.User{
		Username:  existingUser.Username,
		Password:  existingUser.Password,
		Email:     existingUser.Email,
		FullName:  existingUser.FullName,
		Phone:     existingUser.Phone,
		CompanyID: existingUser.CompanyID,
		Role:      existingUser.Role,
		Status:    existingUser.Status,
		LastLogin: existingUser.LastLogin,
	}
	
	// Set the ID and timestamps
	user.ID = uuid.MustParse(id)
	user.CreatedAt = existingUser.CreatedAt
	user.UpdatedAt = time.Now()

	// Update only provided fields (using pointer checks)
	if req.Username != nil {
		user.Username = *req.Username
	}
	if req.Password != nil {
		user.Password = *req.Password
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.FullName != nil {
		if *req.FullName != "" {
			user.FullName = req.FullName
		} else {
			user.FullName = nil
		}
	}
	if req.Phone != nil {
		if *req.Phone != "" {
			user.Phone = req.Phone
		} else {
			user.Phone = nil
		}
	}
	if req.CompanyID != nil {
		user.CompanyID = *req.CompanyID
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.Status != nil {
		user.Status = *req.Status
	}

	if err := h.service.UpdateUser(c.Request.Context(), user); err != nil {
		response.InternalServerError(c, "Failed to update user", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User updated successfully", user)
}

// DeleteUser handles deleting a user by its ID.
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "Invalid user ID", "User ID is required")
		return
	}

	if err := h.service.DeleteUser(c.Request.Context(), uuid.MustParse(id)); err != nil {
		response.InternalServerError(c, "Failed to delete user", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User deleted successfully", nil)
}