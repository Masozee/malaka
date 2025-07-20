package config

import (
	"fmt"
)

// DatabaseConfig holds the database connection parameters.

type DatabaseConfig struct {
	Username string
	Password string
	DBName   string
	Host     string
	Port     string
}

// ConnectionString returns the connection string for the database.
func (c *DatabaseConfig) ConnectionString() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.Host, c.Port, c.Username, c.Password, c.DBName)
}
