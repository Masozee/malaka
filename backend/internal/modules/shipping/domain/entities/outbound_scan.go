package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

type OutboundScan struct {
	ID         uuid.ID   `gorm:"type:uuid;primary_key;" json:"id" db:"id"`
	ShipmentID uuid.ID   `gorm:"type:uuid;not null" json:"shipment_id" db:"shipment_id"`
	ScanType   string    `gorm:"type:varchar(50);not null" json:"scan_type" db:"scan_type"`
	ScannedAt  time.Time `gorm:"autoCreateTime" json:"scanned_at" db:"scanned_at"`
	ScannedBy  uuid.ID   `gorm:"type:uuid;not null" json:"scanned_by" db:"scanned_by"`
}
