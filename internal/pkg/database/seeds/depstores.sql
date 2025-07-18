-- Development seed data for department stores
-- Uses fictional names to avoid legal issues
INSERT INTO depstores (name, code, address, contact, payment_terms, is_active) VALUES
('Central Plaza Department Store', 'CENT001', 'Jl. Contoh No. 1, Jakarta Pusat', '021-1234-5678', 30, true),
('Modern Shopping Center', 'MODS001', 'Jl. Sample No. 25, Jakarta Selatan', '021-8765-4321', 45, true),
('City Mall Department Store', 'CITY001', 'Jl. Example No. 15, Surabaya', '031-5555-1234', 30, true),
('Grand Plaza Shopping', 'GRAN001', 'Jl. Demo No. 123, Bandung', '022-9999-8888', 60, true),
('Metro Department Store', 'METR001', 'Jl. Test No. 456, Medan', '061-7777-6666', 30, false);