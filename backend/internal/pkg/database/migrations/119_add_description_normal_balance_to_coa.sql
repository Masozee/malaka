-- +goose Up
-- Add description and normal_balance columns to chart_of_accounts
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS normal_balance VARCHAR(10) DEFAULT 'DEBIT';

-- Set normal_balance based on account_type
UPDATE chart_of_accounts SET normal_balance = 'DEBIT' WHERE account_type IN ('ASSET', 'EXPENSE');
UPDATE chart_of_accounts SET normal_balance = 'CREDIT' WHERE account_type IN ('LIABILITY', 'EQUITY', 'REVENUE');

-- Add descriptions for all accounts
-- Root Level Accounts
UPDATE chart_of_accounts SET description = 'Seluruh harta dan aset milik perusahaan' WHERE account_code = '1000';
UPDATE chart_of_accounts SET description = 'Seluruh kewajiban dan utang perusahaan' WHERE account_code = '2000';
UPDATE chart_of_accounts SET description = 'Modal dan ekuitas pemilik perusahaan' WHERE account_code = '3000';
UPDATE chart_of_accounts SET description = 'Seluruh pendapatan dan penerimaan perusahaan' WHERE account_code = '4000';
UPDATE chart_of_accounts SET description = 'Seluruh biaya dan pengeluaran operasional perusahaan' WHERE account_code = '5000';

-- Asset Sub-Accounts (Level 2)
UPDATE chart_of_accounts SET description = 'Kas tunai dan saldo rekening bank perusahaan' WHERE account_code = '1100';
UPDATE chart_of_accounts SET description = 'Tagihan yang belum diterima dari pelanggan dan pihak lain' WHERE account_code = '1200';
UPDATE chart_of_accounts SET description = 'Stok barang dagangan dan bahan baku di gudang' WHERE account_code = '1300';
UPDATE chart_of_accounts SET description = 'Aset berwujud jangka panjang milik perusahaan' WHERE account_code = '1400';

-- Liability Sub-Accounts (Level 2)
UPDATE chart_of_accounts SET description = 'Utang yang jatuh tempo dalam satu tahun' WHERE account_code = '2100';
UPDATE chart_of_accounts SET description = 'Utang yang jatuh tempo lebih dari satu tahun' WHERE account_code = '2200';
UPDATE chart_of_accounts SET description = 'Kewajiban lain yang tidak termasuk kategori utama' WHERE account_code = '2300';

-- Equity Sub-Accounts (Level 2)
UPDATE chart_of_accounts SET description = 'Modal yang disetor oleh pemegang saham' WHERE account_code = '3100';
UPDATE chart_of_accounts SET description = 'Akumulasi laba yang tidak dibagikan sebagai dividen' WHERE account_code = '3200';

-- Revenue Sub-Accounts (Level 2)
UPDATE chart_of_accounts SET description = 'Pendapatan dari penjualan produk utama perusahaan' WHERE account_code = '4100';
UPDATE chart_of_accounts SET description = 'Pendapatan dari sumber selain penjualan utama' WHERE account_code = '4200';

-- Expense Sub-Accounts (Level 2)
UPDATE chart_of_accounts SET description = 'Biaya langsung yang terkait dengan produk yang dijual' WHERE account_code = '5100';
UPDATE chart_of_accounts SET description = 'Biaya operasional harian perusahaan' WHERE account_code = '5200';
UPDATE chart_of_accounts SET description = 'Biaya administrasi dan umum perusahaan' WHERE account_code = '5300';

-- Detail Level Accounts (Level 3)
-- Cash and Bank
UPDATE chart_of_accounts SET description = 'Uang tunai yang tersedia di brankas perusahaan' WHERE account_code = '1101';
UPDATE chart_of_accounts SET description = 'Saldo rekening giro dan tabungan di Bank BCA' WHERE account_code = '1102';
UPDATE chart_of_accounts SET description = 'Saldo rekening giro dan tabungan di Bank Mandiri' WHERE account_code = '1103';

-- Receivables
UPDATE chart_of_accounts SET description = 'Piutang dari penjualan barang kepada pelanggan' WHERE account_code = '1201';
UPDATE chart_of_accounts SET description = 'Pinjaman dan uang muka yang diberikan kepada karyawan' WHERE account_code = '1202';

-- Inventory
UPDATE chart_of_accounts SET description = 'Stok barang jadi yang siap dijual kepada pelanggan' WHERE account_code = '1301';
UPDATE chart_of_accounts SET description = 'Stok bahan baku untuk proses produksi sepatu' WHERE account_code = '1302';

-- Fixed Assets
UPDATE chart_of_accounts SET description = 'Tanah milik perusahaan untuk operasional dan investasi' WHERE account_code = '1401';
UPDATE chart_of_accounts SET description = 'Gedung kantor, pabrik, dan gudang milik perusahaan' WHERE account_code = '1402';
UPDATE chart_of_accounts SET description = 'Kendaraan operasional dan pengiriman perusahaan' WHERE account_code = '1403';
UPDATE chart_of_accounts SET description = 'Peralatan kantor seperti komputer, meja, dan perabotan' WHERE account_code = '1404';

-- Current Liabilities
UPDATE chart_of_accounts SET description = 'Utang kepada pemasok atas pembelian barang dan jasa' WHERE account_code = '2101';
UPDATE chart_of_accounts SET description = 'Kewajiban pajak yang harus dibayar ke pemerintah' WHERE account_code = '2102';

-- Long-term Liabilities
UPDATE chart_of_accounts SET description = 'Pinjaman dari bank dengan jangka waktu lebih dari satu tahun' WHERE account_code = '2201';

-- Other Liabilities
UPDATE chart_of_accounts SET description = 'Gaji dan upah karyawan yang belum dibayarkan' WHERE account_code = '2301';
UPDATE chart_of_accounts SET description = 'Kewajiban lain yang belum terklasifikasi' WHERE account_code = '2302';

-- Capital
UPDATE chart_of_accounts SET description = 'Nilai nominal saham yang diterbitkan dan disetor penuh' WHERE account_code = '3101';
UPDATE chart_of_accounts SET description = 'Selisih lebih antara harga jual dan nilai nominal saham' WHERE account_code = '3102';

-- Retained Earnings
UPDATE chart_of_accounts SET description = 'Laba bersih yang dihasilkan pada tahun buku berjalan' WHERE account_code = '3201';
UPDATE chart_of_accounts SET description = 'Akumulasi laba dari tahun-tahun sebelumnya' WHERE account_code = '3202';

-- Sales Revenue
UPDATE chart_of_accounts SET description = 'Pendapatan dari penjualan sepatu dan produk utama' WHERE account_code = '4101';
UPDATE chart_of_accounts SET description = 'Potongan harga yang diberikan kepada pelanggan' WHERE account_code = '4102';
UPDATE chart_of_accounts SET description = 'Pengembalian barang dari pelanggan' WHERE account_code = '4103';

-- Other Revenue
UPDATE chart_of_accounts SET description = 'Pendapatan bunga dari simpanan bank dan deposito' WHERE account_code = '4201';
UPDATE chart_of_accounts SET description = 'Pendapatan dari sumber lain di luar aktivitas utama' WHERE account_code = '4202';

-- COGS
UPDATE chart_of_accounts SET description = 'Harga pokok penjualan untuk produk sepatu' WHERE account_code = '5101';
UPDATE chart_of_accounts SET description = 'Harga pokok penjualan untuk produk sandal' WHERE account_code = '5102';

-- Operating Expenses
UPDATE chart_of_accounts SET description = 'Gaji pokok, tunjangan, dan bonus untuk seluruh karyawan' WHERE account_code = '5201';
UPDATE chart_of_accounts SET description = 'Biaya sewa gedung, toko, dan gudang' WHERE account_code = '5202';
UPDATE chart_of_accounts SET description = 'Biaya listrik, air, dan utilitas lainnya' WHERE account_code = '5203';
UPDATE chart_of_accounts SET description = 'Biaya transportasi dan pengiriman barang' WHERE account_code = '5204';
UPDATE chart_of_accounts SET description = 'Biaya telepon, internet, dan komunikasi' WHERE account_code = '5205';

-- Administrative Expenses
UPDATE chart_of_accounts SET description = 'Biaya alat tulis kantor dan perlengkapan administrasi' WHERE account_code = '5301';
UPDATE chart_of_accounts SET description = 'Beban penyusutan aset tetap perusahaan' WHERE account_code = '5302';

-- +goose Down
ALTER TABLE chart_of_accounts DROP COLUMN IF EXISTS description;
ALTER TABLE chart_of_accounts DROP COLUMN IF EXISTS normal_balance;
