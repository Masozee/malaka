package jobs

import (
	"context"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

// Scheduler manages scheduled jobs.
type Scheduler struct {
	cron   *cron.Cron
	logger *zap.Logger
}

// NewScheduler creates a new Scheduler.
func NewScheduler(logger *zap.Logger) *Scheduler {
	return &Scheduler{
		cron:   cron.New(cron.WithLogger(cron.DefaultLogger)), // Use zap logger with cron
		logger: logger,
	}
}

// Start starts the scheduler.
func (s *Scheduler) Start() {
	s.cron.Start()
	s.logger.Info("Job scheduler started")
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() context.Context {
	return s.cron.Stop()
}

// AddJob adds a new job to the scheduler.
func (s *Scheduler) AddJob(spec string, cmd func()) (cron.EntryID, error) {
	return s.cron.AddFunc(spec, cmd)
}

// RemoveJob removes a job from the scheduler.
func (s *Scheduler) RemoveJob(id cron.EntryID) {
	s.cron.Remove(id)
}
