package gorm

import (
	"context"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// PreloadOptimizer provides optimized GORM preloading patterns
// This eliminates N+1 queries when using GORM ORM
type PreloadOptimizer struct {
	db *gorm.DB
}

func NewPreloadOptimizer(db *gorm.DB) *PreloadOptimizer {
	return &PreloadOptimizer{db: db}
}

// ArticleWithRelations represents article with all related entities preloaded
type ArticleWithRelations struct {
	ID               string `gorm:"primary_key"`
	Name             string
	Description      string
	Price            float64
	ClassificationID string
	ColorID          string
	ModelID          string
	SizeID           string
	SupplierID       string
	Barcode          string
	ImageURL         string
	ThumbnailURL     string

	// Preloaded relations - eliminates N+1 queries
	Classification *Classification `gorm:"foreignKey:ClassificationID"`
	Color          *Color          `gorm:"foreignKey:ColorID"`
	Model          *Model          `gorm:"foreignKey:ModelID"`
	Size           *Size           `gorm:"foreignKey:SizeID"`
	Supplier       *Supplier       `gorm:"foreignKey:SupplierID"`
}

type Classification struct {
	ID   string `gorm:"primary_key"`
	Name string
}

type Color struct {
	ID   string `gorm:"primary_key"`
	Name string
}

type Model struct {
	ID   string `gorm:"primary_key"`
	Name string
}

type Size struct {
	ID   string `gorm:"primary_key"`
	Name string
}

type Supplier struct {
	ID    string `gorm:"primary_key"`
	Name  string
	Email string
	Phone string
}

// GetArticlesWithRelationsOptimized - GORM preloading optimization
func (p *PreloadOptimizer) GetArticlesWithRelationsOptimized(ctx context.Context, limit int) ([]*ArticleWithRelations, error) {
	var articles []*ArticleWithRelations

	// Single query with preloading - eliminates N+1 queries
	err := p.db.WithContext(ctx).
		// Preload all relations in single query with JOINs
		Preload("Classification").
		Preload("Color").
		Preload("Model").
		Preload("Size").
		Preload("Supplier").
		// Use Select to specify columns and optimize query
		Select("id, name, description, price, classification_id, color_id, model_id, size_id, supplier_id, barcode, image_url, thumbnail_url").
		// Limit results
		Limit(limit).
		// Order by creation date
		Order("created_at DESC").
		// Execute query
		Find(&articles).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get articles with relations: %w", err)
	}

	return articles, nil
}

// StockBalanceWithDetails represents stock balance with preloaded relations
type StockBalanceWithDetails struct {
	ID          string `gorm:"primary_key"`
	ArticleID   string
	WarehouseID string
	Quantity    int

	// Preloaded relations
	Article   *ArticleWithRelations `gorm:"foreignKey:ArticleID"`
	Warehouse *Warehouse           `gorm:"foreignKey:WarehouseID"`
}

type Warehouse struct {
	ID      string `gorm:"primary_key"`
	Name    string
	Code    string
	Address string
	City    string
	Type    string
	Status  string
}

// GetStockBalancesWithDetailsOptimized - Optimized GORM preloading for stock balances
func (p *PreloadOptimizer) GetStockBalancesWithDetailsOptimized(ctx context.Context, warehouseID *string) ([]*StockBalanceWithDetails, error) {
	var stockBalances []*StockBalanceWithDetails

	query := p.db.WithContext(ctx).
		// Preload article with its relations (nested preloading)
		Preload("Article").
		Preload("Article.Classification").
		Preload("Article.Color").
		Preload("Article.Model").
		Preload("Article.Supplier").
		// Preload warehouse
		Preload("Warehouse").
		// Only non-zero quantities
		Where("quantity > 0").
		// Order by creation date
		Order("created_at DESC")

	// Optional warehouse filter
	if warehouseID != nil {
		query = query.Where("warehouse_id = ?", *warehouseID)
	}

	err := query.Find(&stockBalances).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get stock balances with details: %w", err)
	}

	return stockBalances, nil
}

// PurchaseOrderWithItems represents purchase order with preloaded items and relations
type PurchaseOrderWithItems struct {
	ID           string  `gorm:"primary_key"`
	OrderNumber  string
	OrderDate    string
	Status       string
	TotalAmount  float64
	SupplierID   string

	// Preloaded relations
	Supplier *Supplier             `gorm:"foreignKey:SupplierID"`
	Items    []*PurchaseOrderItem  `gorm:"foreignKey:PurchaseOrderID"`
}

type PurchaseOrderItem struct {
	ID               string  `gorm:"primary_key"`
	PurchaseOrderID  string
	ArticleID        string
	Quantity         int
	UnitPrice        float64

	// Preloaded relations
	Article *ArticleWithRelations `gorm:"foreignKey:ArticleID"`
}

// GetPurchaseOrdersWithItemsOptimized - Optimized GORM preloading for purchase orders
func (p *PreloadOptimizer) GetPurchaseOrdersWithItemsOptimized(ctx context.Context, limit int) ([]*PurchaseOrderWithItems, error) {
	var orders []*PurchaseOrderWithItems

	err := p.db.WithContext(ctx).
		// Preload supplier
		Preload("Supplier").
		// Preload items with their articles and relations (deep preloading)
		Preload("Items").
		Preload("Items.Article").
		Preload("Items.Article.Classification").
		Preload("Items.Article.Color").
		Preload("Items.Article.Model").
		Preload("Items.Article.Supplier").
		// Limit and order
		Limit(limit).
		Order("order_date DESC").
		// Execute query
		Find(&orders).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get purchase orders with items: %w", err)
	}

	return orders, nil
}

// SelectivePreloadingOptions provides selective preloading for performance
type SelectivePreloadingOptions struct {
	IncludeClassification bool
	IncludeColor         bool
	IncludeModel         bool
	IncludeSize          bool
	IncludeSupplier      bool
}

// GetArticlesWithSelectivePreloading - Selective preloading based on needs
func (p *PreloadOptimizer) GetArticlesWithSelectivePreloading(ctx context.Context, options SelectivePreloadingOptions, limit int) ([]*ArticleWithRelations, error) {
	var articles []*ArticleWithRelations

	query := p.db.WithContext(ctx)

	// Selective preloading based on requirements
	if options.IncludeClassification {
		query = query.Preload("Classification")
	}
	if options.IncludeColor {
		query = query.Preload("Color")
	}
	if options.IncludeModel {
		query = query.Preload("Model")
	}
	if options.IncludeSize {
		query = query.Preload("Size")
	}
	if options.IncludeSupplier {
		query = query.Preload("Supplier")
	}

	err := query.
		Limit(limit).
		Order("created_at DESC").
		Find(&articles).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get articles with selective preloading: %w", err)
	}

	return articles, nil
}

// BatchPreloadingExample - Advanced batch preloading with custom queries
func (p *PreloadOptimizer) BatchPreloadingExample(ctx context.Context) error {
	var articles []*ArticleWithRelations

	// Custom preloading with specific conditions and selections
	err := p.db.WithContext(ctx).
		// Preload with custom conditions
		Preload("Classification", "status = ?", "active").
		Preload("Color", "is_available = ?", true).
		Preload("Supplier", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email").Where("status = ?", "active")
		}).
		// Use joins for better performance on certain relations
		Joins("Classification").
		// Select specific columns to reduce data transfer
		Select("articles.id, articles.name, articles.price, articles.classification_id").
		// Add conditions
		Where("articles.price > ?", 0).
		// Execute
		Find(&articles).Error

	return err
}

// PreloadWithClauses - Using clause.Associations for advanced preloading
func (p *PreloadOptimizer) PreloadWithClauses(ctx context.Context) ([]*ArticleWithRelations, error) {
	var articles []*ArticleWithRelations

	err := p.db.WithContext(ctx).
		// Preload all associations automatically
		Preload(clause.Associations).
		// Alternatively, preload specific nested associations
		// Preload("Supplier.Country").
		// Preload("Classification.Category").
		Find(&articles).Error

	if err != nil {
		return nil, fmt.Errorf("failed to preload with clauses: %w", err)
	}

	return articles, nil
}

// OptimizedCountWithJoins - Efficient counting with joins instead of subqueries
func (p *PreloadOptimizer) OptimizedCountWithJoins(ctx context.Context) (int64, error) {
	var count int64

	// Efficient count with joins - avoids N+1 in count queries
	err := p.db.WithContext(ctx).
		Model(&ArticleWithRelations{}).
		Joins("LEFT JOIN classifications ON articles.classification_id = classifications.id").
		Joins("LEFT JOIN suppliers ON articles.supplier_id = suppliers.id").
		Where("classifications.status = ? AND suppliers.status = ?", "active", "active").
		Count(&count).Error

	return count, err
}

// PaginatedPreloading - Optimized pagination with preloading
func (p *PreloadOptimizer) PaginatedPreloading(ctx context.Context, page, pageSize int) ([]*ArticleWithRelations, int64, error) {
	var articles []*ArticleWithRelations
	var total int64

	// First, get total count efficiently
	countQuery := p.db.WithContext(ctx).Model(&ArticleWithRelations{})
	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count articles: %w", err)
	}

	// Then get paginated results with preloading
	offset := (page - 1) * pageSize
	err := p.db.WithContext(ctx).
		Preload("Classification").
		Preload("Color").
		Preload("Model").
		Preload("Supplier").
		Offset(offset).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&articles).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to get paginated articles: %w", err)
	}

	return articles, total, nil
}

// PreloadingBenchmarkComparison demonstrates performance difference
func (p *PreloadOptimizer) PreloadingBenchmarkComparison(ctx context.Context) error {
	// ❌ BAD: N+1 Query Pattern (without preloading)
	// This will execute 1 + N queries
	var articlesN1 []*ArticleWithRelations
	if err := p.db.WithContext(ctx).Find(&articlesN1).Error; err != nil {
		return err
	}
	
	// Each access to relations triggers a separate query
	for _, article := range articlesN1 {
		_ = article.Classification // Query 1
		_ = article.Color          // Query 2
		_ = article.Model          // Query 3  
		_ = article.Supplier       // Query 4
		// Total: 1 + (4 * N) queries
	}

	// ✅ GOOD: Optimized Preloading (single query with joins)
	var articlesOptimized []*ArticleWithRelations
	err := p.db.WithContext(ctx).
		Preload("Classification").
		Preload("Color").
		Preload("Model").
		Preload("Supplier").
		Find(&articlesOptimized).Error
		// Total: 1 query (or 5 queries max with eager loading)

	return err
}

// ConditionalPreloading - Preload based on runtime conditions
func (p *PreloadOptimizer) ConditionalPreloading(ctx context.Context, includeSupplier, includeClassification bool) ([]*ArticleWithRelations, error) {
	var articles []*ArticleWithRelations

	query := p.db.WithContext(ctx)

	// Conditionally preload based on business logic
	if includeSupplier {
		query = query.Preload("Supplier", "status = ?", "active")
	}
	
	if includeClassification {
		query = query.Preload("Classification")
	}

	// Always preload color and model for this use case
	query = query.Preload("Color").Preload("Model")

	err := query.Find(&articles).Error
	return articles, err
}