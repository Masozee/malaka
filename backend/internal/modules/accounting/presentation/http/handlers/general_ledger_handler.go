package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// GeneralLedgerHandler handles HTTP requests for general ledger operations
type GeneralLedgerHandler struct {
	service services.GeneralLedgerService
}

// NewGeneralLedgerHandler creates a new general ledger handler
func NewGeneralLedgerHandler(service services.GeneralLedgerService) *GeneralLedgerHandler {
	return &GeneralLedgerHandler{service: service}
}

// CreateGeneralLedgerEntry handles the creation of a new general ledger entry
func (h *GeneralLedgerHandler) CreateGeneralLedgerEntry(c *gin.Context) {
	var req dto.GeneralLedgerCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := req.Validate(); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Set created_by from context (would come from authentication middleware)
	entry := req.ToGeneralLedgerEntity()
	entry.CreatedBy = c.GetString("user_id") // This would be set by auth middleware

	if err := h.service.CreateEntry(c.Request.Context(), entry); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create general ledger entry", err)
		return
	}

	resp := dto.FromGeneralLedgerEntity(entry)
	response.Success(c, http.StatusCreated, "General ledger entry created successfully", resp)
}

// GetGeneralLedgerEntryByID handles the retrieval of a general ledger entry by ID
func (h *GeneralLedgerHandler) GetGeneralLedgerEntryByID(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", err)
		return
	}

	entry, err := h.service.GetEntryByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "General ledger entry not found", err)
		return
	}

	resp := dto.FromGeneralLedgerEntity(entry)
	response.Success(c, http.StatusOK, "General ledger entry retrieved successfully", resp)
}

// GetAllGeneralLedgerEntries handles the retrieval of all general ledger entries
func (h *GeneralLedgerHandler) GetAllGeneralLedgerEntries(c *gin.Context) {
	entries, err := h.service.GetAllEntries(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve general ledger entries", err)
		return
	}

	resp := dto.FromGeneralLedgerEntities(entries)
	response.Success(c, http.StatusOK, "General ledger entries retrieved successfully", resp)
}

// UpdateGeneralLedgerEntry handles the update of an existing general ledger entry
func (h *GeneralLedgerHandler) UpdateGeneralLedgerEntry(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", err)
		return
	}

	var req dto.GeneralLedgerUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := req.Validate(); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	entry := req.ToGeneralLedgerEntity()
	entry.ID = id

	if err := h.service.UpdateEntry(c.Request.Context(), entry); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update general ledger entry", err)
		return
	}

	resp := dto.FromGeneralLedgerEntity(entry)
	response.Success(c, http.StatusOK, "General ledger entry updated successfully", resp)
}

// DeleteGeneralLedgerEntry handles the deletion of a general ledger entry by ID
func (h *GeneralLedgerHandler) DeleteGeneralLedgerEntry(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", err)
		return
	}

	if err := h.service.DeleteEntry(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete general ledger entry", err)
		return
	}

	response.Success(c, http.StatusOK, "General ledger entry deleted successfully", nil)
}

// GetGeneralLedgerEntriesByAccount handles the retrieval of entries by account ID
func (h *GeneralLedgerHandler) GetGeneralLedgerEntriesByAccount(c *gin.Context) {
	accountIDStr := c.Param("account_id")
	if accountIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Account ID parameter is required", nil)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid account ID format", err)
		return
	}

	entries, err := h.service.GetEntriesByAccount(c.Request.Context(), accountID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve entries by account", err)
		return
	}

	resp := dto.FromGeneralLedgerEntities(entries)
	response.Success(c, http.StatusOK, "General ledger entries retrieved successfully", resp)
}

// GetAccountBalance handles the retrieval of account balance
func (h *GeneralLedgerHandler) GetAccountBalance(c *gin.Context) {
	accountIDStr := c.Param("account_id")
	if accountIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Account ID parameter is required", nil)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid account ID format", err)
		return
	}

	// Get as_of_date from query parameter, default to now
	asOfDateStr := c.Query("as_of_date")
	var asOfDate time.Time
	if asOfDateStr != "" {
		asOfDate, err = time.Parse("2006-01-02", asOfDateStr)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "Invalid as_of_date format (use YYYY-MM-DD)", err)
			return
		}
	} else {
		asOfDate = time.Now()
	}

	balance, err := h.service.GetAccountBalance(c.Request.Context(), accountID, asOfDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve account balance", err)
		return
	}

	resp := dto.AccountBalanceResponse{
		AccountID: accountID,
		Balance:   balance,
		AsOfDate:  asOfDate,
	}

	response.Success(c, http.StatusOK, "Account balance retrieved successfully", resp)
}

// GetLedgerReport handles the generation of a ledger report
func (h *GeneralLedgerHandler) GetLedgerReport(c *gin.Context) {
	accountIDStr := c.Param("account_id")
	if accountIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Account ID parameter is required", nil)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid account ID format", err)
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		response.Error(c, http.StatusBadRequest, "start_date and end_date query parameters are required", nil)
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start_date format (use YYYY-MM-DD)", err)
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end_date format (use YYYY-MM-DD)", err)
		return
	}

	entries, err := h.service.GetLedgerReport(c.Request.Context(), accountID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate ledger report", err)
		return
	}

	// Calculate report totals
	var totalDebits, totalCredits, openingBalance, closingBalance float64
	entryResponses := dto.FromGeneralLedgerEntities(entries)

	for _, entry := range entries {
		totalDebits += entry.DebitAmount
		totalCredits += entry.CreditAmount
	}

	if len(entries) > 0 {
		// Opening balance would be the balance before the first entry
		// Closing balance is the balance of the last entry
		closingBalance = entries[len(entries)-1].Balance
		openingBalance = closingBalance - (totalDebits - totalCredits)
	}

	resp := dto.LedgerReportResponse{
		AccountID:      accountID,
		StartDate:      startDate,
		EndDate:        endDate,
		OpeningBalance: openingBalance,
		ClosingBalance: closingBalance,
		TotalDebits:    totalDebits,
		TotalCredits:   totalCredits,
		EntryCount:     len(entries),
		Entries:        entryResponses,
	}

	response.Success(c, http.StatusOK, "Ledger report generated successfully", resp)
}

// RecalculateAccountBalances handles the recalculation of account balances
func (h *GeneralLedgerHandler) RecalculateAccountBalances(c *gin.Context) {
	accountIDStr := c.Param("account_id")
	if accountIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Account ID parameter is required", nil)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid account ID format", err)
		return
	}

	if err := h.service.RecalculateAccountBalances(c.Request.Context(), accountID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to recalculate account balances", err)
		return
	}

	response.Success(c, http.StatusOK, "Account balances recalculated successfully", nil)
}

// GetGeneralLedgerEntriesByCompany handles the retrieval of entries by company
func (h *GeneralLedgerHandler) GetGeneralLedgerEntriesByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	if companyID == "" {
		response.Error(c, http.StatusBadRequest, "Company ID parameter is required", nil)
		return
	}

	// Optional date range filters
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var entries []*entities.GeneralLedger
	var err error

	if startDateStr != "" && endDateStr != "" {
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "Invalid start_date format (use YYYY-MM-DD)", err)
			return
		}

		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "Invalid end_date format (use YYYY-MM-DD)", err)
			return
		}

		entries, err = h.service.GetEntriesByCompanyAndDateRange(c.Request.Context(), companyID, startDate, endDate)
	} else {
		entries, err = h.service.GetEntriesByCompany(c.Request.Context(), companyID)
	}

	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve general ledger entries", err)
		return
	}

	resp := dto.FromGeneralLedgerEntities(entries)
	response.Success(c, http.StatusOK, "General ledger entries retrieved successfully", resp)
}

// PostJournalToLedger handles posting a journal entry to the general ledger
func (h *GeneralLedgerHandler) PostJournalToLedger(c *gin.Context) {
	journalEntryIDStr := c.Param("journal_entry_id")
	if journalEntryIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Journal entry ID parameter is required", nil)
		return
	}

	journalEntryID, err := uuid.Parse(journalEntryIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid journal entry ID format", err)
		return
	}

	if err := h.service.PostJournalToLedger(c.Request.Context(), journalEntryID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to post journal entry to general ledger", err)
		return
	}

	response.Success(c, http.StatusOK, "Journal entry posted to general ledger successfully", nil)
}

// GetTrialBalance handles getting trial balance data
func (h *GeneralLedgerHandler) GetTrialBalance(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		response.Error(c, http.StatusBadRequest, "Company ID query parameter is required", nil)
		return
	}

	// Get as_of_date from query parameter, default to now
	asOfDateStr := c.Query("as_of_date")
	var asOfDate time.Time
	var err error
	if asOfDateStr != "" {
		asOfDate, err = time.Parse("2006-01-02", asOfDateStr)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "Invalid as_of_date format (use YYYY-MM-DD)", err)
			return
		}
	} else {
		asOfDate = time.Now()
	}

	entries, err := h.service.GetTrialBalanceData(c.Request.Context(), companyID, asOfDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve trial balance data", err)
		return
	}

	resp := dto.FromGeneralLedgerEntities(entries)
	response.Success(c, http.StatusOK, "Trial balance data retrieved successfully", resp)
}