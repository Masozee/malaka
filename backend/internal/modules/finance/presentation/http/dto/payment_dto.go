package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// PaymentCreateRequest represents the request to create a payment.
type PaymentCreateRequest struct {
	InvoiceID     string    `json:"invoice_id" binding:"required"`
	PaymentDate   time.Time `json:"payment_date" binding:"required"`
	Amount        float64   `json:"amount" binding:"required"`
	PaymentMethod string    `json:"payment_method" binding:"required"`
	CashBankID    string    `json:"cash_bank_id" binding:"required"`
}

// PaymentUpdateRequest represents the request to update a payment.
type PaymentUpdateRequest struct {
	InvoiceID     string    `json:"invoice_id"`
	PaymentDate   time.Time `json:"payment_date"`
	Amount        float64   `json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	CashBankID    string    `json:"cash_bank_id"`
}

// PaymentResponse represents the response for a payment.
type PaymentResponse struct {
	ID            string    `json:"id"`
	InvoiceID     string    `json:"invoice_id"`
	PaymentDate   time.Time `json:"payment_date"`
	Amount        float64   `json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	CashBankID    string    `json:"cash_bank_id"`
	CreatedAt     string    `json:"created_at"`
	UpdatedAt     string    `json:"updated_at"`
}

// ToPaymentEntity converts PaymentCreateRequest to entities.Payment.
func (req *PaymentCreateRequest) ToPaymentEntity() *entities.Payment {
	return &entities.Payment{
		BaseModel:     types.BaseModel{},
		InvoiceID:     uuid.MustParse(req.InvoiceID),
		PaymentDate:   req.PaymentDate,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		CashBankID:    uuid.MustParse(req.CashBankID),
	}
}

// ToPaymentEntity converts PaymentUpdateRequest to entities.Payment.
func (req *PaymentUpdateRequest) ToPaymentEntity() *entities.Payment {
	return &entities.Payment{
		BaseModel:     types.BaseModel{},
		InvoiceID:     uuid.MustParse(req.InvoiceID),
		PaymentDate:   req.PaymentDate,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		CashBankID:    uuid.MustParse(req.CashBankID),
	}
}

// FromPaymentEntity converts entities.Payment to PaymentResponse.
func FromPaymentEntity(p *entities.Payment) *PaymentResponse {
	return &PaymentResponse{
		ID:            p.ID.String(),
		InvoiceID:     p.InvoiceID.String(),
		PaymentDate:   p.PaymentDate,
		Amount:        p.Amount,
		PaymentMethod: p.PaymentMethod,
		CashBankID:    p.CashBankID.String(),
		CreatedAt:     p.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:     p.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
