package jobs

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"github.com/robfig/cron/v3"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/infrastructure/persistence"
)

// ExchangeRateJob handles scheduled exchange rate updates
type ExchangeRateJob struct {
	service   *services.ExchangeRateService
	cron      *cron.Cron
	isRunning bool
}

// NewExchangeRateJob creates a new exchange rate job
func NewExchangeRateJob() *ExchangeRateJob {
	// Initialize SQLite repository
	dbPath := filepath.Join("data", "exchange_rates.db")
	repository, err := persistence.NewExchangeRateSQLiteRepository(dbPath)
	if err != nil {
		log.Printf("Failed to initialize exchange rate repository: %v", err)
		log.Println("Job will run without database storage")
		return &ExchangeRateJob{
			service: services.NewExchangeRateService(nil),
			cron:    cron.New(cron.WithLocation(time.FixedZone("WIB", 7*3600))),
		}
	}

	return &ExchangeRateJob{
		service: services.NewExchangeRateService(repository),
		cron:    cron.New(cron.WithLocation(time.FixedZone("WIB", 7*3600))), // Indonesian time
	}
}

// Start begins the scheduled job
func (j *ExchangeRateJob) Start() error {
	if j.isRunning {
		return fmt.Errorf("exchange rate job is already running")
	}

	// Schedule daily update at 9:30 AM WIB (after Bank Indonesia updates)
	_, err := j.cron.AddFunc("30 9 * * *", func() {
		j.runDailyUpdate()
	})
	if err != nil {
		return fmt.Errorf("failed to schedule daily update: %w", err)
	}

	// Schedule hourly check during business hours (9 AM - 5 PM WIB)
	_, err = j.cron.AddFunc("0 9-17 * * 1-5", func() {
		j.runHourlyCheck()
	})
	if err != nil {
		return fmt.Errorf("failed to schedule hourly check: %w", err)
	}

	j.cron.Start()
	j.isRunning = true

	log.Println("Exchange rate job started successfully")
	log.Println("Daily update scheduled at 9:30 AM WIB")
	log.Println("Hourly checks scheduled during business hours (9 AM - 5 PM WIB)")

	return nil
}

// Stop stops the scheduled job
func (j *ExchangeRateJob) Stop() {
	if j.isRunning {
		j.cron.Stop()
		j.isRunning = false
		log.Println("Exchange rate job stopped")
	}
}

// runDailyUpdate performs the daily exchange rate update
func (j *ExchangeRateJob) runDailyUpdate() {
	log.Println("=== Running Daily Exchange Rate Update ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Use context for timeout handling
	done := make(chan error, 1)
	go func() {
		done <- j.service.RunDailyUpdate()
	}()

	select {
	case err := <-done:
		if err != nil {
			log.Printf("Daily update failed: %v", err)
			// TODO: Send notification to admin
			j.sendFailureNotification("Daily Update", err)
		} else {
			log.Println("Daily update completed successfully")
		}
	case <-ctx.Done():
		log.Printf("Daily update timed out after 5 minutes")
		j.sendFailureNotification("Daily Update", fmt.Errorf("operation timed out"))
	}
}

// runHourlyCheck performs hourly checks for missed updates
func (j *ExchangeRateJob) runHourlyCheck() {
	log.Println("Running hourly exchange rate check...")
	
	// TODO: Implement check for missed updates
	// This would verify if today's rates have been fetched
	// and attempt to fetch if missing
	
	log.Println("Hourly check completed")
}

// RunManualUpdate allows manual triggering of exchange rate update
func (j *ExchangeRateJob) RunManualUpdate() error {
	log.Println("=== Running Manual Exchange Rate Update ===")
	
	return j.service.RunDailyUpdate()
}

// sendFailureNotification sends notification when job fails
func (j *ExchangeRateJob) sendFailureNotification(jobType string, err error) {
	// TODO: Implement notification system (email, Slack, etc.)
	log.Printf("NOTIFICATION: %s failed: %v", jobType, err)
	
	// For now, just log the failure
	// In production, this would send emails/alerts to administrators
}

// GetStatus returns the current status of the job
func (j *ExchangeRateJob) GetStatus() map[string]interface{} {
	return map[string]interface{}{
		"is_running":      j.isRunning,
		"next_daily_run":  j.getNextDailyRun(),
		"timezone":        "WIB (UTC+7)",
		"daily_schedule":  "9:30 AM",
		"hourly_schedule": "9 AM - 5 PM (Mon-Fri)",
	}
}

// getNextDailyRun returns the next scheduled daily run time
func (j *ExchangeRateJob) getNextDailyRun() string {
	if !j.isRunning {
		return "Job not running"
	}

	// Calculate next 9:30 AM WIB
	now := time.Now().In(time.FixedZone("WIB", 7*3600))
	
	// If it's before 9:30 AM today, next run is today
	today930 := time.Date(now.Year(), now.Month(), now.Day(), 9, 30, 0, 0, now.Location())
	if now.Before(today930) {
		return today930.Format("2006-01-02 15:04:05 MST")
	}
	
	// Otherwise, next run is tomorrow at 9:30 AM
	tomorrow930 := today930.Add(24 * time.Hour)
	return tomorrow930.Format("2006-01-02 15:04:05 MST")
}