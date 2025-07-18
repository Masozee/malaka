
package dtos

import "github.com/google/uuid"

type CreateOutboundScanRequest struct {
	ShipmentID uuid.UUID `json:"shipment_id"`
	ScanType   string    `json:"scan_type"`
	ScannedBy  uuid.UUID `json:"scanned_by"`
}
