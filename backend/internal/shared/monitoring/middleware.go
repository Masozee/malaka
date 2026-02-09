package monitoring

import (
	"bytes"
	"io"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// SlowRequestMiddleware logs slow HTTP requests
func SlowRequestMiddleware(threshold time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(start)

		// Log if slow
		if duration > threshold {
			log.Printf("[SLOW REQUEST] %s %s took %v (status: %d)",
				c.Request.Method,
				c.Request.URL.Path,
				duration,
				c.Writer.Status(),
			)
		}
	}
}

// RequestMetricsMiddleware collects request metrics
func RequestMetricsMiddleware(collector *RequestMetricsCollector) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process request
		c.Next()

		// Record metrics
		duration := time.Since(start)
		collector.RecordRequest(c.Request.Method, c.Request.URL.Path, c.Writer.Status(), duration)
	}
}

// RequestMetricsCollector collects request metrics
type RequestMetricsCollector struct {
	requests      []RequestMetric
	maxRequests   int
}

// RequestMetric represents a single request metric
type RequestMetric struct {
	Timestamp  time.Time     `json:"timestamp"`
	Method     string        `json:"method"`
	Path       string        `json:"path"`
	Status     int           `json:"status"`
	Duration   time.Duration `json:"duration_ms"`
}

// NewRequestMetricsCollector creates a new metrics collector
func NewRequestMetricsCollector(maxRequests int) *RequestMetricsCollector {
	return &RequestMetricsCollector{
		requests:    make([]RequestMetric, 0, maxRequests),
		maxRequests: maxRequests,
	}
}

// RecordRequest records a request metric
func (c *RequestMetricsCollector) RecordRequest(method, path string, status int, duration time.Duration) {
	metric := RequestMetric{
		Timestamp: time.Now(),
		Method:    method,
		Path:      path,
		Status:    status,
		Duration:  duration,
	}

	c.requests = append(c.requests, metric)
	if len(c.requests) > c.maxRequests {
		c.requests = c.requests[1:]
	}
}

// GetRecentRequests returns recent requests
func (c *RequestMetricsCollector) GetRecentRequests(limit int) []RequestMetric {
	if limit <= 0 || limit > len(c.requests) {
		limit = len(c.requests)
	}

	// Return most recent first
	result := make([]RequestMetric, limit)
	for i := 0; i < limit; i++ {
		result[i] = c.requests[len(c.requests)-1-i]
	}
	return result
}

// GetSlowRequests returns requests slower than threshold
func (c *RequestMetricsCollector) GetSlowRequests(threshold time.Duration, limit int) []RequestMetric {
	var slow []RequestMetric
	for i := len(c.requests) - 1; i >= 0 && len(slow) < limit; i-- {
		if c.requests[i].Duration > threshold {
			slow = append(slow, c.requests[i])
		}
	}
	return slow
}

// GetStats returns aggregated statistics
func (c *RequestMetricsCollector) GetStats() map[string]interface{} {
	if len(c.requests) == 0 {
		return map[string]interface{}{
			"total_requests": 0,
		}
	}

	var totalDuration time.Duration
	var maxDuration time.Duration
	statusCounts := make(map[int]int)

	for _, r := range c.requests {
		totalDuration += r.Duration
		if r.Duration > maxDuration {
			maxDuration = r.Duration
		}
		statusCounts[r.Status]++
	}

	avgDuration := totalDuration / time.Duration(len(c.requests))

	return map[string]interface{}{
		"total_requests":  len(c.requests),
		"avg_duration_ms": avgDuration.Milliseconds(),
		"max_duration_ms": maxDuration.Milliseconds(),
		"status_counts":   statusCounts,
	}
}

// ResponseBodyWriter wraps gin.ResponseWriter to capture response body
type ResponseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

// Write captures the response body
func (w ResponseBodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// LoggingMiddleware logs request and response details
func LoggingMiddleware(logBody bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Read request body
		var requestBody []byte
		if logBody && c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// Wrap response writer to capture body
		var responseBody *bytes.Buffer
		if logBody {
			responseBody = &bytes.Buffer{}
			c.Writer = &ResponseBodyWriter{
				ResponseWriter: c.Writer,
				body:           responseBody,
			}
		}

		// Process request
		c.Next()

		// Log details
		duration := time.Since(start)
		log.Printf("[%s] %s %s | %d | %v",
			c.Request.Method,
			c.Request.URL.Path,
			c.ClientIP(),
			c.Writer.Status(),
			duration,
		)
	}
}
