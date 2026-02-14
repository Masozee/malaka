package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type CashBookHandler struct {
	service services.CashBookService
}

func NewCashBookHandler(service services.CashBookService) *CashBookHandler {
	return &CashBookHandler{
		service: service,
	}
}

func (h *CashBookHandler) CreateCashBook(c *gin.Context) {
	var req dto.CreateCashBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	entry := dto.ToCashBookEntity(&req)
	entry.ID = uuid.New()
	entry.CreatedAt = time.Now()
	entry.UpdatedAt = time.Now()

	if err := h.service.CreateCashBook(c.Request.Context(), entry); err != nil {
		response.InternalServerError(c, "Failed to create cash book", err.Error())
		return
	}

	response.Created(c, "Cash book created successfully", dto.ToCashBookResponse(entry))
}

func (h *CashBookHandler) GetCashBookByID(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	entry, err := h.service.GetCashBookByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Cash book not found", err.Error())
		return
	}

	response.OK(c, "Cash book retrieved successfully", dto.ToCashBookResponse(entry))
}

func (h *CashBookHandler) GetAllCashBooks(c *gin.Context) {
	entries, err := h.service.GetAllCashBooks(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve cash books", err.Error())
		return
	}

	var responses []*dto.CashBookResponse
	for _, entry := range entries {
		responses = append(responses, dto.ToCashBookResponse(entry))
	}

	response.OK(c, "Cash books retrieved successfully", responses)
}

func (h *CashBookHandler) UpdateCashBook(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdateCashBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	entry, err := h.service.GetCashBookByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Cash book not found", err.Error())
		return
	}

	entry.BookCode = req.BookCode
	entry.BookName = req.BookName
	entry.BookType = req.BookType
	entry.AccountNumber = req.AccountNumber
	entry.BankName = req.BankName
	entry.OpeningBalance = req.OpeningBalance
	entry.CurrentBalance = req.CurrentBalance
	entry.IsActive = req.IsActive
	entry.UpdatedAt = time.Now()

	if err := h.service.UpdateCashBook(c.Request.Context(), entry); err != nil {
		response.InternalServerError(c, "Failed to update cash book", err.Error())
		return
	}

	response.OK(c, "Cash book updated successfully", dto.ToCashBookResponse(entry))
}

func (h *CashBookHandler) DeleteCashBook(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.DeleteCashBook(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to delete cash book", err.Error())
		return
	}

	response.OK(c, "Cash book deleted successfully", nil)
}

func (h *CashBookHandler) GetCashBooksByType(c *gin.Context) {
	bookType := c.Param("type")

	entries, err := h.service.GetCashBooksByType(c.Request.Context(), bookType)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve cash books by type", err.Error())
		return
	}

	var responses []*dto.CashBookResponse
	for _, entry := range entries {
		responses = append(responses, dto.ToCashBookResponse(entry))
	}

	response.OK(c, "Cash books retrieved successfully", responses)
}
