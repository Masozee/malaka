package entities

import (
	"time"

	"github.com/google/uuid"
)

type OutboundScan struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	ShipmentID uuid.UUID `gorm:"type:uuid;not null" json:"shipment_id"`
	ScanType   string    `gorm:"type:varchar(50);not null" json:"scan_type"`
	ScannedAt  time.Time `gorm:"autoCreateTime" json:"scanned_at"`
	ScannedBy  uuid.UUID `gorm:"type:uuid;not null" json:"scanned_by"`
}