-- Indonesian Companies Seed Data
INSERT INTO companies (name, address, email, phone, status) VALUES
('PT Sepatu Nusantara', 'Jl. Sudirman No. 123, Jakarta Pusat 10270', 'info@sepatunusantara.co.id', '021-5551234', 'active'),
('CV Dagang Sepatu', 'Jl. Malioboro No. 456, Yogyakarta 55213', 'info@dagangsepatu.co.id', '0274-555678', 'active'),
('PT Perdagangan Maju', 'Jl. Pahlawan No. 789, Surabaya 60119', 'info@perdagangmaju.co.id', '031-5559012', 'active'),
('PT Industri Kulit', 'Jl. Ahmad Yani No. 321, Bandung 40123', 'info@industrikulit.co.id', '022-5553456', 'active'),
('CV Sepatu Berkah', 'Jl. Diponegoro No. 654, Semarang 50134', 'info@sepatuberkah.co.id', '024-5557890', 'active'),
('Koperasi Pengrajin Sepatu', 'Jl. Pemuda No. 987, Solo 57123', 'info@koperasipengrajin.co.id', '0271-5551234', 'active'),
('PT Footwear Nusantara', 'Jl. Gatot Subroto No. 147, Jakarta Selatan 12930', 'info@footwearnusantara.co.id', '021-5555678', 'active'),
('UD Sepatu Tradisional Bali', 'Jl. Hayam Wuruk No. 258, Denpasar 80113', 'info@sepatutradisional.co.id', '0361-5559012', 'active'),
('PT Manufaktur Modern', 'Jl. MT Haryono No. 369, Medan 20123', 'info@manufakturmodern.co.id', '061-5553456', 'active'),
('PT Ekspor Sepatu Indonesia', 'Jl. Thamrin No. 741, Jakarta Pusat 10340', 'info@eksporsepatu.co.id', '021-5557890', 'active'),
('CV Kerajinan Kulit Malang', 'Jl. Malang No. 852, Malang 65145', 'info@kerajinankulit.co.id', '0341-5551234', 'active'),
('PT Sepatu Casual Makassar', 'Jl. Veteran No. 963, Makassar 90123', 'info@sepatucasual.co.id', '0411-5555678', 'active'),
('PT Distribusi Nasional', 'Jl. Imam Bonjol No. 159, Palembang 30118', 'info@distribusinasional.co.id', '0711-5559012', 'active'),
('Koperasi Sepatu Rakyat', 'Jl. Kartini No. 753, Cirebon 45123', 'info@sepaturakyat.co.id', '0231-5553456', 'active'),
('CV Sepatu Handmade Jogja', 'Jl. Gajah Mada No. 486, Yogyakarta 55166', 'info@sepatuhandmade.co.id', '0274-5557890', 'active')
ON CONFLICT DO NOTHING;
