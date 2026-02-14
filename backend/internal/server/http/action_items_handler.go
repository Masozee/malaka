package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// ActionItemsHandler handles the action items endpoint for sidebar badges.
type ActionItemsHandler struct {
	db *sqlx.DB
}

// NewActionItemsHandler creates a new ActionItemsHandler.
func NewActionItemsHandler(db *sqlx.DB) *ActionItemsHandler {
	return &ActionItemsHandler{db: db}
}

// GetActionItems returns counts of items needing attention across modules.
func (h *ActionItemsHandler) GetActionItems(c *gin.Context) {
	ctx := c.Request.Context()

	// Get current user ID for user-specific counts (e.g., unread messages)
	userID, _ := c.Get("user_id")
	userIDStr, _ := userID.(string)

	result := map[string]map[string]int{
		"procurement": {},
		"inventory":   {},
		"hr":          {},
		"accounting":  {},
		"messages":    {},
	}

	// === PROCUREMENT ===

	// Purchase Requests: pending approval
	var prPending int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM purchase_requests WHERE status = 'pending'`,
	).Scan(&prPending); err == nil && prPending > 0 {
		result["procurement"]["purchase-requests"] = prPending
	}

	// Purchase Orders: draft, pending_approval, or sent
	var poPending int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM procurement_purchase_orders WHERE status IN ('draft','pending_approval','sent')`,
	).Scan(&poPending); err == nil && poPending > 0 {
		result["procurement"]["purchase-orders"] = poPending
	}

	// RFQs: draft or overdue (published past due date)
	var rfqPending int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM procurement_rfqs WHERE deleted_at IS NULL AND (status = 'draft' OR (status = 'published' AND due_date < NOW()))`,
	).Scan(&rfqPending); err == nil && rfqPending > 0 {
		result["procurement"]["rfq"] = rfqPending
	}

	// Contracts: draft or expiring within 30 days
	var contractPending int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM contracts WHERE status = 'draft' OR (status = 'active' AND end_date <= NOW() + INTERVAL '30 days')`,
	).Scan(&contractPending); err == nil && contractPending > 0 {
		result["procurement"]["contracts"] = contractPending
	}

	// Vendor Evaluations: draft (needs completion/approval)
	var veDraft int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM vendor_evaluations WHERE status = 'draft'`,
	).Scan(&veDraft); err == nil && veDraft > 0 {
		result["procurement"]["vendor-evaluation"] = veDraft
	}

	// === INVENTORY ===

	// Goods Receipts: draft (not yet posted)
	var grDraft int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM goods_receipts WHERE status = 'DRAFT'`,
	).Scan(&grDraft); err == nil && grDraft > 0 {
		result["inventory"]["goods-receipt"] = grDraft
	}

	// Stock Opname: pending/in_progress
	var soPending int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM stock_opnames WHERE status IN ('pending','in_progress','draft')`,
	).Scan(&soPending); err == nil && soPending > 0 {
		result["inventory"]["stock-opname"] = soPending
	}

	// === HR ===

	// Leave Requests: pending approval
	var leavePending int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'`,
	).Scan(&leavePending); err == nil && leavePending > 0 {
		result["hr"]["leave"] = leavePending
	}

	// === ACCOUNTING ===

	// Journal Entries: draft (not yet posted)
	var jeDraft int
	if err := h.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM journal_entries WHERE status = 'DRAFT'`,
	).Scan(&jeDraft); err == nil && jeDraft > 0 {
		result["accounting"]["journal-entries"] = jeDraft
	}

	// === MESSAGES ===

	// Unread messages for current user
	if userIDStr != "" {
		var unreadCount int
		if err := h.db.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM conversation_participants cp
			 INNER JOIN messages m ON m.conversation_id = cp.conversation_id
			 WHERE cp.user_id = $1
			   AND m.sender_id != $1
			   AND m.deleted_at IS NULL
			   AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)`,
			userIDStr,
		).Scan(&unreadCount); err == nil && unreadCount > 0 {
			result["messages"]["personal-chat"] = unreadCount
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}
