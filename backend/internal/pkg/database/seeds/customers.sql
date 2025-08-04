-- Indonesian Customer Seed Data (30 customers - mix of personal and corporate)

INSERT INTO customers (name, address, contact, contact_person, email, phone, company_id, status) VALUES

-- Corporate Customers (20)
('PT Teknologi Digital Indonesia', 'Jl. Sudirman No. 45, Jakarta Selatan 12190', 'contact@techdigital.co.id', 'Budi Santoso', 'budi.santoso@techdigital.co.id', '021-7890-1234', (SELECT id FROM companies LIMIT 1), 'active'),

('CV Maju Bersama Sejahtera', 'Jl. Malioboro No. 128, Yogyakarta 55213', 'info@majubersama.co.id', 'Siti Rahayu', 'siti.rahayu@majubersama.co.id', '0274-555-6789', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Cahaya Timur Manufacturing', 'Jl. Ahmad Yani No. 67, Surabaya 60234', 'admin@cahayatimur.co.id', 'Ahmad Wijaya', 'ahmad.wijaya@cahayatimur.co.id', '031-8765-4321', (SELECT id FROM companies LIMIT 1), 'active'),

('UD Sumber Rejeki', 'Jl. Pahlawan No. 234, Bandung 40123', 'contact@sumberrejeki.com', 'Dewi Lestari', 'dewi.lestari@sumberrejeki.com', '022-2345-6789', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Nusantara Logistik Prima', 'Jl. Gatot Subroto No. 89, Jakarta Pusat 10270', 'logistics@nusantaraprima.co.id', 'Eko Prasetyo', 'eko.prasetyo@nusantaraprima.co.id', '021-5432-1098', (SELECT id FROM companies LIMIT 1), 'active'),

('CV Berkah Mandiri', 'Jl. Diponegoro No. 156, Semarang 50241', 'berkah@berkahmandiri.co.id', 'Indira Sari', 'indira.sari@berkahmandiri.co.id', '024-7654-3210', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Bintang Terang Electronics', 'Jl. Hayam Wuruk No. 78, Jakarta Barat 11180', 'sales@bintangterang.co.id', 'Rudi Hermawan', 'rudi.hermawan@bintangterang.co.id', '021-6543-2109', (SELECT id FROM companies LIMIT 1), 'active'),

('Koperasi Mitra Sejati', 'Jl. Veteran No. 45, Malang 65145', 'koperasi@mitrasejati.org', 'Ratna Puspita', 'ratna.puspita@mitrasejati.org', '0341-555-7890', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Garuda Perkasa Trading', 'Jl. Thamrin No. 123, Jakarta Pusat 10310', 'trading@garudaperkasa.co.id', 'Hendra Gunawan', 'hendra.gunawan@garudaperkasa.co.id', '021-3456-7890', (SELECT id FROM companies LIMIT 1), 'active'),

('CV Sari Mulya Furniture', 'Jl. Raya Kuta No. 88, Denpasar 80361', 'furniture@sarimulya.co.id', 'Made Widiarta', 'made.widiarta@sarimulya.co.id', '0361-789-1234', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Indah Karya Konstruksi', 'Jl. Ir. H. Juanda No. 67, Bekasi 17121', 'konstruksi@indahkarya.co.id', 'Bambang Suryo', 'bambang.suryo@indahkarya.co.id', '021-8901-2345', (SELECT id FROM companies LIMIT 1), 'active'),

('CV Harapan Jaya Textile', 'Jl. Asia Afrika No. 234, Bandung 40112', 'textile@harapanjaya.co.id', 'Lina Marlina', 'lina.marlina@harapanjaya.co.id', '022-4567-8901', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Sukses Makmur Abadi', 'Jl. Jend. Sudirman No. 199, Medan 20212', 'info@suksesmakmur.co.id', 'Doni Pratama', 'doni.pratama@suksesmakmur.co.id', '061-7890-1234', (SELECT id FROM companies LIMIT 1), 'active'),

('UD Karya Mandiri Sejahtera', 'Jl. Gajah Mada No. 156, Solo 57126', 'karya@karyamandiri.com', 'Sri Mulyani', 'sri.mulyani@karyamandiri.com', '0271-555-6789', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Mega Persada Industries', 'Jl. MT Haryono No. 445, Jakarta Timur 13630', 'industries@megapersada.co.id', 'Agus Setiawan', 'agus.setiawan@megapersada.co.id', '021-8765-4321', (SELECT id FROM companies LIMIT 1), 'active'),

('CV Bahagia Sentosa', 'Jl. Pemuda No. 89, Samarinda 75123', 'bahagia@bahagiasentosa.co.id', 'Nia Kurniati', 'nia.kurniati@bahagiasentosa.co.id', '0541-123-4567', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Prima Jaya Mandiri', 'Jl. Ahmad Dahlan No. 67, Palembang 30126', 'prima@primajaya.co.id', 'Andi Wijaya', 'andi.wijaya@primajaya.co.id', '0711-234-5678', (SELECT id FROM companies LIMIT 1), 'active'),

('CV Sejahtera Abadi', 'Jl. Panglima Sudirman No. 234, Pontianak 78116', 'sejahtera@sejahteraabadi.co.id', 'Maya Sari', 'maya.sari@sejahteraabadi.co.id', '0561-345-6789', (SELECT id FROM companies LIMIT 1), 'active'),

('PT Cahaya Baru Elektronik', 'Jl. Raya Bogor No. 178, Depok 16424', 'elektronik@cahayabaru.co.id', 'Reza Pratama', 'reza.pratama@cahayabaru.co.id', '021-7543-2109', (SELECT id FROM companies LIMIT 1), 'active'),

('UD Mitra Usaha Bersama', 'Jl. Veteran No. 123, Balikpapan 76114', 'mitra@mitrausaha.com', 'Sari Indah', 'sari.indah@mitrausaha.com', '0542-456-7890', (SELECT id FROM companies LIMIT 1), 'active'),

-- Personal Customers (10)
('Budi Hartono', 'Jl. Kebayoran Lama No. 45, Jakarta Selatan 12240', 'budi.hartono@gmail.com', 'Budi Hartono', 'budi.hartono@gmail.com', '0812-3456-7890', (SELECT id FROM companies LIMIT 1), 'active'),

('Siti Nurhaliza', 'Jl. Cihampelas No. 67, Bandung 40131', 'siti.nurhaliza@yahoo.com', 'Siti Nurhaliza', 'siti.nurhaliza@yahoo.com', '0813-4567-8901', (SELECT id FROM companies LIMIT 1), 'active'),

('Ahmad Fauzi', 'Jl. Malioboro No. 89, Yogyakarta 55271', 'ahmad.fauzi@hotmail.com', 'Ahmad Fauzi', 'ahmad.fauzi@hotmail.com', '0814-5678-9012', (SELECT id FROM companies LIMIT 1), 'active'),

('Dewi Sartika', 'Jl. Dipatiukur No. 123, Bandung 40132', 'dewi.sartika@gmail.com', 'Dewi Sartika', 'dewi.sartika@gmail.com', '0815-6789-0123', (SELECT id FROM companies LIMIT 1), 'active'),

('Eko Prasetyo', 'Jl. Kemang Raya No. 234, Jakarta Selatan 12560', 'eko.prasetyo@outlook.com', 'Eko Prasetyo', 'eko.prasetyo@outlook.com', '0816-7890-1234', (SELECT id FROM companies LIMIT 1), 'active'),

('Ratna Sari', 'Jl. Sudirman No. 156, Medan 20212', 'ratna.sari@gmail.com', 'Ratna Sari', 'ratna.sari@gmail.com', '0817-8901-2345', (SELECT id FROM companies LIMIT 1), 'active'),

('Hendra Gunawan', 'Jl. Pahlawan No. 78, Surabaya 60271', 'hendra.gunawan@yahoo.com', 'Hendra Gunawan', 'hendra.gunawan@yahoo.com', '0818-9012-3456', (SELECT id FROM companies LIMIT 1), 'active'),

('Lina Marlina', 'Jl. Asia Afrika No. 345, Denpasar 80234', 'lina.marlina@gmail.com', 'Lina Marlina', 'lina.marlina@gmail.com', '0819-0123-4567', (SELECT id FROM companies LIMIT 1), 'active'),

('Rudi Hermawan', 'Jl. Diponegoro No. 456, Semarang 50275', 'rudi.hermawan@hotmail.com', 'Rudi Hermawan', 'rudi.hermawan@hotmail.com', '0821-1234-5678', (SELECT id FROM companies LIMIT 1), 'active'),

('Maya Putri', 'Jl. Gajah Mada No. 567, Makassar 90174', 'maya.putri@gmail.com', 'Maya Putri', 'maya.putri@gmail.com', '0822-2345-6789', (SELECT id FROM companies LIMIT 1), 'active');