package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// BudgetRealizationReferenceType represents the type of document that realized the budget
type BudgetRealizationReferenceType string

const (
	BudgetRealizationRefGoodsReceipt BudgetRealizationReferenceType = "GOODS_RECEIPT"
	BudgetRealizationRefAPInvoice    BudgetRealizationReferenceType = "AP_INVOICE"
)

// BudgetRealization represents a budget realization (actual expense)
// Created when a GR is posted or an AP invoice is recorded
type BudgetRealization struct {
	ID              uuid.ID                        `json:"id" db:"id"`
	CommitmentID    *uuid.ID                       `json:"commitment_id,omitempty" db:"commitment_id"`
	BudgetID        uuid.ID                        `json:"budget_id" db:"budget_id"`
	AccountID       uuid.ID                        `json:"account_id" db:"account_id"`
	Amount          float64                        `json:"amount" db:"amount"`
	ReferenceType   BudgetRealizationReferenceType `json:"reference_type" db:"reference_type"`
	ReferenceID     uuid.ID                        `json:"reference_id" db:"reference_id"`
	ReferenceNumber string                         `json:"reference_number" db:"reference_number"`
	TransactionDate time.Time                      `json:"transaction_date" db:"transaction_date"`
	Description     string                         `json:"description,omitempty" db:"description"`
	RealizedBy      uuid.ID                        `json:"realized_by" db:"realized_by"`
	RealizedAt      time.Time                      `json:"realized_at" db:"realized_at"`
	CreatedAt       time.Time                      `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time                      `json:"updated_at" db:"updated_at"`
}

// NewBudgetRealization creates a new budget realization
func NewBudgetRealization(budgetID, accountID, referenceID, realizedBy uuid.ID, amount float64, refType BudgetRealizationReferenceType, refNumber, description string, transactionDate time.Time, commitmentID *uuid.ID) *BudgetRealization {
	now := time.Now()
	return &BudgetRealization{
		ID:              uuid.New(),
		CommitmentID:    commitmentID,
		BudgetID:        budgetID,
		AccountID:       accountID,
		Amount:          amount,
		ReferenceType:   refType,
		ReferenceID:     referenceID,
		ReferenceNumber: refNumber,
		TransactionDate: transactionDate,
		Description:     description,
		RealizedBy:      realizedBy,
		RealizedAt:      now,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// BudgetRealizationSummary provides a summary of budget realizations
type BudgetRealizationSummary struct {
	BudgetID         uuid.ID `json:"budget_id"`
	AccountID        uuid.ID `json:"account_id"`
	AccountCode      string    `json:"account_code"`
	AccountName      string    `json:"account_name"`
	BudgetedAmount   float64   `json:"budgeted_amount"`
	CommittedAmount  float64   `json:"committed_amount"`
	RealizedAmount   float64   `json:"realized_amount"`
	AvailableAmount  float64   `json:"available_amount"`
	UtilizationRate  float64   `json:"utilization_rate"`
}

// CalculateAvailableBudget calculates the available budget after commitments and realizations
func CalculateAvailableBudget(budgetedAmount, committedAmount, realizedAmount float64) float64 {
	return budgetedAmount - committedAmount - realizedAmount
}
