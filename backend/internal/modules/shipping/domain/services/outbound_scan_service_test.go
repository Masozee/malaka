
package services_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/services"
	"malaka/internal/modules/shipping/infrastructure/persistence"
)

type MockOutboundScanRepository struct {
	mock.Mock
}

func (m *MockOutboundScanRepository) CreateOutboundScan(ctx context.Context, scan *entities.OutboundScan) error {
	args := m.Called(ctx, scan)
	return args.Error(0)
}

func (m *MockOutboundScanRepository) GetOutboundScanByID(ctx context.Context, id uuid.UUID) (*entities.OutboundScan, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.OutboundScan), args.Error(1)
}

func (m *MockOutboundScanRepository) GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.UUID) ([]entities.OutboundScan, error) {
	args := m.Called(ctx, shipmentID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entities.OutboundScan), args.Error(1)
}

func TestOutboundScanService(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOutboundScanRepository)
	service := services.NewOutboundScanService(mockRepo)

	t.Run("CreateOutboundScan", func(t *testing.T) {
		req := &dtos.CreateOutboundScanRequest{
			ShipmentID: uuid.New(),
			ScanType:   "OUTBOUND",
			ScannedBy:  uuid.New(),
		}
		mockRepo.On("CreateOutboundScan", ctx, mock.AnythingOfType("*entities.OutboundScan")).Return(nil).Once()
		err := service.CreateOutboundScan(ctx, req)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetOutboundScanByID", func(t *testing.T) {
		id := uuid.New()
		scan := &entities.OutboundScan{ID: id}
		mockRepo.On("GetOutboundScanByID", ctx, id).Return(scan, nil).Once()
		res, err := service.GetOutboundScanByID(ctx, id)
		assert.NoError(t, err)
		assert.Equal(t, scan, res)
		mockRepo.AssertExpectations(t)
	})

	t.Run("GetOutboundScansByShipmentID", func(t *testing.T) {
		shipmentID := uuid.New()
		scans := []entities.OutboundScan{{ID: uuid.New()}}
		mockRepo.On("GetOutboundScansByShipmentID", ctx, shipmentID).Return(scans, nil).Once()
		res, err := service.GetOutboundScansByShipmentID(ctx, shipmentID)
		assert.NoError(t, err)
		assert.Equal(t, scans, res)
		mockRepo.AssertExpectations(t)
	})
}
