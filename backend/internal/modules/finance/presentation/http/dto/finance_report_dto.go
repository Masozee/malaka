package dto

import (
	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// FinanceReportCreateRequest represents the request to create a finance report.
type FinanceReportCreateRequest struct {
	ReportName  string `json:"report_name" binding:"required"`
	Type        string `json:"type" binding:"required"`
	Period      string `json:"period" binding:"required"`
	GeneratedBy string `json:"generated_by"`
	FileSize    string `json:"file_size"`
	FilePath    string `json:"file_path"`
	Status      string `json:"status" binding:"required"`
	CompanyID   string `json:"company_id"`
}

// FinanceReportUpdateRequest represents the request to update a finance report.
type FinanceReportUpdateRequest struct {
	ReportName  string `json:"report_name"`
	Type        string `json:"type"`
	Period      string `json:"period"`
	GeneratedBy string `json:"generated_by"`
	FileSize    string `json:"file_size"`
	FilePath    string `json:"file_path"`
	Status      string `json:"status"`
	CompanyID   string `json:"company_id"`
}

// FinanceReportResponse represents the response for a finance report.
type FinanceReportResponse struct {
	ID          string `json:"id"`
	ReportName  string `json:"report_name"`
	Type        string `json:"type"`
	Period      string `json:"period"`
	GeneratedBy string `json:"generated_by"`
	FileSize    string `json:"file_size"`
	FilePath    string `json:"file_path"`
	Status      string `json:"status"`
	CompanyID   string `json:"company_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// ToFinanceReportEntity converts FinanceReportCreateRequest to entities.FinanceReport.
func (req *FinanceReportCreateRequest) ToFinanceReportEntity() *entities.FinanceReport {
	return &entities.FinanceReport{
		BaseModel:   types.BaseModel{},
		ReportName:  req.ReportName,
		Type:        req.Type,
		Period:      req.Period,
		GeneratedBy: req.GeneratedBy,
		FileSize:    req.FileSize,
		FilePath:    req.FilePath,
		Status:      req.Status,
		CompanyID:   req.CompanyID,
	}
}

// ToFinanceReportEntity converts FinanceReportUpdateRequest to entities.FinanceReport.
func (req *FinanceReportUpdateRequest) ToFinanceReportEntity() *entities.FinanceReport {
	return &entities.FinanceReport{
		BaseModel:   types.BaseModel{},
		ReportName:  req.ReportName,
		Type:        req.Type,
		Period:      req.Period,
		GeneratedBy: req.GeneratedBy,
		FileSize:    req.FileSize,
		FilePath:    req.FilePath,
		Status:      req.Status,
		CompanyID:   req.CompanyID,
	}
}

// FromFinanceReportEntity converts entities.FinanceReport to FinanceReportResponse.
func FromFinanceReportEntity(fr *entities.FinanceReport) *FinanceReportResponse {
	return &FinanceReportResponse{
		ID:          fr.ID.String(),
		ReportName:  fr.ReportName,
		Type:        fr.Type,
		Period:      fr.Period,
		GeneratedBy: fr.GeneratedBy,
		FileSize:    fr.FileSize,
		FilePath:    fr.FilePath,
		Status:      fr.Status,
		CompanyID:   fr.CompanyID,
		CreatedAt:   fr.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   fr.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
