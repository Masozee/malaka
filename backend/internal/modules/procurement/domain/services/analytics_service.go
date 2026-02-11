package services

import (
	"context"

	"github.com/jmoiron/sqlx"
)

// AnalyticsService provides procurement analytics.
type AnalyticsService struct {
	db *sqlx.DB
}

// NewAnalyticsService creates a new AnalyticsService.
func NewAnalyticsService(db *sqlx.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

// ProcurementOverview contains the dashboard summary data.
type ProcurementOverview struct {
	// Purchase Request stats
	TotalPurchaseRequests   int64   `json:"total_purchase_requests"`
	PendingPurchaseRequests int64   `json:"pending_purchase_requests"`
	ApprovedPurchaseRequests int64  `json:"approved_purchase_requests"`

	// Purchase Order stats
	TotalPurchaseOrders   int64   `json:"total_purchase_orders"`
	DraftPurchaseOrders   int64   `json:"draft_purchase_orders"`
	PendingApprovalOrders int64   `json:"pending_approval_orders"`
	SentPurchaseOrders    int64   `json:"sent_purchase_orders"`
	ReceivedPurchaseOrders int64  `json:"received_purchase_orders"`

	// Financial stats
	TotalPOValue      float64 `json:"total_po_value"`
	TotalPRValue      float64 `json:"total_pr_value"`
	PendingPayments   float64 `json:"pending_payments"`

	// Contract stats
	TotalContracts     int64 `json:"total_contracts"`
	ActiveContracts    int64 `json:"active_contracts"`
	ExpiringContracts  int64 `json:"expiring_contracts"`

	// Vendor stats
	TotalVendorEvaluations int64   `json:"total_vendor_evaluations"`
	AverageVendorScore     float64 `json:"average_vendor_score"`

	// Top Suppliers
	TopSuppliers []TopSupplier `json:"top_suppliers"`

	// Recent Activity
	RecentPurchaseOrders []RecentPO `json:"recent_purchase_orders"`
}

// TopSupplier represents a top supplier by order value.
type TopSupplier struct {
	SupplierID   string  `json:"supplier_id" db:"supplier_id"`
	SupplierName string  `json:"supplier_name" db:"supplier_name"`
	TotalOrders  int64   `json:"total_orders" db:"total_orders"`
	TotalValue   float64 `json:"total_value" db:"total_value"`
}

// RecentPO represents a recent purchase order.
type RecentPO struct {
	ID           string  `json:"id" db:"id"`
	PONumber     string  `json:"po_number" db:"po_number"`
	SupplierName string  `json:"supplier_name" db:"supplier_name"`
	TotalAmount  float64 `json:"total_amount" db:"total_amount"`
	Status       string  `json:"status" db:"status"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
}

// GetOverview retrieves the procurement dashboard overview.
// Consolidated from 17 separate queries into 3 queries using CTEs.
func (s *AnalyticsService) GetOverview(ctx context.Context) (*ProcurementOverview, error) {
	overview := &ProcurementOverview{}

	// Query 1: All scalar stats in a single query using sub-selects
	type overviewStats struct {
		TotalPR      int64   `db:"total_pr"`
		PendingPR    int64   `db:"pending_pr"`
		ApprovedPR   int64   `db:"approved_pr"`
		TotalPO      int64   `db:"total_po"`
		DraftPO      int64   `db:"draft_po"`
		PendingPO    int64   `db:"pending_po"`
		SentPO       int64   `db:"sent_po"`
		ReceivedPO   int64   `db:"received_po"`
		TotalPOValue float64 `db:"total_po_value"`
		TotalPRValue float64 `db:"total_pr_value"`
		PendingPay   float64 `db:"pending_payments"`
		TotalContr   int64   `db:"total_contracts"`
		ActiveContr  int64   `db:"active_contracts"`
		ExpiringC    int64   `db:"expiring_contracts"`
		TotalEvals   int64   `db:"total_evaluations"`
		AvgScore     float64 `db:"avg_score"`
	}
	var stats overviewStats
	err := s.db.GetContext(ctx, &stats, `
		SELECT
			(SELECT COUNT(*) FROM purchase_requests) as total_pr,
			(SELECT COUNT(*) FROM purchase_requests WHERE status = 'pending') as pending_pr,
			(SELECT COUNT(*) FROM purchase_requests WHERE status = 'approved') as approved_pr,
			(SELECT COUNT(*) FROM procurement_purchase_orders) as total_po,
			(SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'draft') as draft_po,
			(SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'pending_approval') as pending_po,
			(SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'sent') as sent_po,
			(SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'received') as received_po,
			(SELECT COALESCE(SUM(total_amount), 0) FROM procurement_purchase_orders) as total_po_value,
			(SELECT COALESCE(SUM(total_amount), 0) FROM purchase_requests) as total_pr_value,
			(SELECT COALESCE(SUM(total_amount), 0) FROM procurement_purchase_orders
			 WHERE payment_status IN ('unpaid', 'partial') AND status != 'cancelled') as pending_payments,
			(SELECT COUNT(*) FROM contracts) as total_contracts,
			(SELECT COUNT(*) FROM contracts WHERE status = 'active') as active_contracts,
			(SELECT COUNT(*) FROM contracts
			 WHERE status = 'active' AND end_date <= NOW() + INTERVAL '30 days') as expiring_contracts,
			(SELECT COUNT(*) FROM vendor_evaluations) as total_evaluations,
			(SELECT COALESCE(AVG(overall_score), 0) FROM vendor_evaluations) as avg_score
	`)
	if err != nil {
		return nil, err
	}

	overview.TotalPurchaseRequests = stats.TotalPR
	overview.PendingPurchaseRequests = stats.PendingPR
	overview.ApprovedPurchaseRequests = stats.ApprovedPR
	overview.TotalPurchaseOrders = stats.TotalPO
	overview.DraftPurchaseOrders = stats.DraftPO
	overview.PendingApprovalOrders = stats.PendingPO
	overview.SentPurchaseOrders = stats.SentPO
	overview.ReceivedPurchaseOrders = stats.ReceivedPO
	overview.TotalPOValue = stats.TotalPOValue
	overview.TotalPRValue = stats.TotalPRValue
	overview.PendingPayments = stats.PendingPay
	overview.TotalContracts = stats.TotalContr
	overview.ActiveContracts = stats.ActiveContr
	overview.ExpiringContracts = stats.ExpiringC
	overview.TotalVendorEvaluations = stats.TotalEvals
	overview.AverageVendorScore = stats.AvgScore

	// Query 2: Top Suppliers
	topSuppliers := []TopSupplier{}
	err = s.db.SelectContext(ctx, &topSuppliers, `
		SELECT po.supplier_id, COALESCE(s.name, 'Unknown') as supplier_name,
		       COUNT(*) as total_orders, COALESCE(SUM(po.total_amount), 0) as total_value
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		WHERE po.supplier_id IS NOT NULL
		GROUP BY po.supplier_id, s.name ORDER BY total_value DESC LIMIT 5`)
	if err != nil {
		return nil, err
	}
	overview.TopSuppliers = topSuppliers

	// Query 3: Recent Purchase Orders
	recentPOs := []RecentPO{}
	err = s.db.SelectContext(ctx, &recentPOs, `
		SELECT po.id, po.po_number, COALESCE(s.name, 'Unknown') as supplier_name,
		       po.total_amount, po.status, TO_CHAR(po.created_at, 'YYYY-MM-DD HH24:MI') as created_at
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		ORDER BY po.created_at DESC LIMIT 5`)
	if err != nil {
		return nil, err
	}
	overview.RecentPurchaseOrders = recentPOs

	return overview, nil
}

// SpendAnalytics contains spend analysis data.
type SpendAnalytics struct {
	TotalSpend        float64              `json:"total_spend"`
	SpendBySupplier   []SpendBySupplier    `json:"spend_by_supplier"`
	SpendByMonth      []SpendByMonth       `json:"spend_by_month"`
	SpendByStatus     []SpendByStatus      `json:"spend_by_status"`
	AverageOrderValue float64              `json:"average_order_value"`
	LargestOrder      *LargestOrder        `json:"largest_order,omitempty"`
}

// SpendBySupplier represents spend grouped by supplier.
type SpendBySupplier struct {
	SupplierID   string  `json:"supplier_id" db:"supplier_id"`
	SupplierName string  `json:"supplier_name" db:"supplier_name"`
	TotalSpend   float64 `json:"total_spend" db:"total_spend"`
	OrderCount   int64   `json:"order_count" db:"order_count"`
	Percentage   float64 `json:"percentage"`
}

// SpendByMonth represents spend grouped by month.
type SpendByMonth struct {
	Month      string  `json:"month" db:"month"`
	TotalSpend float64 `json:"total_spend" db:"total_spend"`
	OrderCount int64   `json:"order_count" db:"order_count"`
}

// SpendByStatus represents spend grouped by PO status.
type SpendByStatus struct {
	Status     string  `json:"status" db:"status"`
	TotalSpend float64 `json:"total_spend" db:"total_spend"`
	OrderCount int64   `json:"order_count" db:"order_count"`
}

// LargestOrder represents the largest purchase order.
type LargestOrder struct {
	ID           string  `json:"id" db:"id"`
	PONumber     string  `json:"po_number" db:"po_number"`
	SupplierName string  `json:"supplier_name" db:"supplier_name"`
	TotalAmount  float64 `json:"total_amount" db:"total_amount"`
	OrderDate    string  `json:"order_date" db:"order_date"`
}

// GetSpendAnalytics retrieves spend analysis data.
func (s *AnalyticsService) GetSpendAnalytics(ctx context.Context, startDate, endDate string) (*SpendAnalytics, error) {
	analytics := &SpendAnalytics{}

	// Use parameterized queries to prevent SQL injection
	hasDateFilter := startDate != "" && endDate != ""

	// Get total spend and average order value in one query
	type spendSummary struct {
		TotalSpend      float64 `db:"total_spend"`
		AverageOrderVal float64 `db:"avg_value"`
	}
	var summary spendSummary
	if hasDateFilter {
		err := s.db.GetContext(ctx, &summary, `
			SELECT COALESCE(SUM(po.total_amount), 0) as total_spend,
			       COALESCE(AVG(po.total_amount), 0) as avg_value
			FROM procurement_purchase_orders po
			WHERE po.status != 'cancelled' AND po.order_date BETWEEN $1 AND $2`, startDate, endDate)
		if err != nil {
			return nil, err
		}
	} else {
		err := s.db.GetContext(ctx, &summary, `
			SELECT COALESCE(SUM(po.total_amount), 0) as total_spend,
			       COALESCE(AVG(po.total_amount), 0) as avg_value
			FROM procurement_purchase_orders po
			WHERE po.status != 'cancelled'`)
		if err != nil {
			return nil, err
		}
	}
	analytics.TotalSpend = summary.TotalSpend
	analytics.AverageOrderValue = summary.AverageOrderVal

	// Get spend by supplier (top 10)
	spendBySupplier := []SpendBySupplier{}
	if hasDateFilter {
		err := s.db.SelectContext(ctx, &spendBySupplier, `
			SELECT po.supplier_id, COALESCE(s.name, 'Unknown') as supplier_name,
			       COALESCE(SUM(po.total_amount), 0) as total_spend, COUNT(*) as order_count
			FROM procurement_purchase_orders po
			LEFT JOIN suppliers s ON po.supplier_id = s.id
			WHERE po.status != 'cancelled' AND po.supplier_id IS NOT NULL
			  AND po.order_date BETWEEN $1 AND $2
			GROUP BY po.supplier_id, s.name ORDER BY total_spend DESC LIMIT 10`, startDate, endDate)
		if err != nil {
			return nil, err
		}
	} else {
		err := s.db.SelectContext(ctx, &spendBySupplier, `
			SELECT po.supplier_id, COALESCE(s.name, 'Unknown') as supplier_name,
			       COALESCE(SUM(po.total_amount), 0) as total_spend, COUNT(*) as order_count
			FROM procurement_purchase_orders po
			LEFT JOIN suppliers s ON po.supplier_id = s.id
			WHERE po.status != 'cancelled' AND po.supplier_id IS NOT NULL
			GROUP BY po.supplier_id, s.name ORDER BY total_spend DESC LIMIT 10`)
		if err != nil {
			return nil, err
		}
	}
	for i := range spendBySupplier {
		if analytics.TotalSpend > 0 {
			spendBySupplier[i].Percentage = (spendBySupplier[i].TotalSpend / analytics.TotalSpend) * 100
		}
	}
	analytics.SpendBySupplier = spendBySupplier

	// Get spend by month (last 12 months)
	spendByMonth := []SpendByMonth{}
	err := s.db.SelectContext(ctx, &spendByMonth, `
		SELECT TO_CHAR(order_date, 'YYYY-MM') as month,
		       COALESCE(SUM(total_amount), 0) as total_spend, COUNT(*) as order_count
		FROM procurement_purchase_orders
		WHERE status != 'cancelled' AND order_date >= NOW() - INTERVAL '12 months'
		GROUP BY TO_CHAR(order_date, 'YYYY-MM') ORDER BY month DESC`)
	if err != nil {
		return nil, err
	}
	analytics.SpendByMonth = spendByMonth

	// Get spend by status
	spendByStatus := []SpendByStatus{}
	if hasDateFilter {
		err = s.db.SelectContext(ctx, &spendByStatus, `
			SELECT po.status, COALESCE(SUM(po.total_amount), 0) as total_spend, COUNT(*) as order_count
			FROM procurement_purchase_orders po
			WHERE po.order_date BETWEEN $1 AND $2
			GROUP BY po.status ORDER BY total_spend DESC`, startDate, endDate)
	} else {
		err = s.db.SelectContext(ctx, &spendByStatus, `
			SELECT po.status, COALESCE(SUM(po.total_amount), 0) as total_spend, COUNT(*) as order_count
			FROM procurement_purchase_orders po
			GROUP BY po.status ORDER BY total_spend DESC`)
	}
	if err != nil {
		return nil, err
	}
	analytics.SpendByStatus = spendByStatus

	// Get largest order
	largestOrder := &LargestOrder{}
	if hasDateFilter {
		err = s.db.GetContext(ctx, largestOrder, `
			SELECT po.id, po.po_number, COALESCE(s.name, 'Unknown') as supplier_name,
			       po.total_amount, TO_CHAR(po.order_date, 'YYYY-MM-DD') as order_date
			FROM procurement_purchase_orders po
			LEFT JOIN suppliers s ON po.supplier_id = s.id
			WHERE po.status != 'cancelled' AND po.order_date BETWEEN $1 AND $2
			ORDER BY po.total_amount DESC LIMIT 1`, startDate, endDate)
	} else {
		err = s.db.GetContext(ctx, largestOrder, `
			SELECT po.id, po.po_number, COALESCE(s.name, 'Unknown') as supplier_name,
			       po.total_amount, TO_CHAR(po.order_date, 'YYYY-MM-DD') as order_date
			FROM procurement_purchase_orders po
			LEFT JOIN suppliers s ON po.supplier_id = s.id
			WHERE po.status != 'cancelled'
			ORDER BY po.total_amount DESC LIMIT 1`)
	}
	if err == nil && largestOrder.ID != "" {
		analytics.LargestOrder = largestOrder
	}

	return analytics, nil
}

// SupplierPerformance contains supplier performance analytics.
type SupplierPerformance struct {
	TotalSuppliers      int64                  `json:"total_suppliers"`
	ActiveSuppliers     int64                  `json:"active_suppliers"`
	SupplierRankings    []SupplierRanking      `json:"supplier_rankings"`
	TopRatedSuppliers   []TopRatedSupplier     `json:"top_rated_suppliers"`
	SuppliersByCategory []SupplierByCategory   `json:"suppliers_by_category"`
}

// SupplierRanking represents a supplier's ranking by order volume.
type SupplierRanking struct {
	Rank           int     `json:"rank"`
	SupplierID     string  `json:"supplier_id" db:"supplier_id"`
	SupplierName   string  `json:"supplier_name" db:"supplier_name"`
	TotalOrders    int64   `json:"total_orders" db:"total_orders"`
	TotalValue     float64 `json:"total_value" db:"total_value"`
	AverageValue   float64 `json:"average_value" db:"average_value"`
	ReceivedOrders int64   `json:"received_orders" db:"received_orders"`
	DeliveryRate   float64 `json:"delivery_rate"`
}

// TopRatedSupplier represents a top-rated supplier from evaluations.
type TopRatedSupplier struct {
	SupplierID     string  `json:"supplier_id" db:"supplier_id"`
	SupplierName   string  `json:"supplier_name" db:"supplier_name"`
	AverageScore   float64 `json:"average_score" db:"average_score"`
	EvaluationCount int64  `json:"evaluation_count" db:"evaluation_count"`
	Recommendation string  `json:"recommendation" db:"recommendation"`
}

// SupplierByCategory represents suppliers grouped by performance category.
type SupplierByCategory struct {
	Category string `json:"category" db:"category"`
	Count    int64  `json:"count" db:"count"`
}

// GetSupplierPerformance retrieves supplier performance analytics.
func (s *AnalyticsService) GetSupplierPerformance(ctx context.Context) (*SupplierPerformance, error) {
	analytics := &SupplierPerformance{}

	// Get total suppliers count
	err := s.db.GetContext(ctx, &analytics.TotalSuppliers,
		`SELECT COUNT(DISTINCT supplier_id) FROM procurement_purchase_orders WHERE supplier_id IS NOT NULL`)
	if err != nil {
		return nil, err
	}

	// Get active suppliers (with orders in last 6 months)
	err = s.db.GetContext(ctx, &analytics.ActiveSuppliers,
		`SELECT COUNT(DISTINCT supplier_id) FROM procurement_purchase_orders
		 WHERE supplier_id IS NOT NULL AND order_date >= NOW() - INTERVAL '6 months'`)
	if err != nil {
		return nil, err
	}

	// Get supplier rankings by order volume
	rankings := []SupplierRanking{}
	err = s.db.SelectContext(ctx, &rankings, `
		SELECT
			po.supplier_id,
			COALESCE(s.name, 'Unknown') as supplier_name,
			COUNT(*) as total_orders,
			COALESCE(SUM(po.total_amount), 0) as total_value,
			COALESCE(AVG(po.total_amount), 0) as average_value,
			COUNT(CASE WHEN po.status = 'received' THEN 1 END) as received_orders
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		WHERE po.supplier_id IS NOT NULL
		GROUP BY po.supplier_id, s.name
		ORDER BY total_value DESC
		LIMIT 20
	`)
	if err != nil {
		return nil, err
	}
	// Calculate rank and delivery rate
	for i := range rankings {
		rankings[i].Rank = i + 1
		if rankings[i].TotalOrders > 0 {
			rankings[i].DeliveryRate = float64(rankings[i].ReceivedOrders) / float64(rankings[i].TotalOrders) * 100
		}
	}
	analytics.SupplierRankings = rankings

	// Get top-rated suppliers from evaluations
	topRated := []TopRatedSupplier{}
	err = s.db.SelectContext(ctx, &topRated, `
		SELECT
			ve.supplier_id,
			COALESCE(s.name, 'Unknown') as supplier_name,
			AVG(ve.overall_score) as average_score,
			COUNT(*) as evaluation_count,
			MODE() WITHIN GROUP (ORDER BY ve.recommendation) as recommendation
		FROM vendor_evaluations ve
		LEFT JOIN suppliers s ON ve.supplier_id = s.id
		WHERE ve.status = 'approved'
		GROUP BY ve.supplier_id, s.name
		HAVING COUNT(*) >= 1
		ORDER BY average_score DESC
		LIMIT 10
	`)
	if err != nil {
		// If MODE() function fails, try without it
		err = s.db.SelectContext(ctx, &topRated, `
			SELECT
				ve.supplier_id,
				COALESCE(s.name, 'Unknown') as supplier_name,
				AVG(ve.overall_score) as average_score,
				COUNT(*) as evaluation_count,
				'approved' as recommendation
			FROM vendor_evaluations ve
			LEFT JOIN suppliers s ON ve.supplier_id = s.id
			WHERE ve.status = 'approved'
			GROUP BY ve.supplier_id, s.name
			HAVING COUNT(*) >= 1
			ORDER BY average_score DESC
			LIMIT 10
		`)
		if err != nil {
			return nil, err
		}
	}
	analytics.TopRatedSuppliers = topRated

	// Get suppliers by performance category based on evaluation scores
	byCategory := []SupplierByCategory{}
	err = s.db.SelectContext(ctx, &byCategory, `
		SELECT
			CASE
				WHEN avg_score >= 4.5 THEN 'Preferred'
				WHEN avg_score >= 3.5 THEN 'Approved'
				WHEN avg_score >= 2.5 THEN 'Conditional'
				ELSE 'Not Recommended'
			END as category,
			COUNT(*) as count
		FROM (
			SELECT supplier_id, AVG(overall_score) as avg_score
			FROM vendor_evaluations
			WHERE status = 'approved'
			GROUP BY supplier_id
		) sub
		GROUP BY category
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, err
	}
	analytics.SuppliersByCategory = byCategory

	return analytics, nil
}

// ContractAnalytics contains contract analysis data.
type ContractAnalytics struct {
	TotalContractValue    float64               `json:"total_contract_value"`
	ActiveContractValue   float64               `json:"active_contract_value"`
	ContractsByStatus     []ContractByStatus    `json:"contracts_by_status"`
	ContractsByType       []ContractByType      `json:"contracts_by_type"`
	ExpiringContracts     []ExpiringContract    `json:"expiring_contracts"`
	RenewalPipeline       []RenewalPipeline     `json:"renewal_pipeline"`
	ContractValueByMonth  []ContractValueByMonth `json:"contract_value_by_month"`
}

// ContractByStatus represents contracts grouped by status.
type ContractByStatus struct {
	Status     string  `json:"status" db:"status"`
	Count      int64   `json:"count" db:"count"`
	TotalValue float64 `json:"total_value" db:"total_value"`
}

// ContractByType represents contracts grouped by type.
type ContractByType struct {
	ContractType string  `json:"contract_type" db:"contract_type"`
	Count        int64   `json:"count" db:"count"`
	TotalValue   float64 `json:"total_value" db:"total_value"`
}

// ExpiringContract represents a contract expiring soon.
type ExpiringContract struct {
	ID           string  `json:"id" db:"id"`
	ContractNumber string `json:"contract_number" db:"contract_number"`
	Title        string  `json:"title" db:"title"`
	SupplierName string  `json:"supplier_name" db:"supplier_name"`
	EndDate      string  `json:"end_date" db:"end_date"`
	Value        float64 `json:"value" db:"value"`
	DaysUntilExpiry int  `json:"days_until_expiry" db:"days_until_expiry"`
	AutoRenewal  bool    `json:"auto_renewal" db:"auto_renewal"`
}

// RenewalPipeline represents contracts due for renewal by month.
type RenewalPipeline struct {
	Month      string  `json:"month" db:"month"`
	Count      int64   `json:"count" db:"count"`
	TotalValue float64 `json:"total_value" db:"total_value"`
}

// ContractValueByMonth represents contract value created by month.
type ContractValueByMonth struct {
	Month      string  `json:"month" db:"month"`
	Count      int64   `json:"count" db:"count"`
	TotalValue float64 `json:"total_value" db:"total_value"`
}

// GetContractAnalytics retrieves contract analysis data.
func (s *AnalyticsService) GetContractAnalytics(ctx context.Context) (*ContractAnalytics, error) {
	analytics := &ContractAnalytics{}

	// Get total contract value
	var totalValue *float64
	err := s.db.GetContext(ctx, &totalValue,
		`SELECT COALESCE(SUM(value), 0) FROM contracts`)
	if err != nil {
		return nil, err
	}
	if totalValue != nil {
		analytics.TotalContractValue = *totalValue
	}

	// Get active contract value
	var activeValue *float64
	err = s.db.GetContext(ctx, &activeValue,
		`SELECT COALESCE(SUM(value), 0) FROM contracts WHERE status = 'active'`)
	if err != nil {
		return nil, err
	}
	if activeValue != nil {
		analytics.ActiveContractValue = *activeValue
	}

	// Get contracts by status
	byStatus := []ContractByStatus{}
	err = s.db.SelectContext(ctx, &byStatus, `
		SELECT
			status,
			COUNT(*) as count,
			COALESCE(SUM(value), 0) as total_value
		FROM contracts
		GROUP BY status
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, err
	}
	analytics.ContractsByStatus = byStatus

	// Get contracts by type
	byType := []ContractByType{}
	err = s.db.SelectContext(ctx, &byType, `
		SELECT
			COALESCE(contract_type, 'other') as contract_type,
			COUNT(*) as count,
			COALESCE(SUM(value), 0) as total_value
		FROM contracts
		GROUP BY contract_type
		ORDER BY total_value DESC
	`)
	if err != nil {
		return nil, err
	}
	analytics.ContractsByType = byType

	// Get expiring contracts (next 90 days)
	expiring := []ExpiringContract{}
	err = s.db.SelectContext(ctx, &expiring, `
		SELECT
			c.id,
			c.contract_number,
			c.title,
			COALESCE(s.name, 'Unknown') as supplier_name,
			TO_CHAR(c.end_date, 'YYYY-MM-DD') as end_date,
			COALESCE(c.value, 0) as value,
			EXTRACT(DAY FROM c.end_date - NOW())::int as days_until_expiry,
			COALESCE(c.auto_renewal, false) as auto_renewal
		FROM contracts c
		LEFT JOIN suppliers s ON c.supplier_id = s.id
		WHERE c.status = 'active'
			AND c.end_date <= NOW() + INTERVAL '90 days'
			AND c.end_date >= NOW()
		ORDER BY c.end_date ASC
		LIMIT 20
	`)
	if err != nil {
		return nil, err
	}
	analytics.ExpiringContracts = expiring

	// Get renewal pipeline (contracts expiring in next 6 months by month)
	pipeline := []RenewalPipeline{}
	err = s.db.SelectContext(ctx, &pipeline, `
		SELECT
			TO_CHAR(end_date, 'YYYY-MM') as month,
			COUNT(*) as count,
			COALESCE(SUM(value), 0) as total_value
		FROM contracts
		WHERE status = 'active'
			AND end_date <= NOW() + INTERVAL '6 months'
			AND end_date >= NOW()
		GROUP BY TO_CHAR(end_date, 'YYYY-MM')
		ORDER BY month ASC
	`)
	if err != nil {
		return nil, err
	}
	analytics.RenewalPipeline = pipeline

	// Get contract value by month (last 12 months of contract creation)
	valueByMonth := []ContractValueByMonth{}
	err = s.db.SelectContext(ctx, &valueByMonth, `
		SELECT
			TO_CHAR(created_at, 'YYYY-MM') as month,
			COUNT(*) as count,
			COALESCE(SUM(value), 0) as total_value
		FROM contracts
		WHERE created_at >= NOW() - INTERVAL '12 months'
		GROUP BY TO_CHAR(created_at, 'YYYY-MM')
		ORDER BY month DESC
	`)
	if err != nil {
		return nil, err
	}
	analytics.ContractValueByMonth = valueByMonth

	return analytics, nil
}
