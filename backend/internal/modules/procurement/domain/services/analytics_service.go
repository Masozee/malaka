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
func (s *AnalyticsService) GetOverview(ctx context.Context) (*ProcurementOverview, error) {
	overview := &ProcurementOverview{}

	// Get Purchase Request stats
	err := s.db.GetContext(ctx, &overview.TotalPurchaseRequests,
		`SELECT COUNT(*) FROM purchase_requests`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.PendingPurchaseRequests,
		`SELECT COUNT(*) FROM purchase_requests WHERE status = 'pending'`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.ApprovedPurchaseRequests,
		`SELECT COUNT(*) FROM purchase_requests WHERE status = 'approved'`)
	if err != nil {
		return nil, err
	}

	// Get Purchase Order stats
	err = s.db.GetContext(ctx, &overview.TotalPurchaseOrders,
		`SELECT COUNT(*) FROM procurement_purchase_orders`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.DraftPurchaseOrders,
		`SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'draft'`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.PendingApprovalOrders,
		`SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'pending_approval'`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.SentPurchaseOrders,
		`SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'sent'`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.ReceivedPurchaseOrders,
		`SELECT COUNT(*) FROM procurement_purchase_orders WHERE status = 'received'`)
	if err != nil {
		return nil, err
	}

	// Get Financial stats
	var totalPOValue *float64
	err = s.db.GetContext(ctx, &totalPOValue,
		`SELECT COALESCE(SUM(total_amount), 0) FROM procurement_purchase_orders`)
	if err != nil {
		return nil, err
	}
	if totalPOValue != nil {
		overview.TotalPOValue = *totalPOValue
	}

	var totalPRValue *float64
	err = s.db.GetContext(ctx, &totalPRValue,
		`SELECT COALESCE(SUM(total_amount), 0) FROM purchase_requests`)
	if err != nil {
		return nil, err
	}
	if totalPRValue != nil {
		overview.TotalPRValue = *totalPRValue
	}

	var pendingPayments *float64
	err = s.db.GetContext(ctx, &pendingPayments,
		`SELECT COALESCE(SUM(total_amount), 0) FROM procurement_purchase_orders
		 WHERE payment_status IN ('unpaid', 'partial') AND status != 'cancelled'`)
	if err != nil {
		return nil, err
	}
	if pendingPayments != nil {
		overview.PendingPayments = *pendingPayments
	}

	// Get Contract stats
	err = s.db.GetContext(ctx, &overview.TotalContracts,
		`SELECT COUNT(*) FROM contracts`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.ActiveContracts,
		`SELECT COUNT(*) FROM contracts WHERE status = 'active'`)
	if err != nil {
		return nil, err
	}

	err = s.db.GetContext(ctx, &overview.ExpiringContracts,
		`SELECT COUNT(*) FROM contracts
		 WHERE status = 'active' AND end_date <= NOW() + INTERVAL '30 days'`)
	if err != nil {
		return nil, err
	}

	// Get Vendor Evaluation stats
	err = s.db.GetContext(ctx, &overview.TotalVendorEvaluations,
		`SELECT COUNT(*) FROM vendor_evaluations`)
	if err != nil {
		return nil, err
	}

	var avgScore *float64
	err = s.db.GetContext(ctx, &avgScore,
		`SELECT COALESCE(AVG(overall_score), 0) FROM vendor_evaluations`)
	if err != nil {
		return nil, err
	}
	if avgScore != nil {
		overview.AverageVendorScore = *avgScore
	}

	// Get Top Suppliers (by total PO value)
	topSuppliers := []TopSupplier{}
	err = s.db.SelectContext(ctx, &topSuppliers, `
		SELECT
			po.supplier_id,
			COALESCE(s.name, 'Unknown') as supplier_name,
			COUNT(*) as total_orders,
			COALESCE(SUM(po.total_amount), 0) as total_value
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		WHERE po.supplier_id IS NOT NULL
		GROUP BY po.supplier_id, s.name
		ORDER BY total_value DESC
		LIMIT 5
	`)
	if err != nil {
		return nil, err
	}
	overview.TopSuppliers = topSuppliers

	// Get Recent Purchase Orders
	recentPOs := []RecentPO{}
	err = s.db.SelectContext(ctx, &recentPOs, `
		SELECT
			po.id,
			po.po_number,
			COALESCE(s.name, 'Unknown') as supplier_name,
			po.total_amount,
			po.status,
			TO_CHAR(po.created_at, 'YYYY-MM-DD HH24:MI') as created_at
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		ORDER BY po.created_at DESC
		LIMIT 5
	`)
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

	// Build date filter
	dateFilter := ""
	if startDate != "" && endDate != "" {
		dateFilter = " AND po.order_date BETWEEN '" + startDate + "' AND '" + endDate + "'"
	}

	// Get total spend
	var totalSpend *float64
	query := `SELECT COALESCE(SUM(po.total_amount), 0) FROM procurement_purchase_orders po WHERE po.status != 'cancelled'` + dateFilter
	err := s.db.GetContext(ctx, &totalSpend, query)
	if err != nil {
		return nil, err
	}
	if totalSpend != nil {
		analytics.TotalSpend = *totalSpend
	}

	// Get average order value
	var avgValue *float64
	query = `SELECT COALESCE(AVG(po.total_amount), 0) FROM procurement_purchase_orders po WHERE po.status != 'cancelled'` + dateFilter
	err = s.db.GetContext(ctx, &avgValue, query)
	if err != nil {
		return nil, err
	}
	if avgValue != nil {
		analytics.AverageOrderValue = *avgValue
	}

	// Get spend by supplier (top 10)
	spendBySupplier := []SpendBySupplier{}
	query = `
		SELECT
			po.supplier_id,
			COALESCE(s.name, 'Unknown') as supplier_name,
			COALESCE(SUM(po.total_amount), 0) as total_spend,
			COUNT(*) as order_count
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		WHERE po.status != 'cancelled' AND po.supplier_id IS NOT NULL` + dateFilter + `
		GROUP BY po.supplier_id, s.name
		ORDER BY total_spend DESC
		LIMIT 10
	`
	err = s.db.SelectContext(ctx, &spendBySupplier, query)
	if err != nil {
		return nil, err
	}
	// Calculate percentages
	for i := range spendBySupplier {
		if analytics.TotalSpend > 0 {
			spendBySupplier[i].Percentage = (spendBySupplier[i].TotalSpend / analytics.TotalSpend) * 100
		}
	}
	analytics.SpendBySupplier = spendBySupplier

	// Get spend by month (last 12 months)
	spendByMonth := []SpendByMonth{}
	err = s.db.SelectContext(ctx, &spendByMonth, `
		SELECT
			TO_CHAR(order_date, 'YYYY-MM') as month,
			COALESCE(SUM(total_amount), 0) as total_spend,
			COUNT(*) as order_count
		FROM procurement_purchase_orders
		WHERE status != 'cancelled'
			AND order_date >= NOW() - INTERVAL '12 months'
		GROUP BY TO_CHAR(order_date, 'YYYY-MM')
		ORDER BY month DESC
	`)
	if err != nil {
		return nil, err
	}
	analytics.SpendByMonth = spendByMonth

	// Get spend by status
	spendByStatus := []SpendByStatus{}
	query = `
		SELECT
			po.status,
			COALESCE(SUM(po.total_amount), 0) as total_spend,
			COUNT(*) as order_count
		FROM procurement_purchase_orders po
		WHERE 1=1` + dateFilter + `
		GROUP BY po.status
		ORDER BY total_spend DESC
	`
	err = s.db.SelectContext(ctx, &spendByStatus, query)
	if err != nil {
		return nil, err
	}
	analytics.SpendByStatus = spendByStatus

	// Get largest order
	largestOrder := &LargestOrder{}
	query = `
		SELECT
			po.id,
			po.po_number,
			COALESCE(s.name, 'Unknown') as supplier_name,
			po.total_amount,
			TO_CHAR(po.order_date, 'YYYY-MM-DD') as order_date
		FROM procurement_purchase_orders po
		LEFT JOIN suppliers s ON po.supplier_id = s.id
		WHERE po.status != 'cancelled'` + dateFilter + `
		ORDER BY po.total_amount DESC
		LIMIT 1
	`
	err = s.db.GetContext(ctx, largestOrder, query)
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
