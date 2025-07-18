
package http_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	shippingHttp "malaka/internal/modules/shipping/presentation/http"
)

type MockOutboundScanService struct {
	mock.Mock
}

func (m *MockOutboundScanService) CreateOutboundScan(ctx context.Context, req *dtos.CreateOutboundScanRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockOutboundScanService) GetOutboundScanByID(ctx context.Context, id uuid.UUID) (*entities.OutboundScan, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.OutboundScan), args.Error(1)
}

func (m *MockOutboundScanService) GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.UUID) ([]entities.OutboundScan, error) {
	args := m.Called(ctx, shipmentID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entities.OutboundScan), args.Error(1)
}

func TestOutboundScanHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockOutboundScanService)
	h := shippingHttp.NewOutboundScanHandler(mockService)

	r := gin.Default()
	r.POST("/outbound-scans", h.CreateOutboundScan)
	r.GET("/outbound-scans/:id", h.GetOutboundScanByID)
	r.GET("/outbound-scans/shipment/:shipment_id", h.GetOutboundScansByShipmentID)

	t.Run("CreateOutboundScan", func(t *testing.T) {
		req := dtos.CreateOutboundScanRequest{
			ShipmentID: uuid.New(),
			ScanType:   "OUTBOUND",
			ScannedBy:  uuid.New(),
		}
		mockService.On("CreateOutboundScan", mock.Anything, &req).Return(nil).Once()

		jsonValue, _ := json.Marshal(req)
		reqHttp, _ := http.NewRequest(http.MethodPost, "/outbound-scans", bytes.NewBuffer(jsonValue))
		reqHttp.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		r.ServeHTTP(w, reqHttp)

		assert.Equal(t, http.StatusCreated, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("GetOutboundScanByID", func(t *testing.T) {
		id := uuid.New()
		scan := &entities.OutboundScan{ID: id}
		mockService.On("GetOutboundScanByID", mock.Anything, id).Return(scan, nil).Once()

		reqHttp, _ := http.NewRequest(http.MethodGet, "/outbound-scans/"+id.String(), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, reqHttp)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("GetOutboundScansByShipmentID", func(t *testing.T) {
		shipmentID := uuid.New()
		scans := []entities.OutboundScan{{ID: uuid.New()}}
		mockService.On("GetOutboundScansByShipmentID", mock.Anything, shipmentID).Return(scans, nil).Once()

		reqHttp, _ := http.NewRequest(http.MethodGet, "/outbound-scans/shipment/"+shipmentID.String(), nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, reqHttp)

		assert.Equal(t, http.StatusOK, w.Code)
		mockService.AssertExpectations(t)
	})
}
