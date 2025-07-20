package logger

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// SimpleLokiConfig holds configuration for simple Loki HTTP client
type SimpleLokiConfig struct {
	URL    string
	Labels map[string]string
}

// SimpleLokiCore implements zapcore.Core to send logs to Loki via HTTP API
type SimpleLokiCore struct {
	url    string
	labels map[string]string
	enc    zapcore.Encoder
	level  zapcore.Level
	client *http.Client
}

// LokiLogEntry represents a log entry for Loki HTTP API
type LokiLogEntry struct {
	Streams []LokiStream `json:"streams"`
}

// LokiStream represents a log stream for Loki
type LokiStream struct {
	Stream map[string]string `json:"stream"`
	Values [][]string        `json:"values"`
}

// NewSimpleLokiCore creates a new SimpleLokiCore
func NewSimpleLokiCore(config SimpleLokiConfig, level zapcore.Level) *SimpleLokiCore {
	// Default labels
	labels := map[string]string{
		"job":         "malaka-backend",
		"application": "malaka-erp",
		"environment": "development",
	}
	
	// Merge with provided labels
	for k, v := range config.Labels {
		labels[k] = v
	}

	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "message",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.RFC3339TimeEncoder,
		EncodeDuration: zapcore.StringDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	return &SimpleLokiCore{
		url:    config.URL,
		labels: labels,
		enc:    zapcore.NewJSONEncoder(encoderConfig),
		level:  level,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// Enabled implements zapcore.Core
func (c *SimpleLokiCore) Enabled(level zapcore.Level) bool {
	return level >= c.level
}

// With implements zapcore.Core
func (c *SimpleLokiCore) With(fields []zapcore.Field) zapcore.Core {
	clone := *c
	return &clone
}

// Check implements zapcore.Core
func (c *SimpleLokiCore) Check(entry zapcore.Entry, checkedEntry *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if c.Enabled(entry.Level) {
		return checkedEntry.AddCore(entry, c)
	}
	return checkedEntry
}

// Write implements zapcore.Core
func (c *SimpleLokiCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	// Encode the log entry
	buf, err := c.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	// Create dynamic labels based on log level and any additional context
	dynamicLabels := make(map[string]string)
	for k, v := range c.labels {
		dynamicLabels[k] = v
	}
	dynamicLabels["level"] = entry.Level.String()

	// Add any additional labels from fields
	for _, field := range fields {
		switch field.Key {
		case "module", "component", "service":
			dynamicLabels[field.Key] = field.String
		case "method":
			dynamicLabels["http_method"] = field.String
		case "status":
			dynamicLabels["http_status"] = fmt.Sprintf("%d", field.Integer)
		}
	}

	// Send to Loki via HTTP
	go c.sendToLoki(dynamicLabels, entry.Time, buf.String())

	buf.Free()
	return nil
}

// sendToLoki sends log entry to Loki via HTTP API
func (c *SimpleLokiCore) sendToLoki(labels map[string]string, timestamp time.Time, message string) {
	lokiEntry := LokiLogEntry{
		Streams: []LokiStream{
			{
				Stream: labels,
				Values: [][]string{
					{
						fmt.Sprintf("%d", timestamp.UnixNano()),
						message,
					},
				},
			},
		},
	}

	jsonData, err := json.Marshal(lokiEntry)
	if err != nil {
		// Don't fail the application if logging fails
		return
	}

	req, err := http.NewRequest("POST", c.url+"/loki/api/v1/push", bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json")

	_, err = c.client.Do(req)
	if err != nil {
		// Log error to console but don't fail the application
		fmt.Printf("Failed to send log to Loki: %v\n", err)
	}
}

// Sync implements zapcore.Core
func (c *SimpleLokiCore) Sync() error {
	return nil
}

// NewSimpleLoggerWithLoki creates a new zap logger that sends logs to both console and Loki
func NewSimpleLoggerWithLoki(lokiConfig SimpleLokiConfig) (*zap.Logger, error) {
	// Create console core (production style)
	consoleEncoder := zapcore.NewJSONEncoder(zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "message",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.RFC3339TimeEncoder,
		EncodeDuration: zapcore.StringDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	})

	consoleCore := zapcore.NewCore(
		consoleEncoder,
		zapcore.Lock(zapcore.AddSync(zapcore.NewMultiWriteSyncer())),
		zapcore.InfoLevel,
	)

	// Create Loki core
	lokiCore := NewSimpleLokiCore(lokiConfig, zapcore.InfoLevel)

	// Combine both cores
	core := zapcore.NewTee(consoleCore, lokiCore)

	// Create logger with both outputs
	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return logger, nil
}