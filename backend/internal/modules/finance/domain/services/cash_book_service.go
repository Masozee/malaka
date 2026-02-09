package services

import (
	"context"
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type CashBookService interface {
	CreateCashBookEntry(ctx context.Context, entry *entities.CashBook) error
	GetCashBookEntryByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error)
	GetAllCashBookEntries(ctx context.Context) ([]*entities.CashBook, error)
	UpdateCashBookEntry(ctx context.Context, entry *entities.CashBook) error
	DeleteCashBookEntry(ctx context.Context, id uuid.ID) error
	GetCashBookEntriesByCashBank(ctx context.Context, cashBankID uuid.ID) ([]*entities.CashBook, error)
	GetCashBookEntriesByDateRange(ctx context.Context, cashBankID uuid.ID, startDate, endDate time.Time) ([]*entities.CashBook, error)
	GetCashBookEntriesByType(ctx context.Context, transactionType string) ([]*entities.CashBook, error)
	GetCashBalance(ctx context.Context, cashBankID uuid.ID) (float64, error)
	GetCashBalanceAtDate(ctx context.Context, cashBankID uuid.ID, date time.Time) (float64, error)
	RecalculateBalances(ctx context.Context, cashBankID uuid.ID) error
}

type cashBookService struct {
	repo repositories.CashBookRepository
}

func NewCashBookService(repo repositories.CashBookRepository) CashBookService {
	return &cashBookService{
		repo: repo,
	}
}

func (s *cashBookService) CreateCashBookEntry(ctx context.Context, entry *entities.CashBook) error {
	// Calculate balance based on previous balance
	currentBalance, err := s.GetCashBalance(ctx, entry.CashBankID)
	if err != nil {
		currentBalance = 0 // Start from 0 if no previous entries
	}

	// Update balance: debit increases, credit decreases
	entry.Balance = currentBalance + entry.DebitAmount - entry.CreditAmount

	if err := s.repo.Create(ctx, entry); err != nil {
		return err
	}

	// Recalculate all subsequent balances
	return s.RecalculateBalances(ctx, entry.CashBankID)
}

func (s *cashBookService) GetCashBookEntryByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *cashBookService) GetAllCashBookEntries(ctx context.Context) ([]*entities.CashBook, error) {
	return s.repo.GetAll(ctx)
}

func (s *cashBookService) UpdateCashBookEntry(ctx context.Context, entry *entities.CashBook) error {
	if err := s.repo.Update(ctx, entry); err != nil {
		return err
	}

	// Recalculate all balances for this cash/bank account
	return s.RecalculateBalances(ctx, entry.CashBankID)
}

func (s *cashBookService) DeleteCashBookEntry(ctx context.Context, id uuid.ID) error {
	entry, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Recalculate all balances for this cash/bank account
	return s.RecalculateBalances(ctx, entry.CashBankID)
}

func (s *cashBookService) GetCashBookEntriesByCashBank(ctx context.Context, cashBankID uuid.ID) ([]*entities.CashBook, error) {
	return s.repo.GetByCashBankID(ctx, cashBankID)
}

func (s *cashBookService) GetCashBookEntriesByDateRange(ctx context.Context, cashBankID uuid.ID, startDate, endDate time.Time) ([]*entities.CashBook, error) {
	return s.repo.GetByDateRange(ctx, cashBankID, startDate, endDate)
}

func (s *cashBookService) GetCashBookEntriesByType(ctx context.Context, transactionType string) ([]*entities.CashBook, error) {
	return s.repo.GetByTransactionType(ctx, transactionType)
}

func (s *cashBookService) GetCashBalance(ctx context.Context, cashBankID uuid.ID) (float64, error) {
	entries, err := s.repo.GetByCashBankID(ctx, cashBankID)
	if err != nil {
		return 0, err
	}

	if len(entries) == 0 {
		return 0, nil
	}

	// Return the balance of the latest entry
	return entries[len(entries)-1].Balance, nil
}

func (s *cashBookService) GetCashBalanceAtDate(ctx context.Context, cashBankID uuid.ID, date time.Time) (float64, error) {
	entries, err := s.repo.GetByDateRange(ctx, cashBankID, time.Time{}, date)
	if err != nil {
		return 0, err
	}

	if len(entries) == 0 {
		return 0, nil
	}

	// Return the balance of the latest entry within the date range
	return entries[len(entries)-1].Balance, nil
}

func (s *cashBookService) RecalculateBalances(ctx context.Context, cashBankID uuid.ID) error {
	entries, err := s.repo.GetByCashBankID(ctx, cashBankID)
	if err != nil {
		return err
	}

	var runningBalance float64
	for i, entry := range entries {
		if i == 0 {
			// First entry balance calculation
			runningBalance = entry.DebitAmount - entry.CreditAmount
		} else {
			// Subsequent entries
			runningBalance = runningBalance + entry.DebitAmount - entry.CreditAmount
		}

		entry.Balance = runningBalance
		if err := s.repo.Update(ctx, entry); err != nil {
			return err
		}
	}

	return nil
}
