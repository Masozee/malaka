package queue

import (
	"context"
	"fmt"
)

// ExampleJob is a simple example of a Job implementation.
type ExampleJob struct {
	Message string
}

// Execute implements the Job interface.
func (j *ExampleJob) Execute(ctx context.Context) {
	fmt.Printf("Executing job: %s\n", j.Message)
}

