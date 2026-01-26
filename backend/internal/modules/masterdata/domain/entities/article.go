package entities

import (
	"malaka/internal/shared/types"
)

// Article represents an article entity.
type Article struct {
	types.BaseModel  `gorm:"embedded"`
	Code             string   `json:"code" gorm:"column:code"`
	Name             string   `json:"name" gorm:"column:name"`
	Brand            string   `json:"brand" gorm:"column:brand"`
	Category         string   `json:"category" gorm:"column:category"`
	Gender           string   `json:"gender" gorm:"column:gender"`
	Description      string   `json:"description" gorm:"column:description"`
	ClassificationID string   `json:"classification_id" gorm:"column:classification_id"`
	ColorID          string   `json:"color_id" gorm:"column:color_id"`
	ModelID          string   `json:"model_id" gorm:"column:model_id"`
	SizeID           string   `json:"size_id" gorm:"column:size_id"`
	SupplierID       string   `json:"supplier_id" gorm:"column:supplier_id"`
	Barcode          string   `json:"barcode" gorm:"column:barcode"`
	BarcodeURL       string   `json:"barcode_url" gorm:"column:barcode_url"`
	Price            float64  `json:"price" gorm:"column:price"`
	Status           string   `json:"status" gorm:"column:status;default:active"`
	ImageURL         string   `json:"image_url" gorm:"column:image_url"`
	ImageURLs        []string `json:"image_urls" gorm:"column:image_urls;type:text[]"`
	ThumbnailURL     string   `json:"thumbnail_url" gorm:"column:thumbnail_url"`
}

// TableName specifies the table name for the Article entity
func (Article) TableName() string {
	return "articles"  
}
