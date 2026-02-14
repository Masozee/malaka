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
	RejectExpenditureRequest(ctx context.Context, id uuid.ID, remarks string) error
	ProcessExpenditureRequest(ctx context.Context, id uuid.ID, processedBy uuid.ID) error
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
		request.Status = "PENDING"
	}
	if request.Priority == "" {
		request.Priority = "NORMAL"
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

	request.Status = "APPROVED"
	request.ApprovedBy = approvedBy
	request.ApprovedAt = time.Now()

	return s.repo.Update(ctx, request)
}

func (s *expenditureRequestService) RejectExpenditureRequest(ctx context.Context, id uuid.ID, remarks string) error {
	request, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	request.Status = "REJECTED"
	request.Remarks = remarks

	return s.repo.Update(ctx, request)
}

func (s *expenditureRequestService) ProcessExpenditureRequest(ctx context.Context, id uuid.ID, processedBy uuid.ID) error {
	request, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	request.Status = "PROCESSED"
	request.ProcessedBy = processedBy
	request.ProcessedAt = time.Now()

	return s.repo.Update(ctx, request)
}
