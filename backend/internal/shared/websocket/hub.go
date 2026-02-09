package websocket

import (
	"encoding/json"
	"sync"
	"time"

	"go.uber.org/zap"
)

// Hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	// All connected clients
	clients map[*Client]bool

	// Clients grouped by company ID for scoped broadcasting
	companies map[string]map[*Client]bool

	// Clients indexed by user ID (one user can have multiple connections)
	users map[string]map[*Client]bool

	// Record locks: "entity_type:entity_id" -> client
	locks map[string]*Client

	register   chan *Client
	unregister chan *Client

	mu     sync.RWMutex
	logger *zap.Logger
}

// NewHub creates a new Hub.
func NewHub(logger *zap.Logger) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		companies:  make(map[string]map[*Client]bool),
		users:      make(map[string]map[*Client]bool),
		locks:      make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		logger:     logger,
	}
}

// Run starts the hub's main event loop.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.addClient(client)

		case client := <-h.unregister:
			h.removeClient(client)
		}
	}
}

func (h *Hub) addClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client] = true

	// Index by company
	if client.companyID != "" {
		if h.companies[client.companyID] == nil {
			h.companies[client.companyID] = make(map[*Client]bool)
		}
		h.companies[client.companyID][client] = true
	}

	// Index by user
	if h.users[client.userID] == nil {
		h.users[client.userID] = make(map[*Client]bool)
	}
	h.users[client.userID][client] = true

	h.logger.Info("websocket client connected",
		zap.String("user_id", client.userID),
		zap.String("company_id", client.companyID),
		zap.Int("total_clients", len(h.clients)),
	)

	// Broadcast presence update to company
	h.broadcastPresenceUnlocked(client.companyID)
}

func (h *Hub) removeClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[client]; !ok {
		return
	}

	delete(h.clients, client)
	close(client.send)

	// Remove from company index
	if companyClients, ok := h.companies[client.companyID]; ok {
		delete(companyClients, client)
		if len(companyClients) == 0 {
			delete(h.companies, client.companyID)
		}
	}

	// Remove from user index
	if userClients, ok := h.users[client.userID]; ok {
		delete(userClients, client)
		if len(userClients) == 0 {
			delete(h.users, client.userID)
		}
	}

	// Release any locks held by this client
	for key, holder := range h.locks {
		if holder == client {
			delete(h.locks, key)
		}
	}

	h.logger.Info("websocket client disconnected",
		zap.String("user_id", client.userID),
		zap.String("company_id", client.companyID),
		zap.Int("total_clients", len(h.clients)),
	)

	// Broadcast presence update to company
	h.broadcastPresenceUnlocked(client.companyID)
}

// BroadcastToCompany sends a message to all clients in a company.
func (h *Hub) BroadcastToCompany(companyID string, msg *Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		h.logger.Error("failed to marshal broadcast message", zap.Error(err))
		return
	}

	h.mu.RLock()
	clients := h.companies[companyID]
	h.mu.RUnlock()

	for client := range clients {
		select {
		case client.send <- data:
		default:
			// Client send buffer full, skip
		}
	}
}

// SendToUser sends a message to all connections of a specific user.
func (h *Hub) SendToUser(userID string, msg *Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		h.logger.Error("failed to marshal user message", zap.Error(err))
		return
	}

	h.mu.RLock()
	clients := h.users[userID]
	h.mu.RUnlock()

	for client := range clients {
		select {
		case client.send <- data:
		default:
		}
	}
}

// GetOnlineUsers returns a list of unique user IDs connected for a company.
func (h *Hub) GetOnlineUsers(companyID string) []string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	seen := make(map[string]bool)
	var users []string

	for client := range h.companies[companyID] {
		if !seen[client.userID] {
			seen[client.userID] = true
			users = append(users, client.userID)
		}
	}
	return users
}

// GetOnlineCount returns the number of unique online users for a company.
func (h *Hub) GetOnlineCount(companyID string) int {
	return len(h.GetOnlineUsers(companyID))
}

// IsUserOnline checks if a user has any active WebSocket connections.
func (h *Hub) IsUserOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	clients, exists := h.users[userID]
	return exists && len(clients) > 0
}

// handleClientMessage processes messages received from a client.
func (h *Hub) handleClientMessage(client *Client, msg *Message) {
	switch msg.Type {
	case MessageTypePing:
		pong := &Message{Type: MessageTypePong, Timestamp: time.Now()}
		data, _ := json.Marshal(pong)
		select {
		case client.send <- data:
		default:
		}

	case MessageTypeRecordLock:
		h.handleRecordLock(client, msg)

	case MessageTypeRecordUnlock:
		h.handleRecordUnlock(client, msg)

	case MessageTypeTypingIndicator:
		h.handleTypingIndicator(client, msg)
	}
}

func (h *Hub) handleRecordLock(client *Client, msg *Message) {
	var payload RecordLockPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return
	}

	key := payload.EntityType + ":" + payload.EntityID

	h.mu.Lock()
	h.locks[key] = client
	h.mu.Unlock()

	// Broadcast lock to company
	payload.UserID = client.userID
	payload.UserEmail = client.email
	lockMsg, _ := NewMessage(MessageTypeRecordLock, payload)
	h.BroadcastToCompany(client.companyID, lockMsg)
}

func (h *Hub) handleRecordUnlock(client *Client, msg *Message) {
	var payload RecordLockPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return
	}

	key := payload.EntityType + ":" + payload.EntityID

	h.mu.Lock()
	if holder, ok := h.locks[key]; ok && holder == client {
		delete(h.locks, key)
	}
	h.mu.Unlock()

	// Broadcast unlock to company
	payload.UserID = client.userID
	payload.UserEmail = client.email
	unlockMsg, _ := NewMessage(MessageTypeRecordUnlock, payload)
	h.BroadcastToCompany(client.companyID, unlockMsg)
}

func (h *Hub) handleTypingIndicator(client *Client, msg *Message) {
	var payload TypingIndicatorPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return
	}

	// Set the sender's user ID (don't trust client-provided value)
	payload.UserID = client.userID

	// Relay typing indicator to all other company clients
	relayMsg, _ := NewMessage(MessageTypeTypingIndicator, payload)
	data, err := json.Marshal(relayMsg)
	if err != nil {
		return
	}

	h.mu.RLock()
	companyClients := h.companies[client.companyID]
	h.mu.RUnlock()

	for c := range companyClients {
		if c == client {
			continue // Don't echo back to sender
		}
		select {
		case c.send <- data:
		default:
		}
	}
}

// broadcastPresenceUnlocked sends presence/dashboard update to a company.
// Must be called with h.mu held (at least read lock).
func (h *Hub) broadcastPresenceUnlocked(companyID string) {
	if companyID == "" {
		return
	}

	// Count unique users
	seen := make(map[string]bool)
	for client := range h.companies[companyID] {
		seen[client.userID] = true
	}

	msg, _ := NewMessage(MessageTypeDashboardUpdate, DashboardPayload{
		OnlineUsers: len(seen),
	})

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	for client := range h.companies[companyID] {
		select {
		case client.send <- data:
		default:
		}
	}
}
