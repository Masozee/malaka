package entities

import (
	"malaka/internal/shared/types"
)

// FinanceReport represents a finance report entity.
type FinanceReport struct {
	types.BaseModel
	ReportName  string `json:"report_name" db:"report_name"`
	Type        string `json:"type" db:"type"`
	Period      string `json:"period" db:"period"`
	GeneratedBy string `json:"generated_by" db:"generated_by"`
	FileSize    string `json:"file_size" db:"file_size"`
	FilePath    string `json:"file_path" db:"file_path"`
	Status      string `json:"status" db:"status"`
	CompanyID   string `json:"company_id" db:"company_id"`
}
