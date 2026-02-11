package sync

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// DimensionSync handles syncing dimension tables from PostgreSQL to ClickHouse.
type DimensionSync struct {
	pgDB   *sqlx.DB
	chDB   *sql.DB
	logger *zap.Logger
}

// NewDimensionSync creates a new dimension sync.
func NewDimensionSync(pgDB *sqlx.DB, chDB *sql.DB, logger *zap.Logger) *DimensionSync {
	return &DimensionSync{pgDB: pgDB, chDB: chDB, logger: logger}
}

// SyncAll syncs all dimension tables.
func (d *DimensionSync) SyncAll(ctx context.Context) error {
	syncs := []struct {
		name string
		fn   func(context.Context) error
	}{
		{"dim_customer", d.syncCustomers},
		{"dim_supplier", d.syncSuppliers},
		{"dim_article", d.syncArticles},
		{"dim_warehouse", d.syncWarehouses},
		{"dim_employee", d.syncEmployees},
	}

	for _, s := range syncs {
		if err := s.fn(ctx); err != nil {
			d.logger.Error("Dimension sync failed", zap.String("table", s.name), zap.Error(err))
			continue
		}
		d.logger.Debug("Dimension synced", zap.String("table", s.name))
	}
	return nil
}

func (d *DimensionSync) syncCustomers(ctx context.Context) error {
	type pgCustomer struct {
		ID        string         `db:"id"`
		Name      string         `db:"name"`
		Phone     sql.NullString `db:"phone"`
		Email     sql.NullString `db:"email"`
		Address   sql.NullString `db:"address"`
		Status    sql.NullString `db:"status"`
		UpdatedAt time.Time      `db:"updated_at"`
	}

	var customers []pgCustomer
	if err := d.pgDB.SelectContext(ctx, &customers,
		`SELECT id, COALESCE(name,'') as name, phone, email, address, status,
		        COALESCE(updated_at, created_at) as updated_at
		 FROM customers ORDER BY id`); err != nil {
		return fmt.Errorf("fetch customers: %w", err)
	}

	if len(customers) == 0 {
		return nil
	}

	tx, err := d.chDB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO dim_customer (id, name, phone, email, address, city, customer_type, is_active, updated_at, _version)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, c := range customers {
		active := uint8(1)
		if c.Status.Valid && c.Status.String != "active" {
			active = 0
		}
		_, err := stmt.ExecContext(ctx,
			c.ID, c.Name, nullStr(c.Phone), nullStr(c.Email),
			nullStr(c.Address), "", "",
			active, c.UpdatedAt, uint64(c.UpdatedAt.UnixMilli()))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("insert customer %s: %w", c.ID, err)
		}
	}

	return tx.Commit()
}

func (d *DimensionSync) syncSuppliers(ctx context.Context) error {
	type pgSupplier struct {
		ID            string         `db:"id"`
		Name          string         `db:"name"`
		ContactPerson sql.NullString `db:"contact_person"`
		Phone         sql.NullString `db:"phone"`
		Email         sql.NullString `db:"email"`
		Address       sql.NullString `db:"address"`
		Status        sql.NullString `db:"status"`
		UpdatedAt     time.Time      `db:"updated_at"`
	}

	var suppliers []pgSupplier
	if err := d.pgDB.SelectContext(ctx, &suppliers,
		`SELECT id, COALESCE(name,'') as name, contact_person, phone, email, address, status,
		        COALESCE(updated_at, created_at) as updated_at
		 FROM suppliers ORDER BY id`); err != nil {
		return fmt.Errorf("fetch suppliers: %w", err)
	}

	if len(suppliers) == 0 {
		return nil
	}

	tx, err := d.chDB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO dim_supplier (id, name, contact_person, phone, email, address, city, supplier_type, is_active, updated_at, _version)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, s := range suppliers {
		active := uint8(1)
		if s.Status.Valid && s.Status.String != "active" {
			active = 0
		}
		_, err := stmt.ExecContext(ctx,
			s.ID, s.Name, nullStr(s.ContactPerson), nullStr(s.Phone),
			nullStr(s.Email), nullStr(s.Address), "", "",
			active, s.UpdatedAt, uint64(s.UpdatedAt.UnixMilli()))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("insert supplier %s: %w", s.ID, err)
		}
	}

	return tx.Commit()
}

func (d *DimensionSync) syncArticles(ctx context.Context) error {
	type pgArticle struct {
		ID                 string         `db:"id"`
		Barcode            sql.NullString `db:"barcode"`
		Name               string         `db:"name"`
		Description        sql.NullString `db:"description"`
		ClassificationID   sql.NullString `db:"classification_id"`
		ClassificationName sql.NullString `db:"classification_name"`
		ColorID            sql.NullString `db:"color_id"`
		ColorName          sql.NullString `db:"color_name"`
		ModelID            sql.NullString `db:"model_id"`
		ModelName          sql.NullString `db:"model_name"`
		Price              float64        `db:"price"`
		UpdatedAt          time.Time      `db:"updated_at"`
	}

	var articles []pgArticle
	if err := d.pgDB.SelectContext(ctx, &articles,
		`SELECT a.id, a.barcode, COALESCE(a.name,'') as name,
		        a.description, a.classification_id,
		        COALESCE(cl.name,'') as classification_name,
		        a.color_id, COALESCE(co.name,'') as color_name,
		        a.model_id, COALESCE(m.name,'') as model_name,
		        COALESCE(a.price, 0) as price,
		        COALESCE(a.updated_at, a.created_at) as updated_at
		 FROM articles a
		 LEFT JOIN classifications cl ON a.classification_id = cl.id
		 LEFT JOIN colors co ON a.color_id = co.id
		 LEFT JOIN models m ON a.model_id = m.id
		 ORDER BY a.id`); err != nil {
		return fmt.Errorf("fetch articles: %w", err)
	}

	if len(articles) == 0 {
		return nil
	}

	tx, err := d.chDB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO dim_article (id, code, name, description, classification_id, classification_name,
		 color_id, color_name, model_id, model_name, price, cost, category, is_active, updated_at, _version)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, a := range articles {
		_, err := stmt.ExecContext(ctx,
			a.ID, nullStr(a.Barcode), a.Name, nullStr(a.Description),
			nullStr(a.ClassificationID), nullStr(a.ClassificationName),
			nullStr(a.ColorID), nullStr(a.ColorName),
			nullStr(a.ModelID), nullStr(a.ModelName),
			a.Price, 0.0, nullStr(a.ClassificationName),
			uint8(1), a.UpdatedAt, uint64(a.UpdatedAt.UnixMilli()))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("insert article %s: %w", a.ID, err)
		}
	}

	return tx.Commit()
}

func (d *DimensionSync) syncWarehouses(ctx context.Context) error {
	type pgWarehouse struct {
		ID        string         `db:"id"`
		Code      sql.NullString `db:"code"`
		Name      string         `db:"name"`
		City      sql.NullString `db:"city"`
		Type      sql.NullString `db:"type"`
		Status    sql.NullString `db:"status"`
		UpdatedAt time.Time      `db:"updated_at"`
	}

	var warehouses []pgWarehouse
	if err := d.pgDB.SelectContext(ctx, &warehouses,
		`SELECT id, code, COALESCE(name,'') as name, city, type, status,
		        COALESCE(updated_at, created_at) as updated_at
		 FROM warehouses ORDER BY id`); err != nil {
		return fmt.Errorf("fetch warehouses: %w", err)
	}

	if len(warehouses) == 0 {
		return nil
	}

	tx, err := d.chDB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO dim_warehouse (id, code, name, location, warehouse_type, is_active, updated_at, _version)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, w := range warehouses {
		active := uint8(1)
		if w.Status.Valid && w.Status.String != "active" {
			active = 0
		}
		_, err := stmt.ExecContext(ctx,
			w.ID, nullStr(w.Code), w.Name, nullStr(w.City), nullStr(w.Type),
			active, w.UpdatedAt, uint64(w.UpdatedAt.UnixMilli()))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("insert warehouse %s: %w", w.ID, err)
		}
	}

	return tx.Commit()
}

func (d *DimensionSync) syncEmployees(ctx context.Context) error {
	type pgEmployee struct {
		ID               string         `db:"id"`
		EmployeeCode     sql.NullString `db:"employee_code"`
		EmployeeName     string         `db:"employee_name"`
		Department       sql.NullString `db:"department"`
		Position         sql.NullString `db:"position"`
		HireDate         sql.NullTime   `db:"hire_date"`
		EmploymentStatus sql.NullString `db:"employment_status"`
		UpdatedAt        time.Time      `db:"updated_at"`
	}

	var employees []pgEmployee
	if err := d.pgDB.SelectContext(ctx, &employees,
		`SELECT id, employee_code, COALESCE(employee_name,'') as employee_name,
		        department, position, hire_date, employment_status,
		        COALESCE(updated_at, created_at) as updated_at
		 FROM employees ORDER BY id`); err != nil {
		return fmt.Errorf("fetch employees: %w", err)
	}

	if len(employees) == 0 {
		return nil
	}

	tx, err := d.chDB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO dim_employee (id, employee_code, full_name, department, position, hire_date, is_active, updated_at, _version)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, e := range employees {
		active := uint8(1)
		if e.EmploymentStatus.Valid && e.EmploymentStatus.String != "ACTIVE" {
			active = 0
		}
		hireDate := time.Time{}
		if e.HireDate.Valid {
			hireDate = e.HireDate.Time
		}
		_, err := stmt.ExecContext(ctx,
			e.ID, nullStr(e.EmployeeCode), e.EmployeeName,
			nullStr(e.Department), nullStr(e.Position),
			hireDate.Format("2006-01-02"),
			active, e.UpdatedAt, uint64(e.UpdatedAt.UnixMilli()))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("insert employee %s: %w", e.ID, err)
		}
	}

	return tx.Commit()
}

// nullStr extracts a string from sql.NullString, returning empty string for NULL.
func nullStr(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}
