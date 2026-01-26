-- Bulk Indonesian Customer Seed Data (10,000 customers)
-- This script generates realistic Indonesian customer data

-- First, create temporary tables for name components
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_first_names (name VARCHAR(50));
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_last_names (name VARCHAR(50));
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_company_prefixes (prefix VARCHAR(10));
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_company_names (name VARCHAR(100));
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_company_suffixes (suffix VARCHAR(50));
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_cities (city VARCHAR(50), province VARCHAR(50), postal_prefix VARCHAR(5));
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_streets (street VARCHAR(100));

-- Indonesian first names
INSERT INTO tmp_first_names (name) VALUES
('Adi'), ('Agus'), ('Ahmad'), ('Andi'), ('Arief'), ('Bambang'), ('Budi'), ('Dani'), ('Dedi'), ('Deni'),
('Eko'), ('Faisal'), ('Fajar'), ('Gunawan'), ('Hadi'), ('Hendra'), ('Indra'), ('Irwan'), ('Joko'), ('Kurnia'),
('Lukman'), ('Made'), ('Muhammad'), ('Nanda'), ('Putra'), ('Rachmat'), ('Reza'), ('Rizki'), ('Sandi'), ('Surya'),
('Taufik'), ('Udin'), ('Wahyu'), ('Wawan'), ('Yanto'), ('Yoga'), ('Yudi'), ('Zainal'), ('Ari'), ('Bayu'),
('Siti'), ('Dewi'), ('Ratna'), ('Sri'), ('Lina'), ('Maya'), ('Nia'), ('Putri'), ('Rina'), ('Sari'),
('Tina'), ('Wati'), ('Yuni'), ('Ani'), ('Dian'), ('Endang'), ('Fitri'), ('Gita'), ('Hana'), ('Indah'),
('Kartika'), ('Lestari'), ('Mega'), ('Nita'), ('Oktavia'), ('Prima'), ('Qori'), ('Rosa'), ('Sinta'), ('Tri'),
('Umi'), ('Vera'), ('Winda'), ('Yanti'), ('Zahra'), ('Ayu'), ('Bunga'), ('Citra'), ('Dira'), ('Eka');

-- Indonesian last names
INSERT INTO tmp_last_names (name) VALUES
('Santoso'), ('Wijaya'), ('Susanto'), ('Hidayat'), ('Pratama'), ('Saputra'), ('Setiawan'), ('Nugroho'), ('Wibowo'), ('Gunawan'),
('Prasetyo'), ('Suryadi'), ('Hermawan'), ('Hartono'), ('Kusuma'), ('Utama'), ('Putra'), ('Surya'), ('Purnama'), ('Cahyadi'),
('Sutrisno'), ('Sugiarto'), ('Sukardi'), ('Sudarmaji'), ('Wahyudi'), ('Handoko'), ('Siswanto'), ('Haryanto'), ('Budiman'), ('Firmansyah'),
('Kurniawan'), ('Setiadi'), ('Widodo'), ('Sumarno'), ('Sutanto'), ('Rahardjo'), ('Hartawan'), ('Pranoto'), ('Kusumo'), ('Salim'),
('Lestari'), ('Sari'), ('Putri'), ('Dewi'), ('Rahayu'), ('Anggraini'), ('Wulandari'), ('Permata'), ('Maharani'), ('Indrawati');

-- Company prefixes
INSERT INTO tmp_company_prefixes (prefix) VALUES
('PT'), ('CV'), ('UD'), ('Toko'), ('PD'), ('Koperasi'), ('Yayasan'), ('Firma');

-- Company name components
INSERT INTO tmp_company_names (name) VALUES
('Maju'), ('Sejahtera'), ('Berkah'), ('Mandiri'), ('Sukses'), ('Prima'), ('Jaya'), ('Abadi'), ('Sentosa'), ('Makmur'),
('Cahaya'), ('Bintang'), ('Karya'), ('Cipta'), ('Mega'), ('Indo'), ('Nusa'), ('Global'), ('Multi'), ('Eka'),
('Tri'), ('Panca'), ('Sapta'), ('Dasa'), ('Dwi'), ('Satu'), ('Utama'), ('Perdana'), ('Pratama'), ('Unggul'),
('Gemilang'), ('Cemerlang'), ('Terang'), ('Mulia'), ('Agung'), ('Lestari'), ('Hijau'), ('Biru'), ('Merah'), ('Emas'),
('Perak'), ('Permata'), ('Intan'), ('Berlian'), ('Mutiara'), ('Zamrud'), ('Safir'), ('Ruby'), ('Topaz'), ('Jade'),
('Digital'), ('Tekno'), ('Solusi'), ('Inovasi'), ('Kreasi'), ('Media'), ('Data'), ('Info'), ('Net'), ('Web'),
('Logistik'), ('Ekspres'), ('Cargo'), ('Trans'), ('Motor'), ('Mobil'), ('Elektro'), ('Mesin'), ('Baja'), ('Besi');

-- Company suffixes
INSERT INTO tmp_company_suffixes (suffix) VALUES
('Indonesia'), ('Nusantara'), ('Persada'), ('Perkasa'), ('Gemilang'), ('Sejati'), ('Utama'), ('Group'), ('Corp'), ('Trading'),
('Manufacturing'), ('Industries'), ('Solutions'), ('Services'), ('Konsultan'), ('Konstruksi'), ('Properti'), ('Investama'), ('Teknologi'), ('Digital');

-- Indonesian cities with provinces
INSERT INTO tmp_cities (city, province, postal_prefix) VALUES
('Jakarta Pusat', 'DKI Jakarta', '101'), ('Jakarta Selatan', 'DKI Jakarta', '121'), ('Jakarta Barat', 'DKI Jakarta', '111'),
('Jakarta Timur', 'DKI Jakarta', '131'), ('Jakarta Utara', 'DKI Jakarta', '141'), ('Bandung', 'Jawa Barat', '401'),
('Surabaya', 'Jawa Timur', '601'), ('Medan', 'Sumatera Utara', '201'), ('Semarang', 'Jawa Tengah', '502'),
('Makassar', 'Sulawesi Selatan', '901'), ('Palembang', 'Sumatera Selatan', '301'), ('Denpasar', 'Bali', '801'),
('Yogyakarta', 'DI Yogyakarta', '551'), ('Tangerang', 'Banten', '151'), ('Bekasi', 'Jawa Barat', '171'),
('Depok', 'Jawa Barat', '164'), ('Bogor', 'Jawa Barat', '161'), ('Malang', 'Jawa Timur', '651'),
('Solo', 'Jawa Tengah', '571'), ('Balikpapan', 'Kalimantan Timur', '761'), ('Pontianak', 'Kalimantan Barat', '781'),
('Banjarmasin', 'Kalimantan Selatan', '701'), ('Samarinda', 'Kalimantan Timur', '751'), ('Padang', 'Sumatera Barat', '251'),
('Pekanbaru', 'Riau', '281'), ('Batam', 'Kepulauan Riau', '291'), ('Cirebon', 'Jawa Barat', '451'),
('Tasikmalaya', 'Jawa Barat', '461'), ('Sukabumi', 'Jawa Barat', '431'), ('Purwokerto', 'Jawa Tengah', '531');

-- Indonesian street names
INSERT INTO tmp_streets (street) VALUES
('Jl. Sudirman'), ('Jl. Thamrin'), ('Jl. Gatot Subroto'), ('Jl. Ahmad Yani'), ('Jl. Diponegoro'),
('Jl. Gajah Mada'), ('Jl. Hayam Wuruk'), ('Jl. Veteran'), ('Jl. Pemuda'), ('Jl. Pahlawan'),
('Jl. Merdeka'), ('Jl. Asia Afrika'), ('Jl. Malioboro'), ('Jl. Braga'), ('Jl. Dago'),
('Jl. Raya Bogor'), ('Jl. MT Haryono'), ('Jl. HR Rasuna Said'), ('Jl. Kuningan'), ('Jl. Casablanca'),
('Jl. Mangga Dua'), ('Jl. Gunung Sahari'), ('Jl. Pangeran Jayakarta'), ('Jl. Ir. H. Juanda'), ('Jl. Otto Iskandardinata'),
('Jl. Pramuka'), ('Jl. Salemba'), ('Jl. Kramat'), ('Jl. Cikini'), ('Jl. Menteng');

-- Generate 10,000 customers (7,000 corporate + 3,000 personal)
-- Corporate customers (70%)
INSERT INTO customers (name, address, contact, contact_person, email, phone, company_id, status)
SELECT
    -- Company name: prefix + name1 + name2 + suffix
    cp.prefix || ' ' || cn1.name || ' ' || cn2.name || ' ' || cs.suffix AS name,
    -- Address
    st.street || ' No. ' || (1 + floor(random() * 500)::int) || ', ' ||
    ct.city || ', ' || ct.province || ' ' || ct.postal_prefix || LPAD((random() * 99)::int::text, 2, '0') AS address,
    -- Contact (email)
    LOWER(REPLACE(cn1.name || cn2.name, ' ', '')) || '@' ||
    LOWER(REPLACE(cn1.name || cn2.name, ' ', '')) || '.co.id' AS contact,
    -- Contact person
    fn.name || ' ' || ln.name AS contact_person,
    -- Email
    LOWER(fn.name) || '.' || LOWER(ln.name) || '@' ||
    LOWER(REPLACE(cn1.name || cn2.name, ' ', '')) || '.co.id' AS email,
    -- Phone
    CASE floor(random() * 5)::int
        WHEN 0 THEN '021-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 1 THEN '022-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 2 THEN '031-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 3 THEN '024-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        ELSE '061-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
    END AS phone,
    -- Company ID
    (SELECT id FROM companies ORDER BY random() LIMIT 1) AS company_id,
    -- Status
    CASE WHEN random() > 0.1 THEN 'active' ELSE 'inactive' END AS status
FROM generate_series(1, 7000) AS s
CROSS JOIN LATERAL (SELECT prefix FROM tmp_company_prefixes ORDER BY random() LIMIT 1) cp
CROSS JOIN LATERAL (SELECT name FROM tmp_company_names ORDER BY random() LIMIT 1) cn1
CROSS JOIN LATERAL (SELECT name FROM tmp_company_names WHERE name != cn1.name ORDER BY random() LIMIT 1) cn2
CROSS JOIN LATERAL (SELECT suffix FROM tmp_company_suffixes ORDER BY random() LIMIT 1) cs
CROSS JOIN LATERAL (SELECT name FROM tmp_first_names ORDER BY random() LIMIT 1) fn
CROSS JOIN LATERAL (SELECT name FROM tmp_last_names ORDER BY random() LIMIT 1) ln
CROSS JOIN LATERAL (SELECT street FROM tmp_streets ORDER BY random() LIMIT 1) st
CROSS JOIN LATERAL (SELECT city, province, postal_prefix FROM tmp_cities ORDER BY random() LIMIT 1) ct
ON CONFLICT DO NOTHING;

-- Personal customers (30%)
INSERT INTO customers (name, address, contact, contact_person, email, phone, company_id, status)
SELECT
    -- Personal name
    fn.name || ' ' || ln.name AS name,
    -- Address
    st.street || ' No. ' || (1 + floor(random() * 200)::int) || ' RT ' ||
    LPAD((1 + floor(random() * 20)::int)::text, 2, '0') || '/RW ' ||
    LPAD((1 + floor(random() * 10)::int)::text, 2, '0') || ', ' ||
    ct.city || ', ' || ct.province || ' ' || ct.postal_prefix || LPAD((random() * 99)::int::text, 2, '0') AS address,
    -- Contact (email)
    LOWER(fn.name) || '.' || LOWER(ln.name) || (floor(random() * 99)::int)::text || '@' ||
    CASE floor(random() * 4)::int
        WHEN 0 THEN 'gmail.com'
        WHEN 1 THEN 'yahoo.com'
        WHEN 2 THEN 'hotmail.com'
        ELSE 'outlook.com'
    END AS contact,
    -- Contact person (same as name)
    fn.name || ' ' || ln.name AS contact_person,
    -- Email (same as contact)
    LOWER(fn.name) || '.' || LOWER(ln.name) || (floor(random() * 99)::int)::text || '@' ||
    CASE floor(random() * 4)::int
        WHEN 0 THEN 'gmail.com'
        WHEN 1 THEN 'yahoo.com'
        WHEN 2 THEN 'hotmail.com'
        ELSE 'outlook.com'
    END AS email,
    -- Mobile phone
    CASE floor(random() * 10)::int
        WHEN 0 THEN '0811-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 1 THEN '0812-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 2 THEN '0813-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 3 THEN '0814-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 4 THEN '0815-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 5 THEN '0816-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 6 THEN '0817-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 7 THEN '0818-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        WHEN 8 THEN '0821-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
        ELSE '0822-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999)::int::text, 4, '0')
    END AS phone,
    -- Company ID
    (SELECT id FROM companies ORDER BY random() LIMIT 1) AS company_id,
    -- Status
    CASE WHEN random() > 0.05 THEN 'active' ELSE 'inactive' END AS status
FROM generate_series(1, 3000) AS s
CROSS JOIN LATERAL (SELECT name FROM tmp_first_names ORDER BY random() LIMIT 1) fn
CROSS JOIN LATERAL (SELECT name FROM tmp_last_names ORDER BY random() LIMIT 1) ln
CROSS JOIN LATERAL (SELECT street FROM tmp_streets ORDER BY random() LIMIT 1) st
CROSS JOIN LATERAL (SELECT city, province, postal_prefix FROM tmp_cities ORDER BY random() LIMIT 1) ct
ON CONFLICT DO NOTHING;

-- Clean up temporary tables
DROP TABLE IF EXISTS tmp_first_names;
DROP TABLE IF EXISTS tmp_last_names;
DROP TABLE IF EXISTS tmp_company_prefixes;
DROP TABLE IF EXISTS tmp_company_names;
DROP TABLE IF EXISTS tmp_company_suffixes;
DROP TABLE IF EXISTS tmp_cities;
DROP TABLE IF EXISTS tmp_streets;

-- Verify count
SELECT COUNT(*) as total_customers FROM customers;
