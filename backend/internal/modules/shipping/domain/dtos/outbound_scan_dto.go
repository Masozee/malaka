package dtos

import "malaka/internal/shared/uuid"

type CreateOutboundScanRequest struct {
	ShipmentID uuid.ID `json:"shipment_id"`
	ScanType   string  `json:"scan_type"`
	ScannedBy  uuid.ID `json:"scanned_by"`
}
