package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

type CreateCashBookRequest struct {
	BookCode       string  `json:"book_code" binding:"required"`
	BookName       string  `json:"book_name" binding:"required"`
	BookType       string  `json:"book_type" binding:"required,oneof=CASH BANK"`
	AccountNumber  string  `json:"account_number"`
	BankName       string  `json:"bank_name"`
	OpeningBalance float64 `json:"opening_balance" binding:"min=0"`
}

type UpdateCashBookRequest struct {
	BookCode       string  `json:"book_code" binding:"required"`
	BookName       string  `json:"book_name" binding:"required"`
	BookType       string  `json:"book_type" binding:"required,oneof=CASH BANK"`
	AccountNumber  string  `json:"account_number"`
	BankName       string  `json:"bank_name"`
	OpeningBalance float64 `json:"opening_balance" binding:"min=0"`
	CurrentBalance float64 `json:"current_balance" binding:"min=0"`
	IsActive       bool    `json:"is_active"`
}

type CashBookResponse struct {
	ID             string    `json:"id"`
	BookCode       string    `json:"book_code"`
	BookName       string    `json:"book_name"`
	BookType       string    `json:"book_type"`
	AccountNumber  string    `json:"account_number"`
	BankName       string    `json:"bank_name"`
	OpeningBalance float64   `json:"opening_balance"`
	CurrentBalance float64   `json:"current_balance"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func ToCashBookResponse(entry *entities.CashBook) *CashBookResponse {
	return &CashBookResponse{
		ID:             entry.ID.String(),
		BookCode:       entry.BookCode,
		BookName:       entry.BookName,
		BookType:       entry.BookType,
		AccountNumber:  entry.AccountNumber,
		BankName:       entry.BankName,
		OpeningBalance: entry.OpeningBalance,
		CurrentBalance: entry.CurrentBalance,
		IsActive:       entry.IsActive,
		CreatedAt:      entry.CreatedAt,
		UpdatedAt:      entry.UpdatedAt,
	}
}

func ToCashBookEntity(req *CreateCashBookRequest) *entities.CashBook {
	return &entities.CashBook{
		BookCode:       req.BookCode,
		BookName:       req.BookName,
		BookType:       req.BookType,
		AccountNumber:  req.AccountNumber,
		BankName:       req.BankName,
		OpeningBalance: req.OpeningBalance,
		CurrentBalance: req.OpeningBalance, // Initially same as opening balance
		IsActive:       true,
	}
}
