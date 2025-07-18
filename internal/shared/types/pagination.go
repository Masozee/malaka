package types

// Pagination represents pagination metadata.
type Pagination struct {
	Page      int `json:"page"`
	Limit     int `json:"limit"`
	TotalRows int `json:"total_rows"`
	TotalPages int `json:"total_pages"`
}
