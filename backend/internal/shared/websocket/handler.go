package websocket

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"

	"malaka/internal/shared/auth"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins; tighten in production
	},
}

// HandleWebSocket returns a Gin handler that upgrades HTTP to WebSocket.
// Authentication is done via the ?token= query parameter.
func HandleWebSocket(hub *Hub, jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		claims, err := auth.ParseJWT(token, jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			hub.logger.Error("websocket upgrade failed", zap.Error(err))
			return
		}

		client := &Client{
			hub:       hub,
			conn:      conn,
			send:      make(chan []byte, 256),
			userID:    claims.Subject,
			companyID: claims.CompanyID,
			email:     claims.Email,
			logger:    hub.logger,
		}

		hub.register <- client

		go client.WritePump()
		go client.ReadPump()
	}
}
