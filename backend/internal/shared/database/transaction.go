package database

import (
	"context"
	"database/sql"
)

// Tx provides a wrapper around sql.Tx for transaction management.
type Tx struct {
	*sql.Tx
}

// Begin starts a new transaction.
func Begin(db *sql.DB) (*Tx, error) {
	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return nil, err
	}
	return &Tx{tx}, nil
}

// Commit commits the transaction.
func (tx *Tx) Commit() error {
	return tx.Tx.Commit()
}

// Rollback rollbacks the transaction.
func (tx *Tx) Rollback() error {
	return tx.Tx.Rollback()
}
