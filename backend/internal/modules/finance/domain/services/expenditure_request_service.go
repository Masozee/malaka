package services

import (
	"context"
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type ExpenditureRequestService interface {
	CreateExpenditureRequest(ctx context.Context, request *entities.ExpenditureRequest) error
	GetExpenditureRequestByID(ctx context.Context, id uuid.ID) (*entities.ExpenditureRequest, error)
	GetAllExpenditureRequests(ctx context.Context) ([]*entities.ExpenditureRequest, error)
	UpdateExpenditureRequest(ctx context.Context, request *entities.ExpenditureRequest) error
	DeleteExpenditureRequest(ctx context.Context, id uuid.ID) error
	GetExpenditureRequestsByStatus(ctx context.Context, status string) ([]*entities.ExpenditureRequest, error)
	ApproveExpenditureRequest(ctx context.Context, id uuid.ID, approvedBy uuid.ID) error
	RejectExpenditureRequest(ctx context.Context, id uuid.ID, rejectedReason string) error
	DisburseExpenditureRequest(ctx context.Context, id uuid.ID, disbursedBy uuid.ID) error
}

type expenditureRequestService struct {
	repo repositories.ExpenditureRequestRepository
}

func NewExpenditureRequestService(repo repositories.ExpenditureRequestRepository) ExpenditureRequestService {
	return &expenditureRequestService{
		repo: repo,
	}
}

func (s *expenditureRequestService) CreateExpenditureRequest(ctx context.Context, request *entities.ExpenditureRequest) error {
	if request.Status == "" {
		request.Status = "pending"
	}
	return s.repo.Create(ctx, request)
}

func (s *expenditureRequestService) GetExpenditureRequestByID(ctx context.Context, id uuid.ID) (*entities.ExpenditureRequest, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *expenditureRequestService) GetAllExpenditureRequests(ctx context.Context) ([]*entities.ExpenditureRequest, error) {
	return s.repo.GetAll(ctx)
}

func (s *expenditureRequestService) UpdateExpenditureRequest(ctx context.Context, request *entities.ExpenditureRequest) error {
	return s.repo.Update(ctx, request)
}

func (s *expenditureRequestService) DeleteExpenditureRequest(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

func (s *expenditureRequestService) GetExpenditureRequestsByStatus(ctx context.Context, status string) ([]*entities.ExpenditureRequest, error) {
	return s.repo.GetByStatus(ctx, status)
}

func (s *expenditureRequestService) ApproveExpenditureRequest(ctx context.Context, id uuid.ID, approvedBy uuid.ID) error {
	request, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	request.Status = "approved"
	request.ApprovedBy = approvedBy
	request.ApprovedAt = time.Now()

	return s.repo.Update(ctx, request)
}

func (s *expenditureRequestService) RejectExpenditureRequest(ctx context.Context, id uuid.ID, rejectedReason string) error {
	request, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	request.Status = "rejected"
	request.RejectedReason = rejectedReason

	return s.repo.Update(ctx, request)
}

func (s *expenditureRequestService) DisburseExpenditureRequest(ctx context.Context, id uuid.ID, disbursedBy uuid.ID) error {
	request, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	request.Status = "disbursed"
	request.DisbursedBy = disbursedBy
	request.DisbursedAt = time.Now()

	return s.repo.Update(ctx, request)
}
