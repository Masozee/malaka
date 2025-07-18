package auth

import (
	"time"

	"github.com/dgrijalva/jwt-go"
)

// Claims represents the JWT claims.
type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

// NewJWT creates a new JWT token.
func NewJWT(userID string, secret string, expiry int) (string, error) {
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * time.Duration(expiry)).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseJWT parses a JWT token.
func ParseJWT(tokenString string, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}
