package dto

// CreateSalesTargetRequest represents the request body for creating a new sales target.
type CreateSalesTargetRequest struct {
	UserID      string  `json:"user_id" binding:"required"`
	PeriodStart string  `json:"period_start" binding:"required"`
	PeriodEnd   string  `json:"period_end" binding:"required"`
	TargetAmount float64 `json:"target_amount" binding:"required,gt=0"`
	AchievedAmount float64 `json:"achieved_amount"`
}

// UpdateSalesTargetRequest represents the request body for updating an existing sales target.
type UpdateSalesTargetRequest struct {
	UserID      string  `json:"user_id" binding:"required"`
	PeriodStart string  `json:"period_start" binding:"required"`
	PeriodEnd   string  `json:"period_end" binding:"required"`
	TargetAmount float64 `json:"target_amount" binding:"required,gt=0"`
	AchievedAmount float64 `json:"achieved_amount"`
}
