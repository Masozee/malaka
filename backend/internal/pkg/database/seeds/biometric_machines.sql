-- Biometric Machines seed data
INSERT INTO biometric_machines (machine_code, machine_name, location, ip_address, port, brand, model, serial_number, is_active) VALUES
('BIO001', 'Mesin Absen Kantor Pusat', 'Jakarta - Kantor Pusat Lantai 1', '192.168.1.100', 4370, 'ZKTeco', 'F18', 'ZK20240101', true),
('BIO002', 'Mesin Absen Gudang Tangerang', 'Tangerang - Gudang Utama', '192.168.2.100', 4370, 'Suprema', 'BioEntry W2', 'SP20240102', true),
('BIO003', 'Mesin Absen Toko Yogyakarta', 'Yogyakarta - Toko Malioboro', '192.168.3.100', 4370, 'ZKTeco', 'K40', 'ZK20240103', true),
('BIO004', 'Mesin Absen Toko Surabaya', 'Surabaya - Toko Pahlawan', '192.168.4.100', 4370, 'Anviz', 'M5 Pro', 'AN20240104', true),
('BIO005', 'Mesin Absen Kantor Bandung', 'Bandung - Kantor Cabang', '192.168.5.100', 4370, 'ZKTeco', 'F22', 'ZK20240105', true),
('BIO006', 'Mesin Absen Toko Semarang', 'Semarang - Toko Pemuda', '192.168.6.100', 4370, 'Suprema', 'BioStation L2', 'SP20240106', true),
('BIO007', 'Mesin Absen Toko Medan', 'Medan - Toko Gajah Mada', '192.168.7.100', 4370, 'ZKTeco', 'F18', 'ZK20240107', true),
('BIO008', 'Mesin Absen Security Gate', 'Jakarta - Pintu Masuk Utama', '192.168.1.101', 4370, 'Hikvision', 'DS-K1T606M', 'HK20240108', true),
('BIO009', 'Mesin Absen Kantor Makassar', 'Makassar - Kantor Cabang', '192.168.8.100', 4370, 'Anviz', 'VF30 Pro', 'AN20240109', true),
('BIO010', 'Mesin Absen Backup Jakarta', 'Jakarta - Kantor Pusat Lantai 2', '192.168.1.102', 4370, 'ZKTeco', 'F22', 'ZK20240110', false);