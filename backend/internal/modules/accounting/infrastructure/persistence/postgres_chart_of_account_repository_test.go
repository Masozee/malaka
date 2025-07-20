package persistence

import (
	"context"
	"database/sql"
	"log"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/stretchr/testify/assert"
	"malaka/internal/modules/accounting/domain/entities"
)

var testDB *sql.DB

func TestMain(m *testing.M) {
	// Database connection string from GEMINI.md
	dbConnStr := "postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable"

	var err error
	testDB, err = sql.Open("postgres", dbConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Ping the database to ensure connection is established
	err = testDB.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Successfully connected to the test database.")

	// Run tests
	exitCode := m.Run()

	// Clean up database after tests
	cleanupDatabase()

	// Close the database connection
	err = testDB.Close()
	if err != nil {
		log.Printf("Error closing database connection: %v", err)
	}

	os.Exit(exitCode)
}

func cleanupDatabase() {
	// Delete all records from chart_of_accounts table
	_, err := testDB.Exec("DELETE FROM chart_of_accounts")
	if err != nil {
		log.Printf("Error cleaning up database: %v", err)
	}
	log.Println("Database cleaned up.")
}

func createTestChartOfAccount(t *testing.T) *entities.ChartOfAccount {
	coa := &entities.ChartOfAccount{
		ID:           uuid.New(),
		AccountCode:  "10000" + uuid.New().String()[:4], // Unique code
		AccountName:  "Test Account " + uuid.New().String()[:4],
		AccountType:  "Asset",
		NormalBalance: "Debit",
		Description:  "A test chart of account",
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	return coa
}

func TestPostgresChartOfAccountRepository_Create(t *testing.T) {
	repo := NewPostgresChartOfAccountRepository(testDB)
	ctx := context.Background()

	coa := createTestChartOfAccount(t)
	err := repo.Create(ctx, coa)
	assert.NoError(t, err)
	assert.NotEqual(t, uuid.Nil, coa.ID)

	// Verify it exists in DB
	foundCoa, err := repo.GetByID(ctx, coa.ID)
	assert.NoError(t, err)
	assert.NotNil(t, foundCoa)
	assert.Equal(t, coa.AccountCode, foundCoa.AccountCode)
}

func TestPostgresChartOfAccountRepository_GetByID(t *testing.T) {
	repo := NewPostgresChartOfAccountRepository(testDB)
	ctx := context.Background()

	coa := createTestChartOfAccount(t)
	err := repo.Create(ctx, coa)
	assert.NoError(t, err)

	foundCoa, err := repo.GetByID(ctx, coa.ID)
	assert.NoError(t, err)
	assert.NotNil(t, foundCoa)
	assert.Equal(t, coa.ID, foundCoa.ID)
	assert.Equal(t, coa.AccountCode, foundCoa.AccountCode)

	// Test non-existent ID
	nonExistentID := uuid.New()
	foundCoa, err = repo.GetByID(ctx, nonExistentID)
	assert.NoError(t, err)
	assert.Nil(t, foundCoa)
}

func TestPostgresChartOfAccountRepository_GetByCode(t *testing.T) {
	repo := NewPostgresChartOfAccountRepository(testDB)
	ctx := context.Background()

	coa := createTestChartOfAccount(t)
	err := repo.Create(ctx, coa)
	assert.NoError(t, err)

	foundCoa, err := repo.GetByCode(ctx, coa.AccountCode)
	assert.NoError(t, err)
	assert.NotNil(t, foundCoa)
	assert.Equal(t, coa.AccountCode, foundCoa.AccountCode)

	// Test non-existent code
	foundCoa, err = repo.GetByCode(ctx, "NON_EXISTENT_CODE")
	assert.NoError(t, err)
	assert.Nil(t, foundCoa)
}

func TestPostgresChartOfAccountRepository_GetAll(t *testing.T) {
	repo := NewPostgresChartOfAccountRepository(testDB)
	ctx := context.Background()

	cleanupDatabase() // Ensure a clean slate for GetAll

	coa1 := createTestChartOfAccount(t)
	coa2 := createTestChartOfAccount(t)

	err := repo.Create(ctx, coa1)
	assert.NoError(t, err)
	err = repo.Create(ctx, coa2)
	assert.NoError(t, err)

	coas, err := repo.GetAll(ctx)
	assert.NoError(t, err)
	assert.Len(t, coas, 2)

	// Check if both created COAs are in the list
	found1 := false
	found2 := false
	for _, c := range coas {
		if c.ID == coa1.ID {
			found1 = true
		}
		if c.ID == coa2.ID {
			found2 = true
		}
	}
	assert.True(t, found1)
	assert.True(t, found2)
}

func TestPostgresChartOfAccountRepository_Update(t *testing.T) {
	repo := NewPostgresChartOfAccountRepository(testDB)
	ctx := context.Background()

	coa := createTestChartOfAccount(t)
	err := repo.Create(ctx, coa)
	assert.NoError(t, err)

	coa.AccountName = "Updated Account Name"
	coa.IsActive = false
	err = repo.Update(ctx, coa)
	assert.NoError(t, err)

	foundCoa, err := repo.GetByID(ctx, coa.ID)
	assert.NoError(t, err)
	assert.NotNil(t, foundCoa)
	assert.Equal(t, "Updated Account Name", foundCoa.AccountName)
	assert.False(t, foundCoa.IsActive)
}

func TestPostgresChartOfAccountRepository_Delete(t *testing.T) {
	repo := NewPostgresChartOfAccountRepository(testDB)
	ctx := context.Background()

	coa := createTestChartOfAccount(t)
	err := repo.Create(ctx, coa)
	assert.NoError(t, err)

	err = repo.Delete(ctx, coa.ID)
	assert.NoError(t, err)

	foundCoa, err := repo.GetByID(ctx, coa.ID)
	assert.NoError(t, err)
	assert.Nil(t, foundCoa)
}
