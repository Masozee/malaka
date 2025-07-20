package entities

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestChartOfAccount_New(t *testing.T) {
	id := uuid.New()
	parentID := uuid.New()
	createdAt := time.Now()
	updatedAt := time.Now()

	coa := ChartOfAccount{
		ID:           id,
		ParentID:     &parentID,
		AccountCode:  "10100",
		AccountName:  "Cash in Bank",
		AccountType:  "Asset",
		NormalBalance: "Debit",
		Description:  "Main operating cash account",
		IsActive:     true,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}

	assert.Equal(t, id, coa.ID)
	assert.Equal(t, &parentID, coa.ParentID)
	assert.Equal(t, "10100", coa.AccountCode)
	assert.Equal(t, "Cash in Bank", coa.AccountName)
	assert.Equal(t, "Asset", coa.AccountType)
	assert.Equal(t, "Debit", coa.NormalBalance)
	assert.Equal(t, "Main operating cash account", coa.Description)
	assert.True(t, coa.IsActive)
	assert.Equal(t, createdAt, coa.CreatedAt)
	assert.Equal(t, updatedAt, coa.UpdatedAt)
}
