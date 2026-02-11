package services

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	analyticsSync "malaka/internal/modules/analytics/infrastructure/sync"
	chdb "malaka/internal/shared/clickhouse"
)

// QueryParams represents common analytics query parameters.
type QueryParams struct {
	StartDate   time.Time `form:"start_date" time_format:"2006-01-02"`
	EndDate     time.Time `form:"end_date" time_format:"2006-01-02"`
	Granularity string    `form:"granularity"` // daily, weekly, monthly
	GroupBy     string    `form:"group_by"`
	Limit       int       `form:"limit"`
}

// TimeSeriesPoint represents a single data point in a time series.
type TimeSeriesPoint struct {
	Date  string  `json:"date"`
	Value float64 `json:"value"`
	Label string  `json:"label,omitempty"`
}

// RankedItem represents a ranked metric item.
type RankedItem struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Value    float64 `json:"value"`
	Quantity int64   `json:"quantity,omitempty"`
	Rank     int     `json:"rank"`
}

// OverviewKPI represents a top-level KPI.
type OverviewKPI struct {
	Label       string  `json:"label"`
	Value       float64 `json:"value"`
	Change      float64 `json:"change"`       // percentage change vs prior period
	PriorValue  float64 `json:"prior_value"`
	Unit        string  `json:"unit"`          // "currency", "count", "hours", "percentage"
}

// OverviewResponse is the cross-module KPI summary.
type OverviewResponse struct {
	Revenue          OverviewKPI `json:"revenue"`
	Orders           OverviewKPI `json:"orders"`
	ProcurementSpend OverviewKPI `json:"procurement_spend"`
	InventoryValue   OverviewKPI `json:"inventory_value"`
	Attendance       OverviewKPI `json:"attendance"`
}

// SyncStatusItem represents the sync status for one table.
type SyncStatusItem struct {
	TableName    string    `json:"table_name"`
	LastSyncedAt time.Time `json:"last_synced_at"`
	RowsSynced   uint64    `json:"rows_synced"`
	SyncType     string    `json:"sync_type"`
}

// AnalyticsQueryService is the main analytics query interface.
type AnalyticsQueryService struct {
	chDB   *chdb.ClickHouseDB
	pgDB   *sqlx.DB
	logger *zap.Logger
}

// NewAnalyticsQueryService creates a new analytics query service.
func NewAnalyticsQueryService(chDB *chdb.ClickHouseDB, pgDB *sqlx.DB, logger *zap.Logger) *AnalyticsQueryService {
	return &AnalyticsQueryService{chDB: chDB, pgDB: pgDB, logger: logger}
}

func (s *AnalyticsQueryService) db() *sql.DB {
	if s.chDB != nil && s.chDB.IsAvailable() {
		return s.chDB.DB()
	}
	return nil
}

func (s *AnalyticsQueryService) useClickHouse() bool {
	return s.db() != nil
}

// GetOverview returns cross-module KPIs.
func (s *AnalyticsQueryService) GetOverview(ctx context.Context, params QueryParams) (*OverviewResponse, error) {
	if s.useClickHouse() {
		return s.overviewFromCH(ctx, params)
	}
	return s.overviewFromPG(ctx, params)
}

// GetSalesRevenue returns revenue time series.
func (s *AnalyticsQueryService) GetSalesRevenue(ctx context.Context, params QueryParams) ([]TimeSeriesPoint, error) {
	if s.useClickHouse() {
		return s.salesRevenueFromCH(ctx, params)
	}
	return s.salesRevenueFromPG(ctx, params)
}

// GetTopProducts returns top products by revenue.
func (s *AnalyticsQueryService) GetTopProducts(ctx context.Context, params QueryParams) ([]RankedItem, error) {
	if s.useClickHouse() {
		return s.topProductsFromCH(ctx, params)
	}
	return s.topProductsFromPG(ctx, params)
}

// GetTopCustomers returns top customers by revenue.
func (s *AnalyticsQueryService) GetTopCustomers(ctx context.Context, params QueryParams) ([]RankedItem, error) {
	if s.useClickHouse() {
		return s.topCustomersFromCH(ctx, params)
	}
	return s.topCustomersFromPG(ctx, params)
}

// GetProcurementSpend returns procurement spend time series.
func (s *AnalyticsQueryService) GetProcurementSpend(ctx context.Context, params QueryParams) ([]TimeSeriesPoint, error) {
	if s.useClickHouse() {
		return s.procSpendFromCH(ctx, params)
	}
	return s.procSpendFromPG(ctx, params)
}

// GetTopSuppliers returns top suppliers by spend.
func (s *AnalyticsQueryService) GetTopSuppliers(ctx context.Context, params QueryParams) ([]RankedItem, error) {
	if s.useClickHouse() {
		return s.topSuppliersFromCH(ctx, params)
	}
	return s.topSuppliersFromPG(ctx, params)
}

// GetInventoryMovements returns inventory movement time series.
func (s *AnalyticsQueryService) GetInventoryMovements(ctx context.Context, params QueryParams) ([]TimeSeriesPoint, error) {
	if s.useClickHouse() {
		return s.invMovementsFromCH(ctx, params)
	}
	return s.invMovementsFromPG(ctx, params)
}

// GetFinancialLedger returns debit/credit balance time series.
func (s *AnalyticsQueryService) GetFinancialLedger(ctx context.Context, params QueryParams) ([]TimeSeriesPoint, error) {
	if s.useClickHouse() {
		return s.financialFromCH(ctx, params)
	}
	return s.financialFromPG(ctx, params)
}

// GetAttendanceTrend returns attendance trend time series.
func (s *AnalyticsQueryService) GetAttendanceTrend(ctx context.Context, params QueryParams) ([]TimeSeriesPoint, error) {
	if s.useClickHouse() {
		return s.attendanceFromCH(ctx, params)
	}
	return s.attendanceFromPG(ctx, params)
}

// TriggerSync runs a full batch sync from PG to ClickHouse.
func (s *AnalyticsQueryService) TriggerSync(ctx context.Context) error {
	if !s.useClickHouse() {
		return nil
	}

	syncSvc := analyticsSync.NewBatchSyncService(s.pgDB, s.db(), s.logger)
	return syncSvc.RunFullSync(ctx)
}

// GetSyncStatus returns sync watermark status.
func (s *AnalyticsQueryService) GetSyncStatus(ctx context.Context) ([]SyncStatusItem, error) {
	if !s.useClickHouse() {
		return nil, nil
	}

	rows, err := s.db().QueryContext(ctx,
		`SELECT table_name, last_synced_at, rows_synced, sync_type
		 FROM sync_watermarks FINAL ORDER BY table_name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []SyncStatusItem
	for rows.Next() {
		var item SyncStatusItem
		if err := rows.Scan(&item.TableName, &item.LastSyncedAt, &item.RowsSynced, &item.SyncType); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

// granularityExpr returns the SQL date truncation expression for the given granularity.
func granularityExprCH(g string) string {
	switch g {
	case "weekly":
		return "toStartOfWeek(date_key)"
	case "monthly":
		return "toStartOfMonth(date_key)"
	default:
		return "date_key"
	}
}

func granularityExprPG(g string) string {
	switch g {
	case "weekly":
		return "date_trunc('week', created_at)::date"
	case "monthly":
		return "date_trunc('month', created_at)::date"
	default:
		return "created_at::date"
	}
}

func defaultLimit(l int) int {
	if l <= 0 || l > 100 {
		return 20
	}
	return l
}

// ==================== ClickHouse queries ====================

func (s *AnalyticsQueryService) overviewFromCH(ctx context.Context, p QueryParams) (*OverviewResponse, error) {
	db := s.db()
	resp := &OverviewResponse{}

	// Revenue
	var revenue, priorRevenue float64
	db.QueryRowContext(ctx,
		`SELECT COALESCE(sum(line_total), 0) FROM sales_fact WHERE date_key >= ? AND date_key <= ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02")).Scan(&revenue)

	duration := p.EndDate.Sub(p.StartDate)
	priorStart := p.StartDate.Add(-duration)
	priorEnd := p.StartDate.AddDate(0, 0, -1)
	db.QueryRowContext(ctx,
		`SELECT COALESCE(sum(line_total), 0) FROM sales_fact WHERE date_key >= ? AND date_key <= ?`,
		priorStart.Format("2006-01-02"), priorEnd.Format("2006-01-02")).Scan(&priorRevenue)

	resp.Revenue = makeKPI("Revenue", revenue, priorRevenue, "currency")

	// Orders
	var orders, priorOrders float64
	db.QueryRowContext(ctx,
		`SELECT count(DISTINCT order_id) FROM sales_fact WHERE date_key >= ? AND date_key <= ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02")).Scan(&orders)
	db.QueryRowContext(ctx,
		`SELECT count(DISTINCT order_id) FROM sales_fact WHERE date_key >= ? AND date_key <= ?`,
		priorStart.Format("2006-01-02"), priorEnd.Format("2006-01-02")).Scan(&priorOrders)
	resp.Orders = makeKPI("Orders", orders, priorOrders, "count")

	// Procurement Spend
	var spend, priorSpend float64
	db.QueryRowContext(ctx,
		`SELECT COALESCE(sum(line_total), 0) FROM procurement_fact WHERE date_key >= ? AND date_key <= ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02")).Scan(&spend)
	db.QueryRowContext(ctx,
		`SELECT COALESCE(sum(line_total), 0) FROM procurement_fact WHERE date_key >= ? AND date_key <= ?`,
		priorStart.Format("2006-01-02"), priorEnd.Format("2006-01-02")).Scan(&priorSpend)
	resp.ProcurementSpend = makeKPI("Procurement Spend", spend, priorSpend, "currency")

	// Inventory movements count
	var invMoves, priorInvMoves float64
	db.QueryRowContext(ctx,
		`SELECT count(*) FROM inventory_movement_fact WHERE date_key >= ? AND date_key <= ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02")).Scan(&invMoves)
	db.QueryRowContext(ctx,
		`SELECT count(*) FROM inventory_movement_fact WHERE date_key >= ? AND date_key <= ?`,
		priorStart.Format("2006-01-02"), priorEnd.Format("2006-01-02")).Scan(&priorInvMoves)
	resp.InventoryValue = makeKPI("Inventory Movements", invMoves, priorInvMoves, "count")

	// Attendance rate
	var totalDays, presentDays, priorTotalDays, priorPresentDays float64
	db.QueryRowContext(ctx,
		`SELECT count(*), countIf(status = 'PRESENT' OR status = 'LATE') FROM attendance_fact WHERE date_key >= ? AND date_key <= ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02")).Scan(&totalDays, &presentDays)
	db.QueryRowContext(ctx,
		`SELECT count(*), countIf(status = 'PRESENT' OR status = 'LATE') FROM attendance_fact WHERE date_key >= ? AND date_key <= ?`,
		priorStart.Format("2006-01-02"), priorEnd.Format("2006-01-02")).Scan(&priorTotalDays, &priorPresentDays)

	rate := 0.0
	if totalDays > 0 {
		rate = presentDays / totalDays * 100
	}
	priorRate := 0.0
	if priorTotalDays > 0 {
		priorRate = priorPresentDays / priorTotalDays * 100
	}
	resp.Attendance = makeKPI("Attendance Rate", rate, priorRate, "percentage")

	return resp, nil
}

func (s *AnalyticsQueryService) salesRevenueFromCH(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	dateExpr := granularityExprCH(p.Granularity)
	rows, err := s.db().QueryContext(ctx,
		`SELECT `+dateExpr+` as d, sum(line_total) as v
		 FROM sales_fact
		 WHERE date_key >= ? AND date_key <= ?
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) topProductsFromCH(ctx context.Context, p QueryParams) ([]RankedItem, error) {
	limit := defaultLimit(p.Limit)
	rows, err := s.db().QueryContext(ctx,
		`SELECT article_id, da.name, sum(sf.line_total) as revenue, sum(sf.quantity) as qty
		 FROM sales_fact sf
		 LEFT JOIN dim_article da ON sf.article_id = da.id
		 WHERE sf.date_key >= ? AND sf.date_key <= ? AND sf.article_id != ''
		 GROUP BY sf.article_id, da.name
		 ORDER BY revenue DESC LIMIT ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRankedItems(rows)
}

func (s *AnalyticsQueryService) topCustomersFromCH(ctx context.Context, p QueryParams) ([]RankedItem, error) {
	limit := defaultLimit(p.Limit)
	rows, err := s.db().QueryContext(ctx,
		`SELECT customer_id, dc.name, sum(sf.line_total) as revenue, count(DISTINCT sf.order_id) as qty
		 FROM sales_fact sf
		 LEFT JOIN dim_customer dc ON sf.customer_id = dc.id
		 WHERE sf.date_key >= ? AND sf.date_key <= ? AND sf.customer_id != ''
		 GROUP BY sf.customer_id, dc.name
		 ORDER BY revenue DESC LIMIT ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRankedItems(rows)
}

func (s *AnalyticsQueryService) procSpendFromCH(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	dateExpr := granularityExprCH(p.Granularity)
	rows, err := s.db().QueryContext(ctx,
		`SELECT `+dateExpr+` as d, sum(line_total) as v
		 FROM procurement_fact
		 WHERE date_key >= ? AND date_key <= ?
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) topSuppliersFromCH(ctx context.Context, p QueryParams) ([]RankedItem, error) {
	limit := defaultLimit(p.Limit)
	rows, err := s.db().QueryContext(ctx,
		`SELECT supplier_id, ds.name, sum(pf.line_total) as spend, count(DISTINCT pf.po_id) as qty
		 FROM procurement_fact pf
		 LEFT JOIN dim_supplier ds ON pf.supplier_id = ds.id
		 WHERE pf.date_key >= ? AND pf.date_key <= ? AND pf.supplier_id != ''
		 GROUP BY pf.supplier_id, ds.name
		 ORDER BY spend DESC LIMIT ?`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRankedItems(rows)
}

func (s *AnalyticsQueryService) invMovementsFromCH(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	dateExpr := granularityExprCH(p.Granularity)
	rows, err := s.db().QueryContext(ctx,
		`SELECT `+dateExpr+` as d, count(*) as v
		 FROM inventory_movement_fact
		 WHERE date_key >= ? AND date_key <= ?
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) financialFromCH(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	dateExpr := granularityExprCH(p.Granularity)
	rows, err := s.db().QueryContext(ctx,
		`SELECT `+dateExpr+` as d, sum(debit_amount) - sum(credit_amount) as v
		 FROM financial_transaction_fact
		 WHERE date_key >= ? AND date_key <= ?
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) attendanceFromCH(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	dateExpr := granularityExprCH(p.Granularity)
	rows, err := s.db().QueryContext(ctx,
		`SELECT `+dateExpr+` as d, avg(work_hours) as v
		 FROM attendance_fact
		 WHERE date_key >= ? AND date_key <= ?
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

// ==================== PostgreSQL fallback queries ====================

func (s *AnalyticsQueryService) overviewFromPG(ctx context.Context, p QueryParams) (*OverviewResponse, error) {
	resp := &OverviewResponse{}

	startStr := p.StartDate.Format("2006-01-02")
	endStr := p.EndDate.Format("2006-01-02")
	duration := p.EndDate.Sub(p.StartDate)
	priorStart := p.StartDate.Add(-duration).Format("2006-01-02")
	priorEnd := p.StartDate.AddDate(0, 0, -1).Format("2006-01-02")

	var revenue, priorRevenue float64
	s.pgDB.QueryRowContext(ctx, `SELECT COALESCE(sum(total_price),0) FROM sales_order_items soi JOIN sales_orders so ON soi.sales_order_id = so.id WHERE so.order_date::date >= $1 AND so.order_date::date <= $2`, startStr, endStr).Scan(&revenue)
	s.pgDB.QueryRowContext(ctx, `SELECT COALESCE(sum(total_price),0) FROM sales_order_items soi JOIN sales_orders so ON soi.sales_order_id = so.id WHERE so.order_date::date >= $1 AND so.order_date::date <= $2`, priorStart, priorEnd).Scan(&priorRevenue)
	resp.Revenue = makeKPI("Revenue", revenue, priorRevenue, "currency")

	var orders, priorOrders float64
	s.pgDB.QueryRowContext(ctx, `SELECT count(*) FROM sales_orders WHERE order_date::date >= $1 AND order_date::date <= $2`, startStr, endStr).Scan(&orders)
	s.pgDB.QueryRowContext(ctx, `SELECT count(*) FROM sales_orders WHERE order_date::date >= $1 AND order_date::date <= $2`, priorStart, priorEnd).Scan(&priorOrders)
	resp.Orders = makeKPI("Orders", orders, priorOrders, "count")

	var spend, priorSpend float64
	s.pgDB.QueryRowContext(ctx, `SELECT COALESCE(sum(total_amount),0) FROM procurement_purchase_orders WHERE order_date::date >= $1 AND order_date::date <= $2`, startStr, endStr).Scan(&spend)
	s.pgDB.QueryRowContext(ctx, `SELECT COALESCE(sum(total_amount),0) FROM procurement_purchase_orders WHERE order_date::date >= $1 AND order_date::date <= $2`, priorStart, priorEnd).Scan(&priorSpend)
	resp.ProcurementSpend = makeKPI("Procurement Spend", spend, priorSpend, "currency")

	var invMoves, priorInvMoves float64
	s.pgDB.QueryRowContext(ctx, `SELECT count(*) FROM stock_movements WHERE movement_date::date >= $1 AND movement_date::date <= $2`, startStr, endStr).Scan(&invMoves)
	s.pgDB.QueryRowContext(ctx, `SELECT count(*) FROM stock_movements WHERE movement_date::date >= $1 AND movement_date::date <= $2`, priorStart, priorEnd).Scan(&priorInvMoves)
	resp.InventoryValue = makeKPI("Inventory Movements", invMoves, priorInvMoves, "count")

	resp.Attendance = OverviewKPI{Label: "Attendance Rate", Value: 0, Unit: "percentage"}

	return resp, nil
}

func (s *AnalyticsQueryService) salesRevenueFromPG(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT so.order_date::date as d, COALESCE(sum(soi.total_price), 0) as v
		 FROM sales_order_items soi
		 JOIN sales_orders so ON soi.sales_order_id = so.id
		 WHERE so.order_date::date >= $1 AND so.order_date::date <= $2
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) topProductsFromPG(ctx context.Context, p QueryParams) ([]RankedItem, error) {
	limit := defaultLimit(p.Limit)
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT soi.article_id::text, COALESCE(a.name, ''), COALESCE(sum(soi.total_price),0) as revenue, COALESCE(sum(soi.quantity),0) as qty
		 FROM sales_order_items soi
		 JOIN sales_orders so ON soi.sales_order_id = so.id
		 LEFT JOIN articles a ON soi.article_id = a.id
		 WHERE so.order_date::date >= $1 AND so.order_date::date <= $2
		 GROUP BY soi.article_id, a.name
		 ORDER BY revenue DESC LIMIT $3`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRankedItems(rows)
}

func (s *AnalyticsQueryService) topCustomersFromPG(ctx context.Context, p QueryParams) ([]RankedItem, error) {
	limit := defaultLimit(p.Limit)
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT so.customer_id::text, COALESCE(c.name, ''), COALESCE(sum(so.total_amount),0) as revenue, count(*) as qty
		 FROM sales_orders so
		 LEFT JOIN customers c ON so.customer_id = c.id
		 WHERE so.order_date::date >= $1 AND so.order_date::date <= $2
		 GROUP BY so.customer_id, c.name
		 ORDER BY revenue DESC LIMIT $3`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRankedItems(rows)
}

func (s *AnalyticsQueryService) procSpendFromPG(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT order_date::date as d, COALESCE(sum(total_amount),0) as v
		 FROM procurement_purchase_orders
		 WHERE order_date::date >= $1 AND order_date::date <= $2
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) topSuppliersFromPG(ctx context.Context, p QueryParams) ([]RankedItem, error) {
	limit := defaultLimit(p.Limit)
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT ppo.supplier_id::text, COALESCE(s.name, ''), COALESCE(sum(ppo.total_amount),0) as spend, count(*) as qty
		 FROM procurement_purchase_orders ppo
		 LEFT JOIN suppliers s ON ppo.supplier_id = s.id
		 WHERE ppo.order_date::date >= $1 AND ppo.order_date::date <= $2
		 GROUP BY ppo.supplier_id, s.name
		 ORDER BY spend DESC LIMIT $3`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRankedItems(rows)
}

func (s *AnalyticsQueryService) invMovementsFromPG(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT movement_date::date as d, count(*) as v
		 FROM stock_movements
		 WHERE movement_date::date >= $1 AND movement_date::date <= $2
		 GROUP BY d ORDER BY d`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) financialFromPG(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT je.entry_date as d, COALESCE(sum(jel.debit_amount),0) - COALESCE(sum(jel.credit_amount),0) as v
		 FROM journal_entry_lines jel
		 JOIN journal_entries je ON jel.journal_entry_id = je.id
		 WHERE je.entry_date >= $1 AND je.entry_date <= $2
		 GROUP BY je.entry_date ORDER BY je.entry_date`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

func (s *AnalyticsQueryService) attendanceFromPG(ctx context.Context, p QueryParams) ([]TimeSeriesPoint, error) {
	rows, err := s.pgDB.QueryContext(ctx,
		`SELECT attendance_date as d, COALESCE(avg(work_hours),0) as v
		 FROM daily_attendance_tracking
		 WHERE attendance_date >= $1 AND attendance_date <= $2
		 GROUP BY attendance_date ORDER BY attendance_date`,
		p.StartDate.Format("2006-01-02"), p.EndDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanTimeSeries(rows)
}

// ==================== Helpers ====================

func makeKPI(label string, value, prior float64, unit string) OverviewKPI {
	change := 0.0
	if prior > 0 {
		change = ((value - prior) / prior) * 100
	}
	return OverviewKPI{
		Label:      label,
		Value:      value,
		Change:     change,
		PriorValue: prior,
		Unit:       unit,
	}
}

func scanTimeSeries(rows *sql.Rows) ([]TimeSeriesPoint, error) {
	var points []TimeSeriesPoint
	for rows.Next() {
		var p TimeSeriesPoint
		var d time.Time
		if err := rows.Scan(&d, &p.Value); err != nil {
			return nil, err
		}
		p.Date = d.Format("2006-01-02")
		points = append(points, p)
	}
	return points, rows.Err()
}

func scanRankedItems(rows *sql.Rows) ([]RankedItem, error) {
	var items []RankedItem
	rank := 1
	for rows.Next() {
		var item RankedItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Value, &item.Quantity); err != nil {
			return nil, err
		}
		item.Rank = rank
		rank++
		items = append(items, item)
	}
	return items, rows.Err()
}
