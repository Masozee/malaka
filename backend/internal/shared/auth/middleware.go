package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Middleware is a Gin middleware for authentication.
func Middleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims, err := ParseJWT(authHeader, secret)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}
