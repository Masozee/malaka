package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Article represents an article entity.
type Article struct {
	types.BaseModel  `gorm:"embedded"`
	Code             string   `json:"code" gorm:"column:code" db:"code"`
	Name             string   `json:"name" gorm:"column:name" db:"name"`
	Brand            string   `json:"brand" gorm:"column:brand" db:"brand"`
	Category         string   `json:"category" gorm:"column:category" db:"category"`
	Gender           string   `json:"gender" gorm:"column:gender" db:"gender"`
	Description      string   `json:"description" gorm:"column:description" db:"description"`
	ClassificationID uuid.ID  `json:"classification_id" gorm:"column:classification_id" db:"classification_id"`
	ColorID          uuid.ID  `json:"color_id" gorm:"column:color_id" db:"color_id"`
	ModelID          uuid.ID  `json:"model_id" gorm:"column:model_id" db:"model_id"`
	SizeID           uuid.ID  `json:"size_id" gorm:"column:size_id" db:"size_id"`
	SupplierID       uuid.ID  `json:"supplier_id" gorm:"column:supplier_id" db:"supplier_id"`
	Barcode          string   `json:"barcode" gorm:"column:barcode" db:"barcode"`
	BarcodeURL       string   `json:"barcode_url" gorm:"column:barcode_url" db:"barcode_url"`
	Price            float64  `json:"price" gorm:"column:price" db:"price"`
	CompanyID        string   `json:"company_id" gorm:"column:company_id" db:"company_id"`
	Status           string   `json:"status" gorm:"column:status;default:active" db:"status"`
	ImageURL         string   `json:"image_url" gorm:"column:image_url" db:"image_url"`
	ImageURLs        []string `json:"image_urls" gorm:"column:image_urls;type:text[]" db:"image_urls"`
	ThumbnailURL     string   `json:"thumbnail_url" gorm:"column:thumbnail_url" db:"thumbnail_url"`
}

// TableName specifies the table name for the Article entity
func (Article) TableName() string {
	return "articles"
}
