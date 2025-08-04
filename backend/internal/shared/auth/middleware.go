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

		// Extract token from "Bearer <token>" format
		const bearerPrefix = "Bearer "
		if len(authHeader) < len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		
		token := authHeader[len(bearerPrefix):]
		claims, err := ParseJWT(token, secret)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("user_id", claims.Subject)
		c.Next()
	}
}
