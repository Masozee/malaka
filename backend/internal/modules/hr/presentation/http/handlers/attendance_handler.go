package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"malaka/internal/shared/response"
)

type AttendanceHandler struct {
	db *sql.DB
}

func NewAttendanceHandler(db *sql.DB) *AttendanceHandler {
	return &AttendanceHandler{db: db}
}

// AttendanceRecord represents the database structure
type AttendanceRecord struct {
	ID               string  `json:"id" db:"id"`
	EmployeeID       string  `json:"employee_id" db:"employee_id"`
	AttendanceDate   string  `json:"attendance_date" db:"attendance_date"`
	ScheduledIn      *string `json:"scheduled_in" db:"scheduled_in"`
	ScheduledOut     *string `json:"scheduled_out" db:"scheduled_out"`
	ActualIn         *string `json:"actual_in" db:"actual_in"`
	ActualOut        *string `json:"actual_out" db:"actual_out"`
	LateMinutes      int     `json:"late_minutes" db:"late_minutes"`
	EarlyOutMinutes  int     `json:"early_out_minutes" db:"early_out_minutes"`
	WorkHours        float64 `json:"work_hours" db:"work_hours"`
	OvertimeHours    float64 `json:"overtime_hours" db:"overtime_hours"`
	Status           string  `json:"status" db:"status"`
	Remarks          *string `json:"remarks" db:"remarks"`
	ApprovedBy       *string `json:"approved_by" db:"approved_by"`
	ApprovedAt       *string `json:"approved_at" db:"approved_at"`
	CreatedAt        string  `json:"created_at" db:"created_at"`
	UpdatedAt        string  `json:"updated_at" db:"updated_at"`
}

// GetAttendanceRecords handles GET /api/v1/hr/attendance
func (h *AttendanceHandler) GetAttendanceRecords(c *gin.Context) {
	if h.db == nil {
		response.Error(c, http.StatusInternalServerError, "Database connection not available", nil)
		return
	}
	
	// Query attendance records from database
	query := `
		SELECT 
			id, employee_id, attendance_date, 
			scheduled_in, scheduled_out, actual_in, actual_out,
			late_minutes, early_out_minutes, work_hours, overtime_hours,
			status, remarks, approved_by, approved_at,
			created_at, updated_at
		FROM daily_attendance_tracking 
		ORDER BY attendance_date DESC, created_at DESC
		LIMIT 100
	`
	
	rows, err := h.db.Query(query)
	if err != nil {
		log.Printf("Error querying attendance records: %v", err)
		response.Error(c, http.StatusInternalServerError, "Failed to fetch attendance records", nil)
		return
	}
	defer rows.Close()
	
	var records []AttendanceRecord
	for rows.Next() {
		var record AttendanceRecord
		err := rows.Scan(
			&record.ID, &record.EmployeeID, &record.AttendanceDate,
			&record.ScheduledIn, &record.ScheduledOut, &record.ActualIn, &record.ActualOut,
			&record.LateMinutes, &record.EarlyOutMinutes, &record.WorkHours, &record.OvertimeHours,
			&record.Status, &record.Remarks, &record.ApprovedBy, &record.ApprovedAt,
			&record.CreatedAt, &record.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning attendance record: %v", err)
			continue
		}
		records = append(records, record)
	}
	
	if err = rows.Err(); err != nil {
		log.Printf("Error iterating attendance records: %v", err)
		response.Error(c, http.StatusInternalServerError, "Failed to process attendance records", nil)
		return
	}
	
	log.Printf("Successfully fetched %d attendance records", len(records))
	response.Success(c, http.StatusOK, fmt.Sprintf("Successfully retrieved %d attendance records", len(records)), records)
}

// GetAttendanceByEmployee handles GET /api/v1/hr/attendance/employee/:id
func (h *AttendanceHandler) GetAttendanceByEmployee(c *gin.Context) {
	employeeID := c.Param("id")
	
	// TODO: Implement database query for specific employee attendance
	response.Success(c, http.StatusOK, "Employee attendance endpoint ready", map[string]interface{}{
		"employee_id": employeeID,
		"records":     []AttendanceRecord{},
	})
}

// CreateAttendanceRecord handles POST /api/v1/hr/attendance
func (h *AttendanceHandler) CreateAttendanceRecord(c *gin.Context) {
	// TODO: Implement attendance record creation
	response.Success(c, http.StatusOK, "Attendance creation endpoint ready", nil)
}

// UpdateAttendanceRecord handles PUT /api/v1/hr/attendance/:id
func (h *AttendanceHandler) UpdateAttendanceRecord(c *gin.Context) {
	recordID := c.Param("id")
	
	// TODO: Implement attendance record update
	response.Success(c, http.StatusOK, "Attendance update endpoint ready", map[string]interface{}{
		"record_id": recordID,
	})
}