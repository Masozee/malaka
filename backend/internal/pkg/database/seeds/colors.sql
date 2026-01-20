-- Indonesian Shoe Colors Seed Data
INSERT INTO colors (name, hex_code, code, description, status) VALUES
('Hitam', '#000000', 'BLK', 'Warna hitam klasik', 'active'),
('Coklat Tua', '#8B4513', 'DBR', 'Warna coklat tua/saddle brown', 'active'),
('Putih', '#FFFFFF', 'WHT', 'Warna putih bersih', 'active'),
('Abu-abu', '#808080', 'GRY', 'Warna abu-abu netral', 'active'),
('Coklat', '#654321', 'BRN', 'Warna coklat standar', 'active'),
('Krem', '#F5F5DC', 'CRM', 'Warna krem/beige', 'active'),
('Merah Marun', '#800000', 'MRN', 'Warna merah marun', 'active'),
('Biru Navy', '#191970', 'NVY', 'Warna biru navy', 'active'),
('Hijau Tua', '#006400', 'DGR', 'Warna hijau tua', 'active'),
('Tan', '#D2691E', 'TAN', 'Warna tan/coklat muda', 'active'),
('Gading', '#FFF8DC', 'IVR', 'Warna gading/ivory', 'active'),
('Merah Bata', '#B22222', 'BRD', 'Warna merah bata', 'active'),
('Biru Tua', '#000080', 'DBL', 'Warna biru tua', 'active'),
('Charcoal', '#1C1C1C', 'CHR', 'Warna charcoal/hitam keabu-abuan', 'active'),
('Sienna', '#A0522D', 'SNA', 'Warna sienna/coklat kemerahan', 'active'),
('Champagne', '#FFFDD0', 'CHP', 'Warna champagne', 'active'),
('Slate', '#2F4F4F', 'SLT', 'Warna slate/abu-abu gelap', 'active'),
('Espresso', '#3C2414', 'ESP', 'Warna espresso/coklat sangat tua', 'active'),
('Gold', '#F3E5AB', 'GLD', 'Warna emas/gold', 'active'),
('Charcoal Blue', '#36454F', 'CBL', 'Warna charcoal blue', 'active')
ON CONFLICT DO NOTHING;
