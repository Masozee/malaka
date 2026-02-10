package http

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// BarcodePrintJobHandler handles HTTP requests for barcode print job operations.
type BarcodePrintJobHandler struct {
	db *sqlx.DB
}

// NewBarcodePrintJobHandler creates a new BarcodePrintJobHandler.
func NewBarcodePrintJobHandler(db *sqlx.DB) *BarcodePrintJobHandler {
	return &BarcodePrintJobHandler{db: db}
}

// barcodePrintJobRow is used for scanning database rows.
type barcodePrintJobRow struct {
	ID              string     `db:"id"`
	JobName         string     `db:"job_name"`
	BarcodeType     string     `db:"barcode_type"`
	Template        string     `db:"template"`
	Status          string     `db:"status"`
	Priority        string     `db:"priority"`
	TotalLabels     int        `db:"total_labels"`
	PrintedLabels   int        `db:"printed_labels"`
	FailedLabels    int        `db:"failed_labels"`
	PrinterName     string     `db:"printer_name"`
	RequestedBy     string     `db:"requested_by"`
	PaperSize       string     `db:"paper_size"`
	LabelDimensions string     `db:"label_dimensions"`
	Notes           string     `db:"notes"`
	StartTime       *time.Time `db:"start_time"`
	CompletedTime   *time.Time `db:"completed_time"`
	CreatedAt       time.Time  `db:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"`
}

type barcodePrintJobResponse struct {
	ID              string  `json:"id"`
	JobNumber       string  `json:"jobNumber"`
	JobName         string  `json:"jobName"`
	BarcodeType     string  `json:"barcodeType"`
	Template        string  `json:"template"`
	Status          string  `json:"status"`
	Priority        string  `json:"priority"`
	TotalLabels     int     `json:"totalLabels"`
	PrintedLabels   int     `json:"printedLabels"`
	FailedLabels    int     `json:"failedLabels"`
	PrinterName     string  `json:"printerName"`
	RequestedBy     string  `json:"requestedBy"`
	PaperSize       string  `json:"paperSize"`
	LabelDimensions string  `json:"labelDimensions"`
	Notes           string  `json:"notes"`
	StartTime       *string `json:"startTime,omitempty"`
	CompletedTime   *string `json:"completedTime,omitempty"`
	CreatedDate     string  `json:"createdDate"`
	UpdatedAt       string  `json:"updatedAt"`
}

type createBarcodePrintJobRequest struct {
	JobName         string `json:"job_name" binding:"required"`
	BarcodeType     string `json:"barcode_type"`
	Template        string `json:"template"`
	Status          string `json:"status"`
	Priority        string `json:"priority"`
	TotalLabels     int    `json:"total_labels"`
	PrinterName     string `json:"printer_name"`
	RequestedBy     string `json:"requested_by"`
	PaperSize       string `json:"paper_size"`
	LabelDimensions string `json:"label_dimensions"`
	Notes           string `json:"notes"`
}

type updateBarcodePrintJobRequest struct {
	JobName         *string `json:"job_name"`
	BarcodeType     *string `json:"barcode_type"`
	Template        *string `json:"template"`
	Status          *string `json:"status"`
	Priority        *string `json:"priority"`
	TotalLabels     *int    `json:"total_labels"`
	PrintedLabels   *int    `json:"printed_labels"`
	FailedLabels    *int    `json:"failed_labels"`
	PrinterName     *string `json:"printer_name"`
	RequestedBy     *string `json:"requested_by"`
	PaperSize       *string `json:"paper_size"`
	LabelDimensions *string `json:"label_dimensions"`
	Notes           *string `json:"notes"`
}

func toBarcodePrintJobResponse(r barcodePrintJobRow) barcodePrintJobResponse {
	resp := barcodePrintJobResponse{
		ID:              r.ID,
		JobNumber:       fmt.Sprintf("PRN-%s", r.ID[len(r.ID)-8:]),
		JobName:         r.JobName,
		BarcodeType:     r.BarcodeType,
		Template:        r.Template,
		Status:          r.Status,
		Priority:        r.Priority,
		TotalLabels:     r.TotalLabels,
		PrintedLabels:   r.PrintedLabels,
		FailedLabels:    r.FailedLabels,
		PrinterName:     r.PrinterName,
		RequestedBy:     r.RequestedBy,
		PaperSize:       r.PaperSize,
		LabelDimensions: r.LabelDimensions,
		Notes:           r.Notes,
		CreatedDate:     r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       r.UpdatedAt.Format(time.RFC3339),
	}
	if r.StartTime != nil {
		s := r.StartTime.Format(time.RFC3339)
		resp.StartTime = &s
	}
	if r.CompletedTime != nil {
		s := r.CompletedTime.Format(time.RFC3339)
		resp.CompletedTime = &s
	}
	return resp
}

const listBarcodePrintJobsSQL = `
SELECT
    id, job_name, barcode_type,
    COALESCE(template, '') as template,
    status, priority,
    total_labels, printed_labels, failed_labels,
    COALESCE(printer_name, '') as printer_name,
    COALESCE(requested_by, '') as requested_by,
    COALESCE(paper_size, '') as paper_size,
    COALESCE(label_dimensions, '') as label_dimensions,
    COALESCE(notes, '') as notes,
    start_time, completed_time,
    created_at, updated_at
FROM barcode_print_jobs
ORDER BY created_at DESC
`

const getBarcodePrintJobSQL = `
SELECT
    id, job_name, barcode_type,
    COALESCE(template, '') as template,
    status, priority,
    total_labels, printed_labels, failed_labels,
    COALESCE(printer_name, '') as printer_name,
    COALESCE(requested_by, '') as requested_by,
    COALESCE(paper_size, '') as paper_size,
    COALESCE(label_dimensions, '') as label_dimensions,
    COALESCE(notes, '') as notes,
    start_time, completed_time,
    created_at, updated_at
FROM barcode_print_jobs
WHERE id = $1
`

const insertBarcodePrintJobSQL = `
INSERT INTO barcode_print_jobs (job_name, barcode_type, template, status, priority, total_labels, printer_name, requested_by, paper_size, label_dimensions, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING id, created_at, updated_at
`

const updateBarcodePrintJobSQL = `
UPDATE barcode_print_jobs SET
    job_name = $1, barcode_type = $2, template = $3, status = $4, priority = $5,
    total_labels = $6, printed_labels = $7, failed_labels = $8,
    printer_name = $9, requested_by = $10, paper_size = $11, label_dimensions = $12,
    notes = $13, updated_at = NOW()
WHERE id = $14
`

const deleteBarcodePrintJobSQL = `DELETE FROM barcode_print_jobs WHERE id = $1`

// GetAll returns all barcode print jobs.
func (h *BarcodePrintJobHandler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()
	var rows []barcodePrintJobRow
	if err := h.db.SelectContext(ctx, &rows, listBarcodePrintJobsSQL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch jobs: " + err.Error()})
		return
	}
	result := make([]barcodePrintJobResponse, 0, len(rows))
	for _, r := range rows {
		result = append(result, toBarcodePrintJobResponse(r))
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Barcode print jobs retrieved", "data": result})
}

// GetByID returns a single barcode print job.
func (h *BarcodePrintJobHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	ctx := c.Request.Context()
	var row barcodePrintJobRow
	if err := h.db.GetContext(ctx, &row, getBarcodePrintJobSQL, id); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Job not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch job: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Job retrieved", "data": toBarcodePrintJobResponse(row)})
}

// Create creates a new barcode print job.
func (h *BarcodePrintJobHandler) Create(c *gin.Context) {
	var req createBarcodePrintJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	barcodeType := req.BarcodeType
	if barcodeType == "" {
		barcodeType = "ean13"
	}
	status := req.Status
	if status == "" {
		status = "queued"
	}
	priority := req.Priority
	if priority == "" {
		priority = "normal"
	}

	ctx := c.Request.Context()
	var id string
	var createdAt, updatedAt time.Time
	err := h.db.QueryRowContext(ctx, insertBarcodePrintJobSQL,
		req.JobName, barcodeType, req.Template, status, priority,
		req.TotalLabels, req.PrinterName, req.RequestedBy,
		req.PaperSize, req.LabelDimensions, req.Notes,
	).Scan(&id, &createdAt, &updatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create job: " + err.Error()})
		return
	}

	// Fetch the created row to return full response
	var row barcodePrintJobRow
	if err := h.db.GetContext(ctx, &row, getBarcodePrintJobSQL, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Job created but failed to fetch: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Job created successfully", "data": toBarcodePrintJobResponse(row)})
}

// Update updates an existing barcode print job.
func (h *BarcodePrintJobHandler) Update(c *gin.Context) {
	id := c.Param("id")
	ctx := c.Request.Context()

	// Fetch existing
	var existing barcodePrintJobRow
	if err := h.db.GetContext(ctx, &existing, getBarcodePrintJobSQL, id); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Job not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch job: " + err.Error()})
		return
	}

	var req updateBarcodePrintJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	// Apply updates
	if req.JobName != nil {
		existing.JobName = *req.JobName
	}
	if req.BarcodeType != nil {
		existing.BarcodeType = *req.BarcodeType
	}
	if req.Template != nil {
		existing.Template = *req.Template
	}
	if req.Status != nil {
		existing.Status = *req.Status
	}
	if req.Priority != nil {
		existing.Priority = *req.Priority
	}
	if req.TotalLabels != nil {
		existing.TotalLabels = *req.TotalLabels
	}
	if req.PrintedLabels != nil {
		existing.PrintedLabels = *req.PrintedLabels
	}
	if req.FailedLabels != nil {
		existing.FailedLabels = *req.FailedLabels
	}
	if req.PrinterName != nil {
		existing.PrinterName = *req.PrinterName
	}
	if req.RequestedBy != nil {
		existing.RequestedBy = *req.RequestedBy
	}
	if req.PaperSize != nil {
		existing.PaperSize = *req.PaperSize
	}
	if req.LabelDimensions != nil {
		existing.LabelDimensions = *req.LabelDimensions
	}
	if req.Notes != nil {
		existing.Notes = *req.Notes
	}

	if _, err := h.db.ExecContext(ctx, updateBarcodePrintJobSQL,
		existing.JobName, existing.BarcodeType, existing.Template,
		existing.Status, existing.Priority,
		existing.TotalLabels, existing.PrintedLabels, existing.FailedLabels,
		existing.PrinterName, existing.RequestedBy, existing.PaperSize,
		existing.LabelDimensions, existing.Notes, id,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update job: " + err.Error()})
		return
	}

	// Re-fetch
	var row barcodePrintJobRow
	if err := h.db.GetContext(ctx, &row, getBarcodePrintJobSQL, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Updated but failed to fetch: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Job updated successfully", "data": toBarcodePrintJobResponse(row)})
}

// Delete deletes a barcode print job.
func (h *BarcodePrintJobHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	ctx := c.Request.Context()
	result, err := h.db.ExecContext(ctx, deleteBarcodePrintJobSQL, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete job: " + err.Error()})
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Job not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Job deleted successfully", "data": nil})
}
