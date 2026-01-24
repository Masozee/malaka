-- Indonesian Users Seed Data
-- Password: password123 (bcrypt hash) unless otherwise noted

-- Dev user (password: 687654)
INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'dev',
    '$2a$14$pE900.PrEfaPGAut2DpRa.uPCV0IvNL/MEwX0Jku1HM9ML5eokY5e',
    'dev@malaka.co.id',
    id,
    'Development User',
    '021-5550000',
    'admin',
    'active'
FROM companies WHERE name = 'PT Sepatu Nusantara'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'admin',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'admin@malaka.co.id',
    id,
    'Administrator Sistem',
    '021-5551001',
    'admin',
    'active'
FROM companies WHERE name = 'PT Sepatu Nusantara'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'manager_produksi',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'produksi@malaka.co.id',
    id,
    'Budi Santoso',
    '021-5551002',
    'manager',
    'active'
FROM companies WHERE name = 'PT Sepatu Nusantara'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'staff_gudang',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'gudang@malaka.co.id',
    id,
    'Ahmad Hidayat',
    '021-5551003',
    'staff',
    'active'
FROM companies WHERE name = 'PT Sepatu Nusantara'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'supervisor_penjualan',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'penjualan@malaka.co.id',
    id,
    'Dewi Sartika',
    '021-5551004',
    'supervisor',
    'active'
FROM companies WHERE name = 'CV Dagang Sepatu'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'kasir_toko',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'kasir@malaka.co.id',
    id,
    'Sri Mulyani',
    '021-5551005',
    'cashier',
    'active'
FROM companies WHERE name = 'CV Dagang Sepatu'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'hrd_manager',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'hrd@malaka.co.id',
    id,
    'Ratna Sari',
    '021-5551006',
    'hr_manager',
    'active'
FROM companies WHERE name = 'PT Industri Kulit'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'finance_manager',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'finance@malaka.co.id',
    id,
    'Hendra Wijaya',
    '021-5551007',
    'finance_manager',
    'active'
FROM companies WHERE name = 'PT Sepatu Nusantara'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'qc_staff',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'qc@malaka.co.id',
    id,
    'Bambang Suryanto',
    '021-5551008',
    'qc_staff',
    'active'
FROM companies WHERE name = 'CV Sepatu Berkah'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'export_manager',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'export@malaka.co.id',
    id,
    'Linda Susanti',
    '021-5551009',
    'export_manager',
    'active'
FROM companies WHERE name = 'PT Footwear Nusantara'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, email, company_id, full_name, phone, role, status)
SELECT
    'logistics_staff',
    '$2a$14$92K/7vYh1.ZQpQXGzNdaK.hSAUqOZxQnTYJzaOgT1kgNYGYdNzuOq',
    'logistics@malaka.co.id',
    id,
    'Agus Setiawan',
    '021-5551010',
    'logistics',
    'active'
FROM companies WHERE name = 'PT Perdagangan Maju'
ON CONFLICT DO NOTHING;
