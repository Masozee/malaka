package auth

import (
	"time"

	"github.com/dgrijalva/jwt-go"
)

// Claims represents the JWT claims.
type Claims struct {
	Role      string `json:"role"`
	CompanyID string `json:"company_id,omitempty"`
	Email     string `json:"email,omitempty"`
	jwt.StandardClaims
}

// NewJWT creates a new JWT token with user info.
func NewJWT(userID, companyID, email, role, secret string, expiry int) (string, error) {
	claims := &Claims{
		Role:      role,
		CompanyID: companyID,
		Email:     email,
		StandardClaims: jwt.StandardClaims{
			Subject:   userID,
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
