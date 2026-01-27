package handlers

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	accounting_entities "malaka/internal/modules/accounting/domain/entities"
	accounting_services "malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// GoodsReceiptHandler handles HTTP requests for goods receipt operations.
type GoodsReceiptHandler struct {
	service             *services.GoodsReceiptService
	journalEntryService accounting_services.JournalEntryService
	stockService        *services.StockService
	budgetService       accounting_services.BudgetService
}

// NewGoodsReceiptHandler creates a new GoodsReceiptHandler.
func NewGoodsReceiptHandler(service *services.GoodsReceiptService) *GoodsReceiptHandler {
	return &GoodsReceiptHandler{service: service}
}

// SetJournalEntryService sets the journal entry service for auto-posting
func (h *GoodsReceiptHandler) SetJournalEntryService(jes accounting_services.JournalEntryService) {
	h.journalEntryService = jes
}

// SetStockService sets the stock service for stock updates
func (h *GoodsReceiptHandler) SetStockService(ss *services.StockService) {
	h.stockService = ss
}

// SetBudgetService sets the budget service for budget realization
func (h *GoodsReceiptHandler) SetBudgetService(bs accounting_services.BudgetService) {
	h.budgetService = bs
}

// CreateGoodsReceipt handles the creation of a new goods receipt.
func (h *GoodsReceiptHandler) CreateGoodsReceipt(c *gin.Context) {
	var req dto.CreateGoodsReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	gr := &entities.GoodsReceipt{
		PurchaseOrderID: req.PurchaseOrderID,
		ReceiptDate:     utils.Now(),
		WarehouseID:     req.WarehouseID,
	}

	if err := h.service.CreateGoodsReceipt(c.Request.Context(), gr); err != nil {
		response.InternalServerError(c, "Failed to create goods receipt", err.Error())
		return
	}

	response.OK(c, "Goods receipt created successfully", gr)
}

// GetGoodsReceiptByID handles retrieving a goods receipt by its ID.
func (h *GoodsReceiptHandler) GetGoodsReceiptByID(c *gin.Context) {
	id := c.Param("id")
	gr, err := h.service.GetGoodsReceiptByIDWithDetails(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Failed to get goods receipt", err.Error())
		return
	}
	if gr == nil {
		response.NotFound(c, "Goods receipt not found", nil)
		return
	}

	response.OK(c, "Goods receipt retrieved successfully", gr)
}

// GetAllGoodsReceipts handles retrieving all goods receipts.
func (h *GoodsReceiptHandler) GetAllGoodsReceipts(c *gin.Context) {
	grs, err := h.service.GetAllGoodsReceiptsWithDetails(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get all goods receipts", err.Error())
		return
	}

	response.OK(c, "Goods receipts retrieved successfully", grs)
}

// UpdateGoodsReceipt handles updating an existing goods receipt.
func (h *GoodsReceiptHandler) UpdateGoodsReceipt(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateGoodsReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	gr := &entities.GoodsReceipt{
		PurchaseOrderID: req.PurchaseOrderID,
		ReceiptDate:     utils.Now(),
		WarehouseID:     req.WarehouseID,
	}
	gr.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateGoodsReceipt(c.Request.Context(), gr); err != nil {
		response.InternalServerError(c, "Failed to update goods receipt", err.Error())
		return
	}

	response.OK(c, "Goods receipt updated successfully", gr)
}

// DeleteGoodsReceipt handles deleting a goods receipt by its ID.
func (h *GoodsReceiptHandler) DeleteGoodsReceipt(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteGoodsReceipt(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete goods receipt", err.Error())
		return
	}

	response.OK(c, "Goods receipt deleted successfully", nil)
}

// PostGoodsReceipt handles posting a goods receipt, updates stock, and creates a journal entry
func (h *GoodsReceiptHandler) PostGoodsReceipt(c *gin.Context) {
	id := c.Param("id")

	// Get user ID from context (set by auth middleware)
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "system"
	}

	// Post the goods receipt
	gr, err := h.service.PostGoodsReceipt(c.Request.Context(), id, userID)
	if err != nil {
		response.BadRequest(c, "Failed to post goods receipt", err.Error())
		return
	}

	// Update stock for each item if stock service is available
	var stockUpdated int
	if h.stockService != nil && len(gr.Items) > 0 {
		for _, item := range gr.Items {
			stockMovement := &entities.StockMovement{
				ArticleID:    item.ArticleID,
				WarehouseID:  gr.WarehouseID,
				MovementType: "in", // Goods receipt increases stock
				Quantity:     item.Quantity,
				ReferenceID:  gr.ID, // Reference to the GR
				MovementDate: time.Now(),
			}
			if err := h.stockService.RecordStockMovement(c.Request.Context(), stockMovement); err != nil {
				fmt.Printf("Warning: Failed to update stock for item %s: %v\n", item.ArticleID, err)
			} else {
				stockUpdated++
			}
		}
	}

	// Create journal entry if journal service is available
	var journalEntryID string
	var debitAccountID uuid.UUID
	if h.journalEntryService != nil && gr.TotalAmount > 0 {
		je, accountID, err := h.createJournalEntryForGR(c, gr, userID)
		if err != nil {
			// Log the error but don't fail the GR posting
			fmt.Printf("Warning: Failed to create journal entry for GR %s: %v\n", gr.ID, err)
		} else if je != nil {
			journalEntryID = je.ID.String()
			debitAccountID = accountID
			// Update GR with journal entry ID
			if err := h.service.SetJournalEntryID(c.Request.Context(), gr.ID, journalEntryID); err != nil {
				fmt.Printf("Warning: Failed to link journal entry to GR: %v\n", err)
			}
		}
	}

	// Create budget realization if budget service is available
	var budgetRealized bool
	if h.budgetService != nil && gr.TotalAmount > 0 {
		grUUID, err := uuid.Parse(gr.ID)
		if err == nil {
			userUUID, _ := uuid.Parse(userID)
			var poUUID *uuid.UUID
			if gr.PurchaseOrderID != "" {
				parsed, err := uuid.Parse(gr.PurchaseOrderID)
				if err == nil {
					poUUID = &parsed
				}
			}

			// Use the debit account from journal entry for budget realization
			accountID := debitAccountID
			if accountID == uuid.Nil {
				// Fallback to default expense account
				accountID = uuid.MustParse("00000000-0000-0000-0000-000000006000")
			}

			err = h.budgetService.CreateRealizationFromGR(
				c.Request.Context(),
				grUUID,
				gr.GRNumber,
				gr.TotalAmount,
				accountID,
				time.Now(),
				userUUID,
				poUUID,
			)
			if err != nil {
				fmt.Printf("Warning: Failed to create budget realization for GR %s: %v\n", gr.ID, err)
			} else {
				budgetRealized = true
			}
		}
	}

	result := map[string]interface{}{
		"goods_receipt":       gr,
		"journal_entry_id":    journalEntryID,
		"stock_items_updated": stockUpdated,
		"budget_realized":     budgetRealized,
		"message":             "Goods receipt posted successfully",
	}

	response.OK(c, "Goods receipt posted successfully", result)
}

// createJournalEntryForGR creates a journal entry for the posted goods receipt
// Returns the journal entry and the debit account ID (for budget realization)
func (h *GoodsReceiptHandler) createJournalEntryForGR(c *gin.Context, gr *entities.GoodsReceipt, userID string) (*accounting_entities.JournalEntry, uuid.UUID, error) {
	// Determine accounts based on procurement type
	var debitAccountID, creditAccountID uuid.UUID
	var debitDesc, creditDesc string

	switch gr.GetAccountingTreatment() {
	case "COGS":
		// Raw Material: Debit Inventory, Credit AP
		// Using default account IDs - these should be configured
		debitAccountID = uuid.MustParse("00000000-0000-0000-0000-000000001300") // Inventory
		creditAccountID = uuid.MustParse("00000000-0000-0000-0000-000000002100") // AP
		debitDesc = "Inventory - Raw Material Receipt"
		creditDesc = "Accounts Payable - Supplier"
	case "OPEX":
		// Office Supply/Service: Debit Expense, Credit AP
		debitAccountID = uuid.MustParse("00000000-0000-0000-0000-000000006000") // Operating Expense
		creditAccountID = uuid.MustParse("00000000-0000-0000-0000-000000002100") // AP
		debitDesc = "Operating Expense - " + string(gr.ProcurementType)
		creditDesc = "Accounts Payable - Supplier"
	case "CAPITALIZE":
		// Asset: Debit Fixed Asset, Credit AP
		debitAccountID = uuid.MustParse("00000000-0000-0000-0000-000000001500") // Fixed Asset
		creditAccountID = uuid.MustParse("00000000-0000-0000-0000-000000002100") // AP
		debitDesc = "Fixed Asset - Capital Purchase"
		creditDesc = "Accounts Payable - Supplier"
	default:
		debitAccountID = uuid.MustParse("00000000-0000-0000-0000-000000006000") // Default to expense
		creditAccountID = uuid.MustParse("00000000-0000-0000-0000-000000002100") // AP
		debitDesc = "Expense - Goods Receipt"
		creditDesc = "Accounts Payable"
	}

	// Create journal entry
	entry := &accounting_entities.JournalEntry{
		EntryDate:    time.Now(),
		Description:  fmt.Sprintf("Goods Receipt %s - %s", gr.GRNumber, gr.SupplierName),
		Reference:    gr.GRNumber,
		Status:       accounting_entities.JournalEntryStatusDraft,
		CurrencyCode: gr.Currency,
		ExchangeRate: 1.0,
		SourceModule: "INVENTORY",
		SourceID:     gr.ID,
		CompanyID:    "1", // Default company
		CreatedBy:    userID,
		Lines: []*accounting_entities.JournalEntryLine{
			{
				LineNumber:   1,
				AccountID:    debitAccountID,
				DebitAmount:  gr.TotalAmount,
				CreditAmount: 0,
				Description:  debitDesc,
			},
			{
				LineNumber:   2,
				AccountID:    creditAccountID,
				DebitAmount:  0,
				CreditAmount: gr.TotalAmount,
				Description:  creditDesc,
			},
		},
	}

	// Create the journal entry
	if err := h.journalEntryService.CreateJournalEntry(c.Request.Context(), entry); err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to create journal entry: %w", err)
	}

	// Auto-post the journal entry
	if err := h.journalEntryService.PostJournalEntry(c.Request.Context(), entry.ID, userID); err != nil {
		// Don't fail if posting fails, the entry is still created
		fmt.Printf("Warning: Failed to auto-post journal entry: %v\n", err)
	}

	return entry, debitAccountID, nil
}
