package queue

import (
	"context"
	"sync"
)

// Job represents a unit of work to be processed.
type Job interface {
	Execute(ctx context.Context)
}

// JobQueue is a simple in-memory job queue.
type JobQueue struct {
	queue chan Job
	wg    sync.WaitGroup
}

// NewJobQueue creates a new JobQueue.
func NewJobQueue(capacity int) *JobQueue {
	return &JobQueue{
		queue: make(chan Job, capacity),
	}
}

// Push adds a job to the queue.
func (q *JobQueue) Push(job Job) {
	q.wg.Add(1)
	q.queue <- job
}

// StartWorkers starts a specified number of worker goroutines to process jobs.
func (q *JobQueue) StartWorkers(ctx context.Context, numWorkers int) {
	for i := 0; i < numWorkers; i++ {
		go q.worker(ctx)
	}
}

// Wait waits for all jobs to be processed.
func (q *JobQueue) Wait() {
	close(q.queue)
	q.wg.Wait()
}

func (q *JobQueue) worker(ctx context.Context) {
	for job := range q.queue {
		job.Execute(ctx)
		q.wg.Done()
	}
}
