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
	query := `INSERT INTO users (username, password, email, full_name, phone, company_id, role, status, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
			  RETURNING id, created_at, updated_at`
	err := r.db.QueryRowContext(ctx, query, user.Username, user.Password, user.Email, user.FullName, user.Phone, user.CompanyID, user.Role, user.Status, user.CreatedAt, user.UpdatedAt).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	return err
}

// GetByID retrieves a user by its ID from the database.
func (r *UserRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.User, error) {
	query := `SELECT id, username, password, email, full_name, phone, company_id, role, status, last_login, created_at, updated_at FROM users WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	user := &entities.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.FullName, &user.Phone, &user.CompanyID, &user.Role, &user.Status, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // User not found
	}
	return user, err
}

// Update updates an existing user in the database.
func (r *UserRepositoryImpl) Update(ctx context.Context, user *entities.User) error {
	query := `UPDATE users SET username = $1, password = $2, email = $3, full_name = $4, phone = $5, company_id = $6, role = $7, status = $8, updated_at = $9 WHERE id = $10`
	_, err := r.db.ExecContext(ctx, query, user.Username, user.Password, user.Email, user.FullName, user.Phone, user.CompanyID, user.Role, user.Status, user.UpdatedAt, user.ID)
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
	query := `SELECT id, username, password, email, full_name, phone, company_id, role, status, last_login, created_at, updated_at FROM users ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		user := &entities.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.FullName, &user.Phone, &user.CompanyID, &user.Role, &user.Status, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

// GetByUsername retrieves a user by its username from the database.
func (r *UserRepositoryImpl) GetByUsername(ctx context.Context, username string) (*entities.User, error) {
	query := `SELECT id, username, password, email, full_name, phone, company_id, role, status, last_login, created_at, updated_at FROM users WHERE username = $1`
	row := r.db.QueryRowContext(ctx, query, username)

	user := &entities.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.FullName, &user.Phone, &user.CompanyID, &user.Role, &user.Status, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // User not found
	}
	return user, err
}

// GetByEmail retrieves a user by its email from the database.
func (r *UserRepositoryImpl) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	query := `SELECT id, username, password, email, full_name, phone, company_id, role, status, last_login, created_at, updated_at FROM users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)

	user := &entities.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.FullName, &user.Phone, &user.CompanyID, &user.Role, &user.Status, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // User not found
	}
	return user, err
}
