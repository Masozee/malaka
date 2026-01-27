package entities

import (
	"time"

	"github.com/google/uuid"
)

// BudgetCommitmentStatus represents the status of a budget commitment
type BudgetCommitmentStatus string

const (
	BudgetCommitmentStatusActive   BudgetCommitmentStatus = "ACTIVE"
	BudgetCommitmentStatusReleased BudgetCommitmentStatus = "RELEASED"
	BudgetCommitmentStatusRealized BudgetCommitmentStatus = "REALIZED"
)

// BudgetCommitmentReferenceType represents the type of document that created the commitment
type BudgetCommitmentReferenceType string

const (
	BudgetCommitmentRefPurchaseOrder   BudgetCommitmentReferenceType = "PURCHASE_ORDER"
	BudgetCommitmentRefPurchaseRequest BudgetCommitmentReferenceType = "PURCHASE_REQUEST"
)

// BudgetCommitment represents a budget commitment (encumbrance)
// Created when a PO is approved to reserve budget funds
type BudgetCommitment struct {
	ID              uuid.UUID                     `json:"id" db:"id"`
	BudgetID        uuid.UUID                     `json:"budget_id" db:"budget_id"`
	AccountID       uuid.UUID                     `json:"account_id" db:"account_id"`
	Amount          float64                       `json:"amount" db:"amount"`
	ReferenceType   BudgetCommitmentReferenceType `json:"reference_type" db:"reference_type"`
	ReferenceID     uuid.UUID                     `json:"reference_id" db:"reference_id"`
	ReferenceNumber string                        `json:"reference_number" db:"reference_number"`
	Description     string                        `json:"description,omitempty" db:"description"`
	Status          BudgetCommitmentStatus        `json:"status" db:"status"`
	CommittedBy     uuid.UUID                     `json:"committed_by" db:"committed_by"`
	CommittedAt     time.Time                     `json:"committed_at" db:"committed_at"`
	ReleasedAt      *time.Time                    `json:"released_at,omitempty" db:"released_at"`
	ReleasedBy      *uuid.UUID                    `json:"released_by,omitempty" db:"released_by"`
	ReleaseReason   string                        `json:"release_reason,omitempty" db:"release_reason"`
	CreatedAt       time.Time                     `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time                     `json:"updated_at" db:"updated_at"`
}

// NewBudgetCommitment creates a new budget commitment
func NewBudgetCommitment(budgetID, accountID, referenceID, committedBy uuid.UUID, amount float64, refType BudgetCommitmentReferenceType, refNumber, description string) *BudgetCommitment {
	now := time.Now()
	return &BudgetCommitment{
		ID:              uuid.New(),
		BudgetID:        budgetID,
		AccountID:       accountID,
		Amount:          amount,
		ReferenceType:   refType,
		ReferenceID:     referenceID,
		ReferenceNumber: refNumber,
		Description:     description,
		Status:          BudgetCommitmentStatusActive,
		CommittedBy:     committedBy,
		CommittedAt:     now,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// Release releases the commitment (cancels the encumbrance)
func (bc *BudgetCommitment) Release(releasedBy uuid.UUID, reason string) {
	now := time.Now()
	bc.Status = BudgetCommitmentStatusReleased
	bc.ReleasedAt = &now
	bc.ReleasedBy = &releasedBy
	bc.ReleaseReason = reason
	bc.UpdatedAt = now
}

// MarkRealized marks the commitment as realized (converted to actual expense)
func (bc *BudgetCommitment) MarkRealized() {
	bc.Status = BudgetCommitmentStatusRealized
	bc.UpdatedAt = time.Now()
}

// CanBeReleased checks if the commitment can be released
func (bc *BudgetCommitment) CanBeReleased() bool {
	return bc.Status == BudgetCommitmentStatusActive
}

// CanBeRealized checks if the commitment can be realized
func (bc *BudgetCommitment) CanBeRealized() bool {
	return bc.Status == BudgetCommitmentStatusActive
}
