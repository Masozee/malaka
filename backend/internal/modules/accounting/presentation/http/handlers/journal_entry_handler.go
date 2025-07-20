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

// JournalEntryHandler handles HTTP requests for journal entry operations
type JournalEntryHandler struct {
	service services.JournalEntryService
}

// NewJournalEntryHandler creates a new journal entry handler
func NewJournalEntryHandler(service services.JournalEntryService) *JournalEntryHandler {
	return &JournalEntryHandler{service: service}
}

// CreateJournalEntry handles the creation of a new journal entry
func (h *JournalEntryHandler) CreateJournalEntry(c *gin.Context) {
	var req dto.JournalEntryCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := req.Validate(); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Set created_by from context (would come from authentication middleware)
	entry := req.ToJournalEntryEntity()
	entry.CreatedBy = c.GetString("user_id") // This would be set by auth middleware

	if err := h.service.CreateJournalEntry(c.Request.Context(), entry); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create journal entry", err)
		return
	}

	resp := dto.FromJournalEntryEntity(entry)
	response.Success(c, http.StatusCreated, "Journal entry created successfully", resp)
}

// GetJournalEntryByID handles the retrieval of a journal entry by ID
func (h *JournalEntryHandler) GetJournalEntryByID(c *gin.Context) {
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

	entry, err := h.service.GetJournalEntryByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Journal entry not found", err)
		return
	}

	resp := dto.FromJournalEntryEntity(entry)
	response.Success(c, http.StatusOK, "Journal entry retrieved successfully", resp)
}

// GetAllJournalEntries handles the retrieval of all journal entries
func (h *JournalEntryHandler) GetAllJournalEntries(c *gin.Context) {
	entries, err := h.service.GetAllJournalEntries(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve journal entries", err)
		return
	}

	resp := dto.FromJournalEntryEntities(entries)
	response.Success(c, http.StatusOK, "Journal entries retrieved successfully", resp)
}

// UpdateJournalEntry handles the update of an existing journal entry
func (h *JournalEntryHandler) UpdateJournalEntry(c *gin.Context) {
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

	var req dto.JournalEntryUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := req.Validate(); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	entry := req.ToJournalEntryEntity()
	entry.ID = id

	if err := h.service.UpdateJournalEntry(c.Request.Context(), entry); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update journal entry", err)
		return
	}

	resp := dto.FromJournalEntryEntity(entry)
	response.Success(c, http.StatusOK, "Journal entry updated successfully", resp)
}

// DeleteJournalEntry handles the deletion of a journal entry by ID
func (h *JournalEntryHandler) DeleteJournalEntry(c *gin.Context) {
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

	if err := h.service.DeleteJournalEntry(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete journal entry", err)
		return
	}

	response.Success(c, http.StatusOK, "Journal entry deleted successfully", nil)
}

// PostJournalEntry handles posting a journal entry
func (h *JournalEntryHandler) PostJournalEntry(c *gin.Context) {
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

	var req dto.PostJournalEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		userID = req.UserID
	}

	if err := h.service.PostJournalEntry(c.Request.Context(), id, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to post journal entry", err)
		return
	}

	response.Success(c, http.StatusOK, "Journal entry posted successfully", nil)
}

// ReverseJournalEntry handles reversing a journal entry
func (h *JournalEntryHandler) ReverseJournalEntry(c *gin.Context) {
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

	var req dto.ReverseJournalEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		userID = req.UserID
	}

	if err := h.service.ReverseJournalEntry(c.Request.Context(), id, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to reverse journal entry", err)
		return
	}

	response.Success(c, http.StatusOK, "Journal entry reversed successfully", nil)
}

// GetJournalEntriesByStatus handles the retrieval of journal entries by status
func (h *JournalEntryHandler) GetJournalEntriesByStatus(c *gin.Context) {
	statusStr := c.Query("status")
	if statusStr == "" {
		response.Error(c, http.StatusBadRequest, "Status query parameter is required", nil)
		return
	}

	// Convert string to status enum
	var status entities.JournalEntryStatus
	switch statusStr {
	case "DRAFT":
		status = entities.JournalEntryStatusDraft
	case "POSTED":
		status = entities.JournalEntryStatusPosted
	case "REVERSED":
		status = entities.JournalEntryStatusReversed
	default:
		response.Error(c, http.StatusBadRequest, "Invalid status. Use DRAFT, POSTED, or REVERSED", nil)
		return
	}

	entries, err := h.service.GetJournalEntriesByStatus(c.Request.Context(), status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve journal entries", err)
		return
	}

	resp := dto.FromJournalEntryEntities(entries)
	response.Success(c, http.StatusOK, "Journal entries retrieved successfully", resp)
}

// GetJournalEntriesByDateRange handles the retrieval of journal entries by date range
func (h *JournalEntryHandler) GetJournalEntriesByDateRange(c *gin.Context) {
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

	entries, err := h.service.GetJournalEntriesByDateRange(c.Request.Context(), startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve journal entries", err)
		return
	}

	resp := dto.FromJournalEntryEntities(entries)
	response.Success(c, http.StatusOK, "Journal entries retrieved successfully", resp)
}

// GetJournalEntriesByCompany handles the retrieval of journal entries by company
func (h *JournalEntryHandler) GetJournalEntriesByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	if companyID == "" {
		response.Error(c, http.StatusBadRequest, "Company ID parameter is required", nil)
		return
	}

	entries, err := h.service.GetJournalEntriesByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve journal entries", err)
		return
	}

	resp := dto.FromJournalEntryEntities(entries)
	response.Success(c, http.StatusOK, "Journal entries retrieved successfully", resp)
}

// GetUnpostedEntries handles the retrieval of unposted journal entries
func (h *JournalEntryHandler) GetUnpostedEntries(c *gin.Context) {
	companyID := c.Param("company_id")
	if companyID == "" {
		response.Error(c, http.StatusBadRequest, "Company ID parameter is required", nil)
		return
	}

	entries, err := h.service.GetUnpostedEntries(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve unposted entries", err)
		return
	}

	resp := dto.FromJournalEntryEntities(entries)
	response.Success(c, http.StatusOK, "Unposted entries retrieved successfully", resp)
}

// GetJournalRegister handles the generation of a journal register report
func (h *JournalEntryHandler) GetJournalRegister(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		response.Error(c, http.StatusBadRequest, "company_id query parameter is required", nil)
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

	entries, err := h.service.GetJournalRegister(c.Request.Context(), companyID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate journal register", err)
		return
	}

	// Calculate totals for the report
	var totalDebits, totalCredits float64
	postedEntries := 0
	unpostedEntries := 0

	for _, entry := range entries {
		totalDebits += entry.TotalDebit
		totalCredits += entry.TotalCredit
		if entry.Status == entities.JournalEntryStatusPosted {
			postedEntries++
		} else {
			unpostedEntries++
		}
	}

	resp := dto.JournalRegisterResponse{
		CompanyID:       companyID,
		StartDate:       startDate,
		EndDate:         endDate,
		TotalEntries:    len(entries),
		TotalDebits:     totalDebits,
		TotalCredits:    totalCredits,
		PostedEntries:   postedEntries,
		UnpostedEntries: unpostedEntries,
		Entries:         dto.FromJournalEntryEntities(entries),
	}

	response.Success(c, http.StatusOK, "Journal register generated successfully", resp)
}

// AddLineToJournalEntry handles adding a line to a journal entry
func (h *JournalEntryHandler) AddLineToJournalEntry(c *gin.Context) {
	entryIDStr := c.Param("id")
	if entryIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Entry ID parameter is required", nil)
		return
	}

	entryID, err := uuid.Parse(entryIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid entry ID format", err)
		return
	}

	var req dto.JournalEntryLineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := req.Validate(); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	line := &entities.JournalEntryLine{
		LineNumber:   req.LineNumber,
		AccountID:    req.AccountID,
		Description:  req.Description,
		DebitAmount:  req.DebitAmount,
		CreditAmount: req.CreditAmount,
	}

	if err := h.service.AddLine(c.Request.Context(), entryID, line); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to add line to journal entry", err)
		return
	}

	response.Success(c, http.StatusCreated, "Line added to journal entry successfully", nil)
}