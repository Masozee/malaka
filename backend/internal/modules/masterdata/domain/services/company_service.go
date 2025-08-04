package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
)

// CompanyService provides business logic for company operations.
type CompanyService struct {
	repo repositories.CompanyRepository
}

// NewCompanyService creates a new CompanyService.
func NewCompanyService(repo repositories.CompanyRepository) *CompanyService {
	return &CompanyService{repo: repo}
}

// CreateCompany creates a new company.
func (s *CompanyService) CreateCompany(ctx context.Context, company *entities.Company) error {
	if company.ID == "" {
		company.ID = uuid.New().String() // Generate a UUID if not provided
	}
	
	// Set timestamps
	now := time.Now()
	company.CreatedAt = now
	company.UpdatedAt = now
	
	return s.repo.Create(ctx, company)
}

// GetCompanyByID retrieves a company by its ID.
func (s *CompanyService) GetCompanyByID(ctx context.Context, id string) (*entities.Company, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllCompanies retrieves all companies.
func (s *CompanyService) GetAllCompanies(ctx context.Context) ([]*entities.Company, error) {
	return s.repo.GetAll(ctx)
}

// UpdateCompany updates an existing company.
func (s *CompanyService) UpdateCompany(ctx context.Context, company *entities.Company) error {
	// Ensure the company exists before updating
	existingCompany, err := s.repo.GetByID(ctx, company.ID)
	if err != nil {
		return err
	}
	if existingCompany == nil {
		return errors.New("company not found")
	}
	
	// Set updated timestamp
	company.UpdatedAt = time.Now()
	
	return s.repo.Update(ctx, company)
}

// DeleteCompany deletes a company by its ID.
func (s *CompanyService) DeleteCompany(ctx context.Context, id string) error {
	// Ensure the company exists before deleting
	existingCompany, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCompany == nil {
		return errors.New("company not found")
	}
	return s.repo.Delete(ctx, id)
}
