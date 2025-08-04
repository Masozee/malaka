# GOROUTINE IMPLEMENTATION GUIDE FOR MALAKA ERP

**Project:** MALAKA ERP System  
**Created:** 2025-07-18  
**Status:** Implementation Guide & Current Analysis  

---

## 📋 **CURRENT GOROUTINE USAGE ANALYSIS**

### ✅ **Already Implemented Concurrent Components**

#### 1. **Job Queue System** (`internal/server/jobs/queue/job_queue.go`)
```go
// Worker Pool Pattern - ALREADY IMPLEMENTED
type JobQueue struct {
    queue chan Job
    wg    sync.WaitGroup
}

// Spawns worker goroutines
for i := 0; i < numWorkers; i++ {
    go q.worker(ctx)
}
```
**✅ Status:** Fully implemented  
**✅ Pattern:** Worker Pool  
**✅ Features:** Context-aware, thread-safe, configurable workers

#### 2. **Event Dispatcher** (`internal/shared/events/dispatcher.go`)
```go
// Asynchronous Event Processing - ALREADY IMPLEMENTED
for _, handler := range handlers {
    go func(handler EventHandler) {
        handler.Handle(event)
    }(handler)
}
```
**✅ Status:** Fully implemented  
**✅ Pattern:** Fan-out  
**✅ Features:** Non-blocking event processing

#### 3. **Memory Cache with Background Cleanup** (`internal/shared/cache/memory.go`)
```go
// Background Worker - ALREADY IMPLEMENTED
go cache.cleanup()

// Periodic cleanup
for {
    <-time.After(5 * time.Minute)
    cache.cleanupExpired()
}
```
**✅ Status:** Fully implemented  
**✅ Pattern:** Background Worker  
**✅ Features:** Automatic cleanup, thread-safe operations

#### 4. **Specialized Workers**
- **✅ InventoryAlertWorker:** Stock monitoring
- **✅ StockCalculationWorker:** Balance calculations  
- **✅ ValuationWorker:** Inventory valuations

#### 5. **Rate Limiting Middleware**
**✅ Status:** Implemented with external library (`github.com/juju/ratelimit`)

---

## 🚀 **RECOMMENDED GOROUTINE ENHANCEMENTS**

### 1. **Database Batch Processing Pipeline**

**Purpose:** Process large inventory/sales data efficiently  
**Location:** `internal/pkg/pipeline/`

```go
// Create this file: internal/pkg/pipeline/batch_processor.go
package pipeline

import (
    "context"
    "sync"
)

type BatchProcessor struct {
    inputCh    chan interface{}
    outputCh   chan interface{}
    workerPool int
    wg         sync.WaitGroup
}

func NewBatchProcessor(workerPool int) *BatchProcessor {
    return &BatchProcessor{
        inputCh:    make(chan interface{}, 100),
        outputCh:   make(chan interface{}, 100),
        workerPool: workerPool,
    }
}

func (bp *BatchProcessor) Start(ctx context.Context, processor func(interface{}) interface{}) {
    // Spawn worker goroutines
    for i := 0; i < bp.workerPool; i++ {
        bp.wg.Add(1)
        go bp.worker(ctx, processor)
    }
}

func (bp *BatchProcessor) worker(ctx context.Context, processor func(interface{}) interface{}) {
    defer bp.wg.Done()
    for {
        select {
        case item := <-bp.inputCh:
            result := processor(item)
            bp.outputCh <- result
        case <-ctx.Done():
            return
        }
    }
}
```

### 2. **Real-time Stock Monitoring**

**Purpose:** Monitor stock levels in real-time  
**Location:** `internal/modules/inventory/services/`

```go
// Create this file: internal/modules/inventory/services/stock_monitor.go
package services

import (
    "context"
    "sync"
    "time"
)

type StockMonitor struct {
    stockRepo    StockRepository
    alertCh      chan StockAlert
    subscribers  []chan StockAlert
    mu           sync.RWMutex
    running      bool
}

type StockAlert struct {
    ArticleID   string    `json:"article_id"`
    WarehouseID string    `json:"warehouse_id"`
    CurrentQty  int       `json:"current_qty"`
    MinQty      int       `json:"min_qty"`
    AlertLevel  string    `json:"alert_level"` // "LOW", "CRITICAL", "OUT_OF_STOCK"
    Timestamp   time.Time `json:"timestamp"`
}

func NewStockMonitor(stockRepo StockRepository) *StockMonitor {
    return &StockMonitor{
        stockRepo:   stockRepo,
        alertCh:     make(chan StockAlert, 1000),
        subscribers: make([]chan StockAlert, 0),
    }
}

func (sm *StockMonitor) Start(ctx context.Context) {
    sm.mu.Lock()
    if sm.running {
        sm.mu.Unlock()
        return
    }
    sm.running = true
    sm.mu.Unlock()

    // Start monitoring goroutine
    go sm.monitor(ctx)
    
    // Start alert distribution goroutine
    go sm.distributeAlerts(ctx)
}

func (sm *StockMonitor) monitor(ctx context.Context) {
    ticker := time.NewTicker(30 * time.Second) // Check every 30 seconds
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            sm.checkStockLevels(ctx)
        case <-ctx.Done():
            return
        }
    }
}

func (sm *StockMonitor) Subscribe() <-chan StockAlert {
    sm.mu.Lock()
    defer sm.mu.Unlock()
    
    alertCh := make(chan StockAlert, 100)
    sm.subscribers = append(sm.subscribers, alertCh)
    return alertCh
}

func (sm *StockMonitor) distributeAlerts(ctx context.Context) {
    for {
        select {
        case alert := <-sm.alertCh:
            sm.mu.RLock()
            for _, subscriber := range sm.subscribers {
                select {
                case subscriber <- alert:
                default:
                    // Non-blocking send
                }
            }
            sm.mu.RUnlock()
        case <-ctx.Done():
            return
        }
    }
}

func (sm *StockMonitor) checkStockLevels(ctx context.Context) {
    // Implementation to check stock levels and generate alerts
    balances, err := sm.stockRepo.GetLowStockItems(ctx)
    if err != nil {
        return
    }

    for _, balance := range balances {
        alert := StockAlert{
            ArticleID:   balance.ArticleID,
            WarehouseID: balance.WarehouseID,
            CurrentQty:  balance.Quantity,
            MinQty:      balance.MinQuantity,
            AlertLevel:  sm.determineAlertLevel(balance.Quantity, balance.MinQuantity),
            Timestamp:   time.Now(),
        }
        
        select {
        case sm.alertCh <- alert:
        default:
            // Alert channel full, skip this alert
        }
    }
}

func (sm *StockMonitor) determineAlertLevel(current, min int) string {
    if current == 0 {
        return "OUT_OF_STOCK"
    } else if current <= min/2 {
        return "CRITICAL"
    } else if current <= min {
        return "LOW"
    }
    return "NORMAL"
}
```

### 3. **Concurrent Report Generation**

**Purpose:** Generate multiple reports concurrently  
**Location:** `internal/modules/reports/services/`

```go
// Create this file: internal/modules/reports/services/concurrent_report_generator.go
package services

import (
    "context"
    "fmt"
    "sync"
    "time"
)

type ReportGenerator struct {
    maxConcurrent int
    semaphore     chan struct{}
}

type ReportJob struct {
    ID       string
    Type     string
    Params   map[string]interface{}
    ResultCh chan ReportResult
}

type ReportResult struct {
    JobID string
    Data  interface{}
    Error error
}

func NewReportGenerator(maxConcurrent int) *ReportGenerator {
    return &ReportGenerator{
        maxConcurrent: maxConcurrent,
        semaphore:     make(chan struct{}, maxConcurrent),
    }
}

func (rg *ReportGenerator) GenerateReports(ctx context.Context, jobs []ReportJob) []ReportResult {
    var wg sync.WaitGroup
    results := make([]ReportResult, len(jobs))
    resultCh := make(chan ReportResult, len(jobs))

    // Start workers
    for i, job := range jobs {
        wg.Add(1)
        go func(index int, job ReportJob) {
            defer wg.Done()
            
            // Acquire semaphore
            select {
            case rg.semaphore <- struct{}{}:
                defer func() { <-rg.semaphore }()
            case <-ctx.Done():
                resultCh <- ReportResult{JobID: job.ID, Error: ctx.Err()}
                return
            }

            // Generate report
            result := rg.generateSingleReport(ctx, job)
            resultCh <- result
        }(i, job)
    }

    // Wait for all jobs to complete
    go func() {
        wg.Wait()
        close(resultCh)
    }()

    // Collect results
    i := 0
    for result := range resultCh {
        results[i] = result
        i++
    }

    return results
}

func (rg *ReportGenerator) generateSingleReport(ctx context.Context, job ReportJob) ReportResult {
    // Simulate report generation
    time.Sleep(time.Duration(100+rand.Intn(500)) * time.Millisecond)
    
    return ReportResult{
        JobID: job.ID,
        Data:  fmt.Sprintf("Report data for %s", job.Type),
        Error: nil,
    }
}
```

### 4. **WebSocket Real-time Updates**

**Purpose:** Send real-time updates to connected clients  
**Location:** `internal/server/websocket/`

```go
// Create this file: internal/server/websocket/hub.go
package websocket

import (
    "context"
    "encoding/json"
    "sync"
)

type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    mu         sync.RWMutex
}

type Client struct {
    hub  *Hub
    conn *websocket.Conn
    send chan []byte
}

type Message struct {
    Type string      `json:"type"`
    Data interface{} `json:"data"`
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[*Client]bool),
        broadcast:  make(chan []byte, 256),
        register:   make(chan *Client),
        unregister: make(chan *Client),
    }
}

func (h *Hub) Run(ctx context.Context) {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client] = true
            h.mu.Unlock()
            
        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
            }
            h.mu.Unlock()
            
        case message := <-h.broadcast:
            h.mu.RLock()
            for client := range h.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
            h.mu.RUnlock()
            
        case <-ctx.Done():
            return
        }
    }
}

func (h *Hub) BroadcastStockAlert(alert StockAlert) {
    message := Message{
        Type: "stock_alert",
        Data: alert,
    }
    
    data, err := json.Marshal(message)
    if err != nil {
        return
    }
    
    select {
    case h.broadcast <- data:
    default:
        // Broadcast channel full
    }
}
```

### 5. **Async Email Notification System**

**Purpose:** Send emails without blocking main operations  
**Location:** `internal/pkg/notifications/`

```go
// Create this file: internal/pkg/notifications/email_service.go
package notifications

import (
    "context"
    "sync"
    "time"
)

type EmailService struct {
    emailQueue chan EmailJob
    workers    int
    wg         sync.WaitGroup
    running    bool
    mu         sync.Mutex
}

type EmailJob struct {
    To      []string
    Subject string
    Body    string
    Type    string // "stock_alert", "order_confirmation", etc.
    Priority int   // 1=high, 2=medium, 3=low
}

func NewEmailService(workers int) *EmailService {
    return &EmailService{
        emailQueue: make(chan EmailJob, 1000),
        workers:    workers,
    }
}

func (es *EmailService) Start(ctx context.Context) {
    es.mu.Lock()
    if es.running {
        es.mu.Unlock()
        return
    }
    es.running = true
    es.mu.Unlock()

    // Start worker goroutines
    for i := 0; i < es.workers; i++ {
        es.wg.Add(1)
        go es.worker(ctx, i)
    }
}

func (es *EmailService) worker(ctx context.Context, workerID int) {
    defer es.wg.Done()
    
    for {
        select {
        case job := <-es.emailQueue:
            es.processEmail(ctx, job, workerID)
        case <-ctx.Done():
            return
        }
    }
}

func (es *EmailService) SendAsync(job EmailJob) {
    select {
    case es.emailQueue <- job:
    default:
        // Queue full, could log this or have fallback
    }
}

func (es *EmailService) processEmail(ctx context.Context, job EmailJob, workerID int) {
    // Simulate email sending
    time.Sleep(500 * time.Millisecond)
    
    // Log successful send
    fmt.Printf("Worker %d sent email: %s to %v\n", workerID, job.Subject, job.To)
}

func (es *EmailService) Stop() {
    es.mu.Lock()
    defer es.mu.Unlock()
    
    if !es.running {
        return
    }
    
    close(es.emailQueue)
    es.wg.Wait()
    es.running = false
}
```

---

## 📊 **IMPLEMENTATION PRIORITY MATRIX**

### **HIGH PRIORITY** (Immediate Business Value)
1. **✅ Real-time Stock Monitoring** - Critical for inventory management
2. **📧 Async Email Notifications** - Essential for alerts and confirmations
3. **📊 Concurrent Report Generation** - Improves user experience

### **MEDIUM PRIORITY** (Performance Optimization)
4. **🔄 Database Batch Processing** - Handle large data operations
5. **🌐 WebSocket Real-time Updates** - Enhanced UI responsiveness

### **LOW PRIORITY** (Future Enhancements)
6. **📈 Metrics Collection Goroutines** - Monitoring and analytics
7. **🔄 Circuit Breaker Pattern** - External service resilience

---

## 🛠 **INTEGRATION GUIDE**

### **Step 1: Add Stock Monitoring to Inventory Module**

```go
// In internal/modules/inventory/services/stock_service.go
func (s *stockServiceImpl) StartStockMonitoring(ctx context.Context) {
    monitor := NewStockMonitor(s.stockMovementRepo)
    monitor.Start(ctx)
    
    // Subscribe to alerts
    alertCh := monitor.Subscribe()
    go s.handleStockAlerts(ctx, alertCh)
}

func (s *stockServiceImpl) handleStockAlerts(ctx context.Context, alertCh <-chan StockAlert) {
    for {
        select {
        case alert := <-alertCh:
            // Process alert (send email, log, etc.)
            s.processStockAlert(alert)
        case <-ctx.Done():
            return
        }
    }
}
```

### **Step 2: Add Email Service to Server Setup**

```go
// In internal/server/http/server.go
func (server *Server) setupRouter() {
    // ... existing code ...
    
    // Initialize email service
    emailService := notifications.NewEmailService(3) // 3 workers
    emailService.Start(context.Background())
    
    // Pass to handlers that need email functionality
    // ...
}
```

### **Step 3: Add WebSocket Support**

```go
// In internal/server/http/server.go
func (server *Server) setupRouter() {
    // ... existing code ...
    
    // Initialize WebSocket hub
    wsHub := websocket.NewHub()
    go wsHub.Run(context.Background())
    
    // Add WebSocket endpoint
    router.GET("/ws", func(c *gin.Context) {
        websocket.HandleWebSocket(wsHub, c.Writer, c.Request)
    })
}
```

---

## 🔧 **TESTING CONCURRENT CODE**

### **Unit Testing with Goroutines**

```go
// Example test for stock monitor
func TestStockMonitor(t *testing.T) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    monitor := NewStockMonitor(mockStockRepo)
    monitor.Start(ctx)
    
    alertCh := monitor.Subscribe()
    
    // Wait for alerts
    select {
    case alert := <-alertCh:
        assert.Equal(t, "LOW", alert.AlertLevel)
    case <-time.After(2 * time.Second):
        t.Fatal("No alert received within timeout")
    }
}
```

---

## 📈 **PERFORMANCE CONSIDERATIONS**

### **Goroutine Pool Sizing Guidelines**
- **CPU-bound tasks:** Number of CPU cores
- **I/O-bound tasks:** 2-3x number of CPU cores
- **Database operations:** Based on connection pool size
- **External API calls:** Conservative (5-10)

### **Memory Management**
- Use buffered channels appropriately
- Implement proper cleanup in defer statements
- Monitor goroutine leaks with pprof

### **Error Handling**
- Always handle context cancellation
- Use errgroup for coordinated error handling
- Log errors with structured logging

---

## 🚨 **COMMON PITFALLS TO AVOID**

1. **Goroutine Leaks:** Always have exit conditions
2. **Race Conditions:** Use proper synchronization
3. **Deadlocks:** Avoid circular dependencies
4. **Channel Blocking:** Use select with default cases
5. **Infinite Goroutines:** Implement rate limiting

---

## 📚 **RECOMMENDED READING**

1. **"Concurrency in Go" by Katherine Cox-Buday**
2. **"Go Concurrency Patterns" - Rob Pike**
3. **"Advanced Go Concurrency Patterns" - Sameer Ajmani**
4. **Go Blog: "Go Concurrency Patterns"**

---

## ✅ **CURRENT STATUS SUMMARY**

**✅ ALREADY IMPLEMENTED:**
- Job Queue System (Worker Pool)
- Event Dispatcher (Fan-out Pattern)
- Background Cache Cleanup
- Rate Limiting Middleware
- Context-aware Workers

**🔄 RECOMMENDED NEXT STEPS:**
1. Implement Real-time Stock Monitoring
2. Add Async Email Notification System  
3. Create Concurrent Report Generation
4. Add WebSocket Support for Real-time Updates

**📊 CONCURRENCY MATURITY LEVEL:** **Intermediate** (60%)
- Strong foundation with room for advanced patterns
- Good use of context and synchronization primitives
- Ready for production-scale concurrent operations