package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/accounting/domain/entities"
)

// OptimizedCostCenterMethods contains optimized versions of cost center methods
// These methods eliminate N+1 queries by using batch operations and joins

type OptimizedCostCenterMethods struct {
	db *sqlx.DB
}

func NewOptimizedCostCenterMethods(db *sqlx.DB) *OptimizedCostCenterMethods {
	return &OptimizedCostCenterMethods{db: db}
}

// ProcessAllocationsOptimized - OPTIMIZED VERSION without N+1 queries
func (r *OptimizedCostCenterMethods) ProcessAllocationsOptimized(ctx context.Context, costCenterID uuid.UUID, period time.Time) error {
	// Single query to get allocations with their source cost center costs
	// This eliminates the N+1 query pattern
	query := `
		WITH allocation_costs AS (
			-- Get all active allocations
			SELECT 
				a.id,
				a.cost_center_id,
				a.source_cost_center_id,
				a.allocation_basis,
				a.allocation_value,
				a.period_start,
				a.period_end,
				a.description,
				a.is_active,
				-- Get direct costs for source cost center in single query
				COALESCE(SUM(gl.debit_amount - gl.credit_amount), 0) as source_costs
			FROM cost_center_allocations a
			LEFT JOIN general_ledger gl ON gl.cost_center_id = a.source_cost_center_id
				AND gl.transaction_date >= $3 
				AND gl.transaction_date <= $2
			WHERE a.cost_center_id = $1
				AND a.is_active = true
				AND a.period_start <= $2
				AND a.period_end >= $2
			GROUP BY a.id, a.cost_center_id, a.source_cost_center_id, 
					 a.allocation_basis, a.allocation_value, a.period_start, 
					 a.period_end, a.description, a.is_active
		)
		SELECT * FROM allocation_costs
	`

	periodStart := period.AddDate(0, 0, -30)
	
	rows, err := r.db.QueryContext(ctx, query, costCenterID, period, periodStart)
	if err != nil {
		return fmt.Errorf("failed to get allocations with costs: %w", err)
	}
	defer rows.Close()

	// Process allocations in batch
	var allocationsToUpdate []*entities.CostCenterAllocation
	
	for rows.Next() {
		allocation := &entities.CostCenterAllocation{}
		var sourceCosts float64
		
		err := rows.Scan(
			&allocation.ID,
			&allocation.CostCenterID,
			&allocation.SourceCostCenterID,
			&allocation.AllocationBasis,
			&allocation.AllocationValue,
			&allocation.PeriodStart,
			&allocation.PeriodEnd,
			&allocation.Description,
			&allocation.IsActive,
			&sourceCosts,
		)
		if err != nil {
			return fmt.Errorf("failed to scan allocation: %w", err)
		}

		// Calculate allocated amount
		allocation.CalculateAllocatedAmount(sourceCosts)
		allocationsToUpdate = append(allocationsToUpdate, allocation)
	}

	if err = rows.Err(); err != nil {
		return fmt.Errorf("error reading allocation rows: %w", err)
	}

	// Batch update allocations (instead of individual updates)
	return r.BatchUpdateAllocations(ctx, allocationsToUpdate)
}

// BatchUpdateAllocations - Optimized batch update instead of individual updates
func (r *OptimizedCostCenterMethods) BatchUpdateAllocations(ctx context.Context, allocations []*entities.CostCenterAllocation) error {
	if len(allocations) == 0 {
		return nil
	}

	// Use a transaction for batch updates
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Prepare the update statement
	updateQuery := `
		UPDATE cost_center_allocations SET 
			allocated_amount = $2, 
			updated_at = $3
		WHERE id = $1
	`

	stmt, err := tx.PrepareContext(ctx, updateQuery)
	if err != nil {
		return fmt.Errorf("failed to prepare update statement: %w", err)
	}
	defer stmt.Close()

	// Batch execute updates
	now := time.Now()
	for _, allocation := range allocations {
		allocation.UpdatedAt = now
		_, err := stmt.ExecContext(ctx, allocation.ID, allocation.AllocatedAmount, allocation.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to update allocation %s: %w", allocation.ID, err)
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit allocation updates: %w", err)
	}

	return nil
}

// GetDirectCostsBatch - Optimized batch version to get costs for multiple cost centers
func (r *OptimizedCostCenterMethods) GetDirectCostsBatch(ctx context.Context, costCenterIDs []uuid.UUID, startDate, endDate time.Time) (map[uuid.UUID]float64, error) {
	if len(costCenterIDs) == 0 {
		return make(map[uuid.UUID]float64), nil
	}

	// Create placeholder string for IN clause
	placeholders := make([]interface{}, len(costCenterIDs)+2)
	placeholders[0] = startDate
	placeholders[1] = endDate
	
	inClause := ""
	for i, id := range costCenterIDs {
		if i > 0 {
			inClause += ", "
		}
		inClause += fmt.Sprintf("$%d", i+3)
		placeholders[i+2] = id
	}

	query := fmt.Sprintf(`
		SELECT 
			cost_center_id,
			COALESCE(SUM(debit_amount - credit_amount), 0) as total_costs
		FROM general_ledger 
		WHERE transaction_date >= $1 
			AND transaction_date <= $2
			AND cost_center_id IN (%s)
		GROUP BY cost_center_id
	`, inClause)

	rows, err := r.db.QueryContext(ctx, query, placeholders...)
	if err != nil {
		return nil, fmt.Errorf("failed to get batch direct costs: %w", err)
	}
	defer rows.Close()

	costs := make(map[uuid.UUID]float64)
	for rows.Next() {
		var costCenterID uuid.UUID
		var totalCosts float64
		
		err := rows.Scan(&costCenterID, &totalCosts)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cost data: %w", err)
		}
		
		costs[costCenterID] = totalCosts
	}

	return costs, rows.Err()
}

// GetArticlesWithRelatedDataOptimized - Example for articles N+1 optimization
func (r *OptimizedCostCenterMethods) GetArticlesWithRelatedDataOptimized(ctx context.Context) ([]*ArticleWithRelations, error) {
	// Single query with JOINs instead of N+1 pattern
	query := `
		SELECT 
			a.id, a.name, a.description, a.price, a.created_at,
			c.id as classification_id, c.name as classification_name,
			col.id as color_id, col.name as color_name,
			m.id as model_id, m.name as model_name,
			s.id as size_id, s.name as size_name,
			sup.id as supplier_id, sup.name as supplier_name
		FROM articles a
		LEFT JOIN classifications c ON a.classification_id = c.id
		LEFT JOIN colors col ON a.color_id = col.id
		LEFT JOIN models m ON a.model_id = m.id
		LEFT JOIN sizes s ON a.size_id = s.id
		LEFT JOIN suppliers sup ON a.supplier_id = sup.id
		ORDER BY a.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get articles with relations: %w", err)
	}
	defer rows.Close()

	var articles []*ArticleWithRelations
	for rows.Next() {
		article := &ArticleWithRelations{}
		
		err := rows.Scan(
			&article.ID, &article.Name, &article.Description, &article.Price, &article.CreatedAt,
			&article.Classification.ID, &article.Classification.Name,
			&article.Color.ID, &article.Color.Name,
			&article.Model.ID, &article.Model.Name,
			&article.Size.ID, &article.Size.Name,
			&article.Supplier.ID, &article.Supplier.Name,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan article with relations: %w", err)
		}
		
		articles = append(articles, article)
	}

	return articles, rows.Err()
}

// ArticleWithRelations - Example struct for optimized article queries
type ArticleWithRelations struct {
	ID            uuid.UUID    `db:"id"`
	Name          string       `db:"name"`
	Description   string       `db:"description"`
	Price         float64      `db:"price"`
	CreatedAt     time.Time    `db:"created_at"`
	Classification RelatedEntity `db:"classification"`
	Color         RelatedEntity `db:"color"`
	Model         RelatedEntity `db:"model"`
	Size          RelatedEntity `db:"size"`
	Supplier      RelatedEntity `db:"supplier"`
}

type RelatedEntity struct {
	ID   uuid.UUID `db:"id"`
	Name string    `db:"name"`
}

// GetStockBalancesWithDetailsOptimized - Example for inventory N+1 optimization
func (r *OptimizedCostCenterMethods) GetStockBalancesWithDetailsOptimized(ctx context.Context, warehouseID *uuid.UUID) ([]*StockBalanceWithDetails, error) {
	whereClause := ""
	args := []interface{}{}
	
	if warehouseID != nil {
		whereClause = "WHERE sb.warehouse_id = $1"
		args = append(args, *warehouseID)
	}

	// Single query with JOINs instead of separate queries for each stock balance
	query := fmt.Sprintf(`
		SELECT 
			sb.id, sb.quantity, sb.created_at, sb.updated_at,
			a.id as article_id, a.name as article_name, a.price as article_price,
			w.id as warehouse_id, w.name as warehouse_name, w.code as warehouse_code,
			c.name as classification_name,
			col.name as color_name,
			m.name as model_name
		FROM stock_balances sb
		LEFT JOIN articles a ON sb.article_id = a.id
		LEFT JOIN warehouses w ON sb.warehouse_id = w.id
		LEFT JOIN classifications c ON a.classification_id = c.id
		LEFT JOIN colors col ON a.color_id = col.id
		LEFT JOIN models m ON a.model_id = m.id
		%s
		ORDER BY sb.created_at DESC
	`, whereClause)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get stock balances with details: %w", err)
	}
	defer rows.Close()

	var stockBalances []*StockBalanceWithDetails
	for rows.Next() {
		sb := &StockBalanceWithDetails{}
		
		err := rows.Scan(
			&sb.ID, &sb.Quantity, &sb.CreatedAt, &sb.UpdatedAt,
			&sb.Article.ID, &sb.Article.Name, &sb.Article.Price,
			&sb.Warehouse.ID, &sb.Warehouse.Name, &sb.Warehouse.Code,
			&sb.ClassificationName, &sb.ColorName, &sb.ModelName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan stock balance with details: %w", err)
		}
		
		stockBalances = append(stockBalances, sb)
	}

	return stockBalances, rows.Err()
}

type StockBalanceWithDetails struct {
	ID                  uuid.UUID    `db:"id"`
	Quantity           int          `db:"quantity"`
	CreatedAt          time.Time    `db:"created_at"`
	UpdatedAt          time.Time    `db:"updated_at"`
	Article            ArticleInfo  `db:"article"`
	Warehouse          WarehouseInfo `db:"warehouse"`
	ClassificationName string       `db:"classification_name"`
	ColorName          string       `db:"color_name"`
	ModelName          string       `db:"model_name"`
}

type ArticleInfo struct {
	ID    uuid.UUID `db:"id"`
	Name  string    `db:"name"`
	Price float64   `db:"price"`
}

type WarehouseInfo struct {
	ID   uuid.UUID `db:"id"`
	Name string    `db:"name"`
	Code string    `db:"code"`
}