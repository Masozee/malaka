package persistence

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// WarehouseRepositoryImpl implements repositories.WarehouseRepository.
type WarehouseRepositoryImpl struct {
	db *sqlx.DB
}

// NewWarehouseRepositoryImpl creates a new WarehouseRepositoryImpl.
func NewWarehouseRepositoryImpl(db *sqlx.DB) *WarehouseRepositoryImpl {
	return &WarehouseRepositoryImpl{db: db}
}

// Create creates a new warehouse in the database.
func (r *WarehouseRepositoryImpl) Create(ctx context.Context, warehouse *entities.Warehouse) error {
	zonesJSON, _ := json.Marshal(warehouse.Zones)
	operatingHoursJSON, _ := json.Marshal(warehouse.OperatingHours)
	facilitiesJSON, _ := json.Marshal(warehouse.Facilities)
	coordinatesJSON, _ := json.Marshal(warehouse.Coordinates)

	query := `INSERT INTO warehouses (
		id, code, name, address, city, phone, manager, email,
		type, capacity, current_stock, status,
		zones, operating_hours, facilities, coordinates,
		company_id, created_at, updated_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`

	_, err := r.db.ExecContext(ctx, query,
		warehouse.ID, warehouse.Code, warehouse.Name, warehouse.Address,
		warehouse.City, warehouse.Phone, warehouse.Manager, warehouse.Email,
		warehouse.Type, warehouse.Capacity, warehouse.CurrentStock, warehouse.Status,
		zonesJSON, operatingHoursJSON, facilitiesJSON, coordinatesJSON,
		warehouse.CompanyID, warehouse.CreatedAt, warehouse.UpdatedAt)
	return err
}

// GetByID retrieves a warehouse by its ID from the database.
func (r *WarehouseRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Warehouse, error) {
	query := `SELECT id, code, name, address, city, phone, manager, email,
		type, capacity, current_stock, status,
		zones, operating_hours, facilities, coordinates,
		COALESCE(company_id::text, '') as company_id, created_at, updated_at
		FROM warehouses WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	warehouse := &entities.Warehouse{}
	var zonesJSON, operatingHoursJSON, facilitiesJSON, coordinatesJSON []byte

	err := row.Scan(
		&warehouse.ID, &warehouse.Code, &warehouse.Name, &warehouse.Address,
		&warehouse.City, &warehouse.Phone, &warehouse.Manager, &warehouse.Email,
		&warehouse.Type, &warehouse.Capacity, &warehouse.CurrentStock, &warehouse.Status,
		&zonesJSON, &operatingHoursJSON, &facilitiesJSON, &coordinatesJSON,
		&warehouse.CompanyID, &warehouse.CreatedAt, &warehouse.UpdatedAt)
	
	if err == sql.ErrNoRows {
		return nil, nil // Warehouse not found
	}
	if err != nil {
		return nil, err
	}

	// Parse JSON fields
	if len(zonesJSON) > 0 {
		json.Unmarshal(zonesJSON, &warehouse.Zones)
	}
	if len(operatingHoursJSON) > 0 {
		json.Unmarshal(operatingHoursJSON, &warehouse.OperatingHours)
	}
	if len(facilitiesJSON) > 0 {
		json.Unmarshal(facilitiesJSON, &warehouse.Facilities)
	}
	if len(coordinatesJSON) > 0 {
		json.Unmarshal(coordinatesJSON, &warehouse.Coordinates)
	}

	return warehouse, nil
}

// Update updates an existing warehouse in the database.
func (r *WarehouseRepositoryImpl) Update(ctx context.Context, warehouse *entities.Warehouse) error {
	zonesJSON, _ := json.Marshal(warehouse.Zones)
	operatingHoursJSON, _ := json.Marshal(warehouse.OperatingHours)
	facilitiesJSON, _ := json.Marshal(warehouse.Facilities)
	coordinatesJSON, _ := json.Marshal(warehouse.Coordinates)

	query := `UPDATE warehouses SET
		code = $1, name = $2, address = $3, city = $4, phone = $5,
		manager = $6, email = $7, type = $8, capacity = $9,
		current_stock = $10, status = $11,
		zones = $12, operating_hours = $13, facilities = $14, coordinates = $15,
		company_id = $16, updated_at = $17
		WHERE id = $18`

	_, err := r.db.ExecContext(ctx, query,
		warehouse.Code, warehouse.Name, warehouse.Address, warehouse.City,
		warehouse.Phone, warehouse.Manager, warehouse.Email, warehouse.Type,
		warehouse.Capacity, warehouse.CurrentStock, warehouse.Status,
		zonesJSON, operatingHoursJSON, facilitiesJSON, coordinatesJSON,
		warehouse.CompanyID, warehouse.UpdatedAt, warehouse.ID)
	return err
}

// GetAll retrieves all warehouses from the database.
func (r *WarehouseRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Warehouse, error) {
	query := `SELECT id, code, name, address, city, phone, manager, email,
		type, capacity, current_stock, status,
		zones, operating_hours, facilities, coordinates,
		COALESCE(company_id::text, '') as company_id, created_at, updated_at
		FROM warehouses ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var warehouses []*entities.Warehouse
	for rows.Next() {
		warehouse := &entities.Warehouse{}
		var zonesJSON, operatingHoursJSON, facilitiesJSON, coordinatesJSON []byte
		
		err := rows.Scan(
			&warehouse.ID, &warehouse.Code, &warehouse.Name, &warehouse.Address,
			&warehouse.City, &warehouse.Phone, &warehouse.Manager, &warehouse.Email,
			&warehouse.Type, &warehouse.Capacity, &warehouse.CurrentStock, &warehouse.Status,
			&zonesJSON, &operatingHoursJSON, &facilitiesJSON, &coordinatesJSON,
			&warehouse.CompanyID, &warehouse.CreatedAt, &warehouse.UpdatedAt)
		if err != nil {
			return nil, err
		}

		// Parse JSON fields
		if len(zonesJSON) > 0 {
			json.Unmarshal(zonesJSON, &warehouse.Zones)
		}
		if len(operatingHoursJSON) > 0 {
			json.Unmarshal(operatingHoursJSON, &warehouse.OperatingHours)
		}
		if len(facilitiesJSON) > 0 {
			json.Unmarshal(facilitiesJSON, &warehouse.Facilities)
		}
		if len(coordinatesJSON) > 0 {
			json.Unmarshal(coordinatesJSON, &warehouse.Coordinates)
		}

		warehouses = append(warehouses, warehouse)
	}
	return warehouses, rows.Err()
}

// Delete deletes a warehouse by its ID from the database.
func (r *WarehouseRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM warehouses WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
