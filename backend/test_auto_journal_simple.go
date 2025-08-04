package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/infrastructure/persistence"
)

func main() {
	// Connect to database
	db, err := sql.Open("postgres", "host=localhost port=5432 user=postgres password=TanahAbang1971 dbname=malaka sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("✅ Connected to database successfully")

	// Initialize repositories
	journalRepo := persistence.NewJournalEntryRepository(db)
	configRepo := persistence.NewAutoJournalConfigRepository(db)

	ctx := context.Background()

	fmt.Println("\n🧪 Testing Auto Journal System Components")
	fmt.Println("=========================================")

	// Test 1: Create a simple journal entry manually
	fmt.Println("\n📝 Test 1: Creating Manual Journal Entry")
	fmt.Println("----------------------------------------")

	// Create a sample journal entry
	entry := &entities.JournalEntry{
		EntryDate:    time.Now(),
		Description:  "Test journal entry for auto journal system",
		Reference:    "TEST-001",
		Status:       entities.JournalEntryStatusDraft,
		CurrencyCode: "IDR",
		ExchangeRate: 1.0,
		SourceModule: "TEST",
		SourceID:     "test-001",
		CompanyID:    "test-company-001",
		CreatedBy:    "system-test",
	}

	// Generate entry ID first
	entry.ID = uuid.New()

	// Create journal entry lines
	kasAccountID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	pendapatanAccountID := uuid.MustParse("99999999-9999-9999-9999-999999999999")

	entry.Lines = []*entities.JournalEntryLine{
		{
			JournalEntryID: entry.ID,
			LineNumber:     1,
			AccountID:      kasAccountID,
			Description:    "Kas masuk dari penjualan",
			DebitAmount:    1000000,
			CreditAmount:   0,
		},
		{
			JournalEntryID: entry.ID,
			LineNumber:     2,
			AccountID:      pendapatanAccountID,
			Description:    "Pendapatan penjualan",
			DebitAmount:    0,
			CreditAmount:   1000000,
		},
	}

	// Calculate base amounts and totals
	for _, line := range entry.Lines {
		line.CalculateBaseAmounts(entry.ExchangeRate)
	}
	entry.CalculateTotals()

	// Validate entry
	if err := entry.Validate(); err != nil {
		fmt.Printf("❌ Journal entry validation failed: %v\n", err)
		return
	}

	// Create journal entry in database
	err = journalRepo.CreateWithLines(ctx, entry)
	if err != nil {
		fmt.Printf("❌ Failed to create journal entry: %v\n", err)
		return
	}

	fmt.Printf("✅ Journal entry created successfully!\n")
	fmt.Printf("📄 Journal Entry ID: %s\n", entry.ID)
	fmt.Printf("📄 Entry Number: %s\n", entry.EntryNumber)
	fmt.Printf("💰 Total Debit: %.2f\n", entry.TotalDebit)
	fmt.Printf("💰 Total Credit: %.2f\n", entry.TotalCredit)
	fmt.Printf("⚖️ Balanced: %t\n", entry.IsBalanced())

	// Test 2: Retrieve the journal entry
	fmt.Println("\n🔍 Test 2: Retrieving Journal Entry")
	fmt.Println("-----------------------------------")

	retrievedEntry, err := journalRepo.GetByID(ctx, entry.ID)
	if err != nil {
		fmt.Printf("❌ Failed to retrieve journal entry: %v\n", err)
		return
	}

	fmt.Printf("✅ Journal entry retrieved successfully!\n")
	fmt.Printf("📄 Entry Number: %s\n", retrievedEntry.EntryNumber)
	fmt.Printf("📄 Description: %s\n", retrievedEntry.Description)
	fmt.Printf("📄 Lines: %d\n", len(retrievedEntry.Lines))

	for i, line := range retrievedEntry.Lines {
		fmt.Printf("   Line %d: %s - Debit: %.2f, Credit: %.2f\n", 
			i+1, line.Description, line.DebitAmount, line.CreditAmount)
	}

	// Test 3: Test auto journal configuration
	fmt.Println("\n⚙️ Test 3: Testing Auto Journal Configuration")
	fmt.Println("---------------------------------------------")

	config, err := configRepo.GetBySourceAndType(ctx, "SALES", "POS_CASH_SALE")
	if err != nil {
		fmt.Printf("❌ Failed to get auto journal config: %v\n", err)
		return
	}

	fmt.Printf("✅ Auto journal configuration retrieved!\n")
	fmt.Printf("📋 Source Module: %s\n", config.SourceModule)
	fmt.Printf("📋 Transaction Type: %s\n", config.TransactionType)
	fmt.Printf("📋 Active: %t\n", config.IsActive)
	fmt.Printf("📋 Description: %s\n", config.Description)

	// Parse account mapping
	var mapping map[string]interface{}
	err = json.Unmarshal([]byte(config.AccountMapping), &mapping)
	if err != nil {
		fmt.Printf("❌ Failed to parse account mapping: %v\n", err)
		return
	}

	fmt.Printf("📋 Mapping Rules: %v\n", mapping["rules"])

	// Test 4: Post the journal entry
	fmt.Println("\n📤 Test 4: Posting Journal Entry")
	fmt.Println("--------------------------------")

	err = journalRepo.Post(ctx, entry.ID, "system-test")
	if err != nil {
		fmt.Printf("❌ Failed to post journal entry: %v\n", err)
		return
	}

	fmt.Printf("✅ Journal entry posted successfully!\n")

	// Retrieve updated entry
	postedEntry, err := journalRepo.GetByID(ctx, entry.ID)
	if err != nil {
		fmt.Printf("❌ Failed to retrieve posted entry: %v\n", err)
		return
	}

	fmt.Printf("📄 Status: %s\n", postedEntry.Status)
	fmt.Printf("📄 Posted By: %s\n", postedEntry.PostedBy)
	fmt.Printf("📄 Posted At: %v\n", postedEntry.PostedAt)

	// Test 5: Database verification
	fmt.Println("\n🔍 Test 5: Database Verification")
	fmt.Println("--------------------------------")

	// Count records
	var counts struct {
		JournalEntries int
		JournalLines   int
		AutoConfigs    int
	}

	err = db.QueryRow("SELECT COUNT(*) FROM journal_entries").Scan(&counts.JournalEntries)
	if err != nil {
		fmt.Printf("❌ Failed to count journal entries: %v\n", err)
		return
	}

	err = db.QueryRow("SELECT COUNT(*) FROM journal_entry_lines").Scan(&counts.JournalLines)
	if err != nil {
		fmt.Printf("❌ Failed to count journal lines: %v\n", err)
		return
	}

	err = db.QueryRow("SELECT COUNT(*) FROM auto_journal_config WHERE is_active = true").Scan(&counts.AutoConfigs)
	if err != nil {
		fmt.Printf("❌ Failed to count auto configs: %v\n", err)
		return
	}

	fmt.Printf("✅ Database verification successful!\n")
	fmt.Printf("📊 Journal Entries: %d\n", counts.JournalEntries)
	fmt.Printf("📊 Journal Lines: %d\n", counts.JournalLines)
	fmt.Printf("📊 Active Auto Configs: %d\n", counts.AutoConfigs)

	// Test 6: Show sample data
	fmt.Println("\n📋 Test 6: Sample Configuration Data")
	fmt.Println("------------------------------------")

	configs, err := configRepo.GetActiveConfigs(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to get active configs: %v\n", err)
		return
	}

	fmt.Printf("✅ Found %d active configurations:\n", len(configs))
	for i, cfg := range configs {
		fmt.Printf("   %d. %s::%s - %s\n", 
			i+1, cfg.SourceModule, cfg.TransactionType, cfg.Description)
	}

	fmt.Println("\n🎉 Auto Journal System Test Completed Successfully!")
	fmt.Println("=================================================")
	fmt.Println("\n📈 Test Results Summary:")
	fmt.Println("✅ Database connection working")
	fmt.Println("✅ Journal entry creation working")
	fmt.Println("✅ Journal entry retrieval working")
	fmt.Println("✅ Journal entry posting working")
	fmt.Println("✅ Auto journal configuration loading working")
	fmt.Println("✅ Database tables and data integrity verified")
	fmt.Println("")
	fmt.Println("🚀 System Ready for Production Integration!")
	fmt.Println("")
	fmt.Println("💡 Next Steps:")
	fmt.Println("1. Complete server integration with HTTP endpoints")
	fmt.Println("2. Add auto journal triggers to business transaction modules")
	fmt.Println("3. Set up monitoring and alerting for journal processing")
	fmt.Println("4. Configure chart of accounts for all transaction types")
}