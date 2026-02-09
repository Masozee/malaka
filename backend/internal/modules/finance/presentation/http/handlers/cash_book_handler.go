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

func (h *CashBookHandler) CreateCashBookEntry(c *gin.Context) {
	var req dto.CreateCashBookEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	// Validate that either debit or credit amount is provided, but not both
	if (req.DebitAmount > 0 && req.CreditAmount > 0) || (req.DebitAmount == 0 && req.CreditAmount == 0) {
		response.BadRequest(c, "Invalid amounts", "Either debit_amount or credit_amount must be provided, but not both")
		return
	}

	entry := dto.ToCashBookEntity(&req)
	entry.ID = uuid.New()
	entry.CreatedAt = time.Now()
	entry.UpdatedAt = time.Now()

	if err := h.service.CreateCashBookEntry(c.Request.Context(), entry); err != nil {
		response.InternalServerError(c, "Failed to create cash book entry", err.Error())
		return
	}

	response.Created(c, "Cash book entry created successfully", dto.ToCashBookEntryResponse(entry))
}

func (h *CashBookHandler) GetCashBookEntryByID(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	entry, err := h.service.GetCashBookEntryByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Cash book entry not found", err.Error())
		return
	}

	response.OK(c, "Cash book entry retrieved successfully", dto.ToCashBookEntryResponse(entry))
}

func (h *CashBookHandler) GetAllCashBookEntries(c *gin.Context) {
	entries, err := h.service.GetAllCashBookEntries(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve cash book entries", err.Error())
		return
	}

	var responses []*dto.CashBookEntryResponse
	for _, entry := range entries {
		responses = append(responses, dto.ToCashBookEntryResponse(entry))
	}

	response.OK(c, "Cash book entries retrieved successfully", responses)
}

func (h *CashBookHandler) UpdateCashBookEntry(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdateCashBookEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	// Validate that either debit or credit amount is provided, but not both
	if (req.DebitAmount > 0 && req.CreditAmount > 0) || (req.DebitAmount == 0 && req.CreditAmount == 0) {
		response.BadRequest(c, "Invalid amounts", "Either debit_amount or credit_amount must be provided, but not both")
		return
	}

	entry, err := h.service.GetCashBookEntryByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Cash book entry not found", err.Error())
		return
	}

	parsedCashBankID, err := uuid.Parse(req.CashBankID)
	if err != nil {
		response.BadRequest(c, "Invalid CashBankID", err.Error())
		return
	}

	parsedSourceID, err := uuid.Parse(req.SourceID)
	if err != nil {
		response.BadRequest(c, "Invalid SourceID", err.Error())
		return
	}

	parsedCreatedBy, err := uuid.Parse(req.CreatedBy)
	if err != nil {
		response.BadRequest(c, "Invalid CreatedBy", err.Error())
		return
	}

	entry.CashBankID = parsedCashBankID
	entry.TransactionDate = req.TransactionDate
	entry.ReferenceNumber = req.ReferenceNumber
	entry.Description = req.Description
	entry.DebitAmount = req.DebitAmount
	entry.CreditAmount = req.CreditAmount
	entry.TransactionType = req.TransactionType
	entry.SourceModule = req.SourceModule
	entry.SourceID = parsedSourceID
	entry.CreatedBy = parsedCreatedBy
	entry.UpdatedAt = time.Now()

	if err := h.service.UpdateCashBookEntry(c.Request.Context(), entry); err != nil {
		response.InternalServerError(c, "Failed to update cash book entry", err.Error())
		return
	}

	response.OK(c, "Cash book entry updated successfully", dto.ToCashBookEntryResponse(entry))
}

func (h *CashBookHandler) DeleteCashBookEntry(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.DeleteCashBookEntry(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to delete cash book entry", err.Error())
		return
	}

	response.OK(c, "Cash book entry deleted successfully", nil)
}

func (h *CashBookHandler) GetCashBookEntriesByCashBank(c *gin.Context) {
	cashBankID := c.Param("cash_bank_id")

	parsedCashBankID, err := uuid.Parse(cashBankID)
	if err != nil {
		response.BadRequest(c, "Invalid cash bank ID", err.Error())
		return
	}

	entries, err := h.service.GetCashBookEntriesByCashBank(c.Request.Context(), parsedCashBankID)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve cash book entries", err.Error())
		return
	}

	var responses []*dto.CashBookEntryResponse
	for _, entry := range entries {
		responses = append(responses, dto.ToCashBookEntryResponse(entry))
	}

	response.OK(c, "Cash book entries retrieved successfully", responses)
}

func (h *CashBookHandler) GetCashBookEntriesByType(c *gin.Context) {
	transactionType := c.Param("type")

	entries, err := h.service.GetCashBookEntriesByType(c.Request.Context(), transactionType)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve cash book entries by type", err.Error())
		return
	}

	var responses []*dto.CashBookEntryResponse
	for _, entry := range entries {
		responses = append(responses, dto.ToCashBookEntryResponse(entry))
	}

	response.OK(c, "Cash book entries retrieved successfully", responses)
}

func (h *CashBookHandler) GetCashBalance(c *gin.Context) {
	cashBankID := c.Param("cash_bank_id")

	parsedCashBankID, err := uuid.Parse(cashBankID)
	if err != nil {
		response.BadRequest(c, "Invalid cash bank ID", err.Error())
		return
	}

	balance, err := h.service.GetCashBalance(c.Request.Context(), parsedCashBankID)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve cash balance", err.Error())
		return
	}

	balanceResponse := &dto.CashBalanceResponse{
		CashBankID: cashBankID,
		Balance:    balance,
		AsOfDate:   time.Now().Format("2006-01-02"),
	}

	response.OK(c, "Cash balance retrieved successfully", balanceResponse)
}

func (h *CashBookHandler) RecalculateBalances(c *gin.Context) {
	cashBankID := c.Param("cash_bank_id")

	parsedCashBankID, err := uuid.Parse(cashBankID)
	if err != nil {
		response.BadRequest(c, "Invalid cash bank ID", err.Error())
		return
	}

	if err := h.service.RecalculateBalances(c.Request.Context(), parsedCashBankID); err != nil {
		response.InternalServerError(c, "Failed to recalculate balances", err.Error())
		return
	}

	response.OK(c, "Balances recalculated successfully", nil)
}