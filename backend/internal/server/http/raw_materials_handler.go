package http

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// RawMaterialsHandler handles raw materials CRUD endpoints.
type RawMaterialsHandler struct {
	db *sqlx.DB
}

// NewRawMaterialsHandler creates a new RawMaterialsHandler.
func NewRawMaterialsHandler(db *sqlx.DB) *RawMaterialsHandler {
	return &RawMaterialsHandler{db: db}
}

// materialRow represents a row from the materials table.
type materialRow struct {
	ID            string         `db:"id"`
	MaterialCode  string         `db:"material_code"`
	MaterialName  string         `db:"material_name"`
	Description   string         `db:"description"`
	Category      string         `db:"category"`
	UnitOfMeasure string         `db:"unit_of_measure"`
	StandardCost  float64        `db:"standard_cost"`
	CurrentCost   float64        `db:"current_cost"`
	CurrentStock  int            `db:"current_stock"`
	MinimumStock  int            `db:"minimum_stock"`
	MaximumStock  int            `db:"maximum_stock"`
	ReorderPoint  int            `db:"reorder_point"`
	SupplierID    sql.NullString `db:"supplier_id"`
	SupplierName  string         `db:"supplier_name"`
	LeadTimeDays  int            `db:"lead_time_days"`
	Location      string         `db:"location"`
	IsActive      bool           `db:"is_active"`
	CreatedAt     time.Time      `db:"created_at"`
	UpdatedAt     time.Time      `db:"updated_at"`
}

// materialResponse is the JSON response for a material.
type materialResponse struct {
	ID           string  `json:"id"`
	MaterialCode string  `json:"materialCode"`
	MaterialName string  `json:"materialName"`
	Description  string  `json:"description,omitempty"`
	Category     string  `json:"category"`
	Unit         string  `json:"unit"`
	CurrentStock int     `json:"currentStock"`
	MinStock     int     `json:"minStock"`
	MaxStock     int     `json:"maxStock"`
	UnitCost     float64 `json:"unitCost"`
	TotalValue   float64 `json:"totalValue"`
	Supplier     string  `json:"supplier"`
	SupplierID   string  `json:"supplierId,omitempty"`
	LeadTime     int     `json:"leadTime"`
	Status       string  `json:"status"`
	Location     string  `json:"location"`
	IsActive     bool    `json:"isActive"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

func toMaterialResponse(r materialRow) materialResponse {
	status := "in_stock"
	if r.CurrentStock == 0 {
		status = "out_of_stock"
	} else if r.CurrentStock <= r.MinimumStock {
		status = "low_stock"
	}

	supplierID := ""
	if r.SupplierID.Valid {
		supplierID = r.SupplierID.String
	}

	return materialResponse{
		ID:           r.ID,
		MaterialCode: r.MaterialCode,
		MaterialName: r.MaterialName,
		Description:  r.Description,
		Category:     r.Category,
		Unit:         r.UnitOfMeasure,
		CurrentStock: r.CurrentStock,
		MinStock:     r.MinimumStock,
		MaxStock:     r.MaximumStock,
		UnitCost:     r.CurrentCost,
		TotalValue:   float64(r.CurrentStock) * r.CurrentCost,
		Supplier:     r.SupplierName,
		SupplierID:   supplierID,
		LeadTime:     r.LeadTimeDays,
		Status:       status,
		Location:     r.Location,
		IsActive:     r.IsActive,
		CreatedAt:    r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    r.UpdatedAt.Format(time.RFC3339),
	}
}

const listMaterialsSQL = `
SELECT
    m.id, m.material_code, m.material_name,
    COALESCE(m.description, '') as description,
    COALESCE(m.category, '') as category,
    m.unit_of_measure,
    m.standard_cost, m.current_cost,
    COALESCE(m.current_stock, 0) as current_stock,
    m.minimum_stock, m.maximum_stock, m.reorder_point,
    m.supplier_id,
    COALESCE(s.name, '') as supplier_name,
    m.lead_time_days,
    COALESCE(m.location, '') as location,
    m.is_active,
    m.created_at, m.updated_at
FROM materials m
LEFT JOIN suppliers s ON m.supplier_id = s.id
WHERE m.is_active = true
ORDER BY m.material_code ASC
`

// GetAll returns all active materials.
func (h *RawMaterialsHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()

	var rows []materialRow
	if err := h.db.SelectContext(ctx, &rows, listMaterialsSQL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch materials: " + err.Error(),
		})
		return
	}

	result := make([]materialResponse, 0, len(rows))
	for _, r := range rows {
		result = append(result, toMaterialResponse(r))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

const getMaterialByIDSQL = `
SELECT
    m.id, m.material_code, m.material_name,
    COALESCE(m.description, '') as description,
    COALESCE(m.category, '') as category,
    m.unit_of_measure,
    m.standard_cost, m.current_cost,
    COALESCE(m.current_stock, 0) as current_stock,
    m.minimum_stock, m.maximum_stock, m.reorder_point,
    m.supplier_id,
    COALESCE(s.name, '') as supplier_name,
    m.lead_time_days,
    COALESCE(m.location, '') as location,
    m.is_active,
    m.created_at, m.updated_at
FROM materials m
LEFT JOIN suppliers s ON m.supplier_id = s.id
WHERE m.id = $1
`

// GetByID returns a single material by ID.
func (h *RawMaterialsHandler) GetByID(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	var row materialRow
	if err := h.db.GetContext(ctx, &row, getMaterialByIDSQL, id); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Material not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch material: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    toMaterialResponse(row),
	})
}

// createMaterialRequest is the JSON body for creating a material.
type createMaterialRequest struct {
	MaterialCode string  `json:"materialCode" binding:"required"`
	MaterialName string  `json:"materialName" binding:"required"`
	Description  string  `json:"description"`
	Category     string  `json:"category"`
	Unit         string  `json:"unit" binding:"required"`
	MinStock     int     `json:"minStock"`
	MaxStock     int     `json:"maxStock"`
	UnitCost     float64 `json:"unitCost"`
	SupplierID   *string `json:"supplierId"`
	LeadTime     int     `json:"leadTime"`
	Location     string  `json:"location"`
}

// Create creates a new material.
func (h *RawMaterialsHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()

	var req createMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// Handle empty supplier ID
	var supplierID interface{}
	if req.SupplierID != nil && *req.SupplierID != "" {
		supplierID = *req.SupplierID
	} else {
		supplierID = nil
	}

	var id string
	err := h.db.QueryRowContext(ctx, `
		INSERT INTO materials (material_code, material_name, description, category, unit_of_measure,
			current_cost, standard_cost, minimum_stock, maximum_stock, supplier_id, lead_time_days,
			location, current_stock, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10, $11, 0, true)
		RETURNING id
	`, req.MaterialCode, req.MaterialName, req.Description, req.Category, req.Unit,
		req.UnitCost, req.MinStock, req.MaxStock, supplierID, req.LeadTime, req.Location,
	).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create material: " + err.Error(),
		})
		return
	}

	// Fetch the created material
	var row materialRow
	if err := h.db.GetContext(ctx, &row, getMaterialByIDSQL, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Material created but failed to fetch: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    toMaterialResponse(row),
	})
}

// updateMaterialRequest is the JSON body for updating a material.
type updateMaterialRequest struct {
	MaterialCode *string  `json:"materialCode"`
	MaterialName *string  `json:"materialName"`
	Description  *string  `json:"description"`
	Category     *string  `json:"category"`
	Unit         *string  `json:"unit"`
	MinStock     *int     `json:"minStock"`
	MaxStock     *int     `json:"maxStock"`
	UnitCost     *float64 `json:"unitCost"`
	CurrentStock *int     `json:"currentStock"`
	SupplierID   *string  `json:"supplierId"`
	LeadTime     *int     `json:"leadTime"`
	Location     *string  `json:"location"`
	IsActive     *bool    `json:"isActive"`
}

// Update updates an existing material.
func (h *RawMaterialsHandler) Update(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	var req updateMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// Check existence
	var exists bool
	if err := h.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM materials WHERE id = $1)`, id).Scan(&exists); err != nil || !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Material not found",
		})
		return
	}

	// Build dynamic update
	query := "UPDATE materials SET updated_at = NOW()"
	args := []interface{}{}
	argIdx := 1

	if req.MaterialCode != nil {
		query += fmt.Sprintf(", material_code = $%d", argIdx)
		args = append(args, *req.MaterialCode)
		argIdx++
	}
	if req.MaterialName != nil {
		query += fmt.Sprintf(", material_name = $%d", argIdx)
		args = append(args, *req.MaterialName)
		argIdx++
	}
	if req.Description != nil {
		query += fmt.Sprintf(", description = $%d", argIdx)
		args = append(args, *req.Description)
		argIdx++
	}
	if req.Category != nil {
		query += fmt.Sprintf(", category = $%d", argIdx)
		args = append(args, *req.Category)
		argIdx++
	}
	if req.Unit != nil {
		query += fmt.Sprintf(", unit_of_measure = $%d", argIdx)
		args = append(args, *req.Unit)
		argIdx++
	}
	if req.MinStock != nil {
		query += fmt.Sprintf(", minimum_stock = $%d", argIdx)
		args = append(args, *req.MinStock)
		argIdx++
	}
	if req.MaxStock != nil {
		query += fmt.Sprintf(", maximum_stock = $%d", argIdx)
		args = append(args, *req.MaxStock)
		argIdx++
	}
	if req.UnitCost != nil {
		query += fmt.Sprintf(", current_cost = $%d, standard_cost = $%d", argIdx, argIdx)
		args = append(args, *req.UnitCost)
		argIdx++
	}
	if req.CurrentStock != nil {
		query += fmt.Sprintf(", current_stock = $%d", argIdx)
		args = append(args, *req.CurrentStock)
		argIdx++
	}
	if req.SupplierID != nil {
		if *req.SupplierID == "" {
			query += fmt.Sprintf(", supplier_id = NULL")
		} else {
			query += fmt.Sprintf(", supplier_id = $%d", argIdx)
			args = append(args, *req.SupplierID)
			argIdx++
		}
	}
	if req.LeadTime != nil {
		query += fmt.Sprintf(", lead_time_days = $%d", argIdx)
		args = append(args, *req.LeadTime)
		argIdx++
	}
	if req.Location != nil {
		query += fmt.Sprintf(", location = $%d", argIdx)
		args = append(args, *req.Location)
		argIdx++
	}
	if req.IsActive != nil {
		query += fmt.Sprintf(", is_active = $%d", argIdx)
		args = append(args, *req.IsActive)
		argIdx++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argIdx)
	args = append(args, id)

	if _, err := h.db.ExecContext(ctx, query, args...); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update material: " + err.Error(),
		})
		return
	}

	// Fetch updated material
	var row materialRow
	if err := h.db.GetContext(ctx, &row, getMaterialByIDSQL, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Material updated but failed to fetch: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    toMaterialResponse(row),
	})
}

// Delete soft-deletes a material by setting is_active = false.
func (h *RawMaterialsHandler) Delete(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	result, err := h.db.ExecContext(ctx, `UPDATE materials SET is_active = false, updated_at = NOW() WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete material: " + err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Material not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Material deleted successfully",
	})
}
