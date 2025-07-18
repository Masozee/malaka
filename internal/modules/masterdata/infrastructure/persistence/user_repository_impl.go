package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// UserRepositoryImpl implements repositories.UserRepository.
type UserRepositoryImpl struct {
	db *sqlx.DB
}

// NewUserRepositoryImpl creates a new UserRepositoryImpl.
func NewUserRepositoryImpl(db *sqlx.DB) *UserRepositoryImpl {
	return &UserRepositoryImpl{db: db}
}

// Create creates a new user in the database.
func (r *UserRepositoryImpl) Create(ctx context.Context, user *entities.User) error {
	query := `INSERT INTO users (id, username, password, email, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, user.ID, user.Username, user.Password, user.Email, user.CompanyID, user.CreatedAt, user.UpdatedAt)
	return err
}

// GetByID retrieves a user by its ID from the database.
func (r *UserRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.User, error) {
	query := `SELECT id, username, password, email, company_id, created_at, updated_at FROM users WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	user := &entities.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.CompanyID, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // User not found
	}
	return user, err
}

// Update updates an existing user in the database.
func (r *UserRepositoryImpl) Update(ctx context.Context, user *entities.User) error {
	query := `UPDATE users SET username = $1, password = $2, email = $3, company_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, user.Username, user.Password, user.Email, user.CompanyID, user.UpdatedAt, user.ID)
	return err
}

// Delete deletes a user by its ID from the database.
func (r *UserRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAll retrieves all users from the database.
func (r *UserRepositoryImpl) GetAll(ctx context.Context) ([]*entities.User, error) {
	query := `SELECT id, username, password, email, company_id, created_at, updated_at FROM users ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		user := &entities.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.CompanyID, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

// GetByUsername retrieves a user by its username from the database.
func (r *UserRepositoryImpl) GetByUsername(ctx context.Context, username string) (*entities.User, error) {
	query := `SELECT id, username, password, email, company_id, created_at, updated_at FROM users WHERE username = $1`
	row := r.db.QueryRowContext(ctx, query, username)

	user := &entities.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.CompanyID, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // User not found
	}
	return user, err
}
