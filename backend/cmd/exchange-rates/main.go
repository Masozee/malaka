package main

import (
	"flag"
	"fmt"
	"log"
	"path/filepath"

	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/infrastructure/jobs"
	"malaka/internal/modules/accounting/infrastructure/persistence"
)

func main() {
	var (
		fetchFlag  = flag.Bool("fetch", false, "Fetch exchange rates immediately")
		startFlag  = flag.Bool("start", false, "Start the scheduled job")
		statusFlag = flag.Bool("status", false, "Show job status")
		helpFlag   = flag.Bool("help", false, "Show help information")
	)
	flag.Parse()

	if *helpFlag {
		showHelp()
		return
	}

	if *fetchFlag {
		runManualFetch()
		return
	}

	if *startFlag {
		startScheduledJob()
		return
	}

	if *statusFlag {
		showJobStatus()
		return
	}

	// Default: show help
	showHelp()
}

func showHelp() {
	fmt.Println("Exchange Rate Management Tool")
	fmt.Println("=============================")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  go run cmd/exchange-rates/main.go [options]")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -fetch   Fetch exchange rates immediately")
	fmt.Println("  -start   Start the scheduled job (runs continuously)")
	fmt.Println("  -status  Show current job status")
	fmt.Println("  -help    Show this help information")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  # Fetch rates immediately")
	fmt.Println("  go run cmd/exchange-rates/main.go -fetch")
	fmt.Println()
	fmt.Println("  # Start background job")
	fmt.Println("  go run cmd/exchange-rates/main.go -start")
	fmt.Println()
	fmt.Println("Scheduled Times:")
	fmt.Println("  Daily Update: 9:30 AM WIB (after Bank Indonesia updates)")
	fmt.Println("  Hourly Check: 9 AM - 5 PM WIB (Monday - Friday)")
}

func runManualFetch() {
	fmt.Println("=== Manual Exchange Rate Fetch ===")
	
	// Initialize SQLite repository
	dbPath := filepath.Join("data", "exchange_rates.db")
	repository, err := persistence.NewExchangeRateSQLiteRepository(dbPath)
	if err != nil {
		log.Printf("Failed to initialize repository: %v", err)
		log.Println("Running without database storage...")
		service := services.NewExchangeRateService(nil)
		if err := service.RunDailyUpdate(); err != nil {
			log.Fatalf("Failed to fetch exchange rates: %v", err)
		}
	} else {
		service := services.NewExchangeRateService(repository)
		if err := service.RunDailyUpdate(); err != nil {
			log.Fatalf("Failed to fetch exchange rates: %v", err)
		}
	}
	
	fmt.Println("Exchange rates fetched successfully!")
}

func startScheduledJob() {
	fmt.Println("=== Starting Exchange Rate Scheduled Job ===")
	
	job := jobs.NewExchangeRateJob()
	
	if err := job.Start(); err != nil {
		log.Fatalf("Failed to start scheduled job: %v", err)
	}
	
	fmt.Println("Scheduled job started successfully!")
	fmt.Println("Press Ctrl+C to stop...")
	
	// Keep the program running
	select {}
}

func showJobStatus() {
	fmt.Println("=== Exchange Rate Job Status ===")
	
	job := jobs.NewExchangeRateJob()
	status := job.GetStatus()
	
	fmt.Printf("Job Running: %v\n", status["is_running"])
	fmt.Printf("Next Daily Run: %v\n", status["next_daily_run"])
	fmt.Printf("Timezone: %v\n", status["timezone"])
	fmt.Printf("Daily Schedule: %v\n", status["daily_schedule"])
	fmt.Printf("Hourly Schedule: %v\n", status["hourly_schedule"])
	
	fmt.Println()
	fmt.Println("Supported APIs:")
	fmt.Println("  1. Bank Indonesia Official API (Primary)")
	fmt.Println("  2. ExchangeRate-API (Backup)")
	
	fmt.Println()
	fmt.Println("Supported Currencies:")
	fmt.Println("  USD, EUR, SGD, JPY, GBP, AUD, CNY, MYR, THB, KRW")
}