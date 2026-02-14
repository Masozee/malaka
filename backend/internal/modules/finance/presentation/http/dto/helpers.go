package dto

import (
	"malaka/internal/shared/uuid"
)

// safeParseUUID parses a UUID string, returning a zero UUID if the string is empty or invalid.
func safeParseUUID(s string) uuid.ID {
	if s == "" {
		return uuid.ID{}
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.ID{}
	}
	return id
}
