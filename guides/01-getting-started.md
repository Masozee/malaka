# 🚀 **Panduan Memulai Cepat - Malaka ERP**

Selamat datang! Panduan ini akan membantu Anda memulai menggunakan sistem ERP Malaka dalam waktu singkat.

## 📋 **Persiapan Sebelum Memulai**

### ✅ **Persyaratan Sistem**
- **Browser**: Chrome (recommended), Firefox, Safari, atau Edge versi terbaru
- **Koneksi Internet**: Stabil untuk akses real-time
- **Resolution**: Minimum 1024x768 pixels
- **JavaScript**: Harus diaktifkan

### 🔑 **Informasi Login**
Pastikan Anda memiliki:
- **URL Aplikasi**: `http://localhost:3000` (development) atau URL production
- **Username**: Diberikan oleh administrator
- **Password**: Password sementara (wajib diganti saat login pertama)
- **Company Code**: Kode perusahaan Anda

---

## 🎯 **Langkah 1: Login Pertama Kali**

### 1. **Akses Aplikasi**
1. Buka browser dan kunjungi URL aplikasi
2. Anda akan melihat halaman login Malaka ERP

### 2. **Proses Login**
```
┌─────────────────────────────────┐
│         Malaka ERP Login        │
├─────────────────────────────────┤
│ Username: [admin@company.com]   │
│ Password: [**************]      │
│ Company:  [PT Sepatu Nusantara] │
│                                 │
│         [🔐 LOGIN]              │
└─────────────────────────────────┘
```

3. **Input Credentials**:
   - **Username**: Masukkan email atau username
   - **Password**: Password yang diberikan admin
   - **Company**: Pilih perusahaan dari dropdown

4. **Klik Login**

### 3. **Ganti Password (Wajib)**
Jika login pertama kali, sistem akan meminta mengganti password:
- **Password Baru**: Minimum 8 karakter, kombinasi huruf, angka, dan simbol
- **Konfirmasi**: Ulangi password baru
- **Simpan**: Klik "Update Password"

---

## 🏠 **Langkah 2: Mengenal Dashboard Utama**

Setelah login berhasil, Anda akan melihat dashboard utama:

### 📊 **Area Dashboard**
```
┌─ Header ─────────────────────────────────────────────────┐
│ [🏠 Malaka ERP]    [🔍 Search]    [🔔]  [👤 Profile] │
├─────────────────────────────────────────────────────────┤
│ [📈 Dashboard] [📦 Inventory] [💰 Sales] [👥 HR] ... │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 KPI Cards:                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Sales│ │Stock│ │Order│ │Cash │ │Profit│              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                         │
│  📈 Charts & Analytics                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐      │
│  │   Sales Trend       │ │  Inventory Status   │      │
│  │                     │ │                     │      │
│  └─────────────────────┘ └─────────────────────┘      │
│                                                         │
│  📋 Recent Activities & Quick Actions                  │
└─────────────────────────────────────────────────────────┘
```

### 🧭 **Komponen Utama**

1. **Header Bar**:
   - Logo dan nama aplikasi
   - Search global
   - Notifikasi
   - Profile menu

2. **Navigation Menu**:
   - Dashboard
   - Master Data
   - Inventory
   - Sales
   - Finance
   - HR
   - Reports

3. **KPI Cards**:
   - Total Sales hari ini
   - Stock Level
   - Pending Orders
   - Cash Position
   - Profit Margin

4. **Charts**:
   - Sales trend
   - Inventory status
   - Top products

5. **Activity Feed**:
   - Recent transactions
   - System notifications
   - Quick actions

---

## 🧭 **Langkah 3: Navigasi Dasar**

### 📱 **Menu Utama**
Klik pada menu di navigation bar:

#### 📊 **Dashboard**
- Overview bisnis real-time
- KPI monitoring
- Quick actions

#### 👥 **Master Data**
```
Master Data → Companies     (Data perusahaan)
           → Users         (Manajemen user)
           → Articles      (Produk sepatu)
           → Customers     (Database pelanggan)
           → Suppliers     (Data supplier)
           → Warehouses    (Lokasi gudang)
```

#### 📦 **Inventory**
```
Inventory → Purchase Orders  (PO ke supplier)
        → Goods Receipt    (Penerimaan barang)
        → Stock Control   (Kontrol stok)
        → Stock Transfer  (Transfer barang)
        → Adjustments     (Penyesuaian stok)
```

#### 💰 **Sales**
```
Sales → Sales Orders       (Order pelanggan)
      → POS Transactions  (Point of Sale)
      → Invoicing        (Faktur penjualan)
      → Reports          (Laporan penjualan)
```

### 🔍 **Fitur Search**
Gunakan search box di header untuk pencarian cepat:
- **Produk**: Cari berdasarkan kode atau nama
- **Customer**: Cari pelanggan
- **Transaksi**: Cari berdasarkan nomor order
- **Dokumen**: Cari invoice, PO, dll

### 👤 **Profile Menu**
Klik avatar di pojok kanan atas:
- **My Profile**: Edit profil personal
- **Settings**: Pengaturan user
- **Change Password**: Ganti password
- **Logout**: Keluar dari sistem

---

## ⚡ **Langkah 4: Quick Start Actions**

### 🎯 **Aksi Prioritas Pertama**

#### 1. **Setup Data Perusahaan** (5 menit)
```
Master Data → Companies → [+ Add Company]
```
- Nama perusahaan
- Alamat lengkap
- Contact info
- Logo perusahaan

#### 2. **Tambah User Tim** (10 menit)
```
Master Data → Users → [+ Add User]
```
- Email user
- Role/jabatan
- Department
- Permissions

#### 3. **Input Produk Utama** (15 menit)
```
Master Data → Articles → [+ Add Article]
```
- Kode produk
- Nama sepatu
- Kategori
- Harga
- Foto produk

#### 4. **Setup Supplier** (10 menit)
```
Master Data → Suppliers → [+ Add Supplier]
```
- Nama supplier
- Contact person
- Payment terms
- Lead time

#### 5. **Konfigurasi Gudang** (5 menit)
```
Master Data → Warehouses → [+ Add Warehouse]
```
- Nama gudang
- Lokasi
- Kapasitas
- PIC

### 🚀 **Transaksi Pertama**

#### 1. **Buat Purchase Order**
```
Inventory → Purchase Orders → [+ New PO]
```
- Pilih supplier
- Tambah items
- Set delivery date
- Submit untuk approval

#### 2. **Input Penerimaan Barang**
```
Inventory → Goods Receipt → [+ New Receipt]
```
- Pilih PO reference
- Scan/input items received
- Quality check
- Update stock

#### 3. **Proses Sales Order**
```
Sales → Sales Orders → [+ New Order]
```
- Pilih customer
- Tambah produk
- Set pricing
- Generate invoice

---

## 📚 **Langkah 5: Learning Path**

### 📅 **Minggu 1: Foundation**
- [x] Login dan dashboard overview
- [x] Setup data master dasar
- [x] Navigasi dan fitur search
- [ ] Input transaksi pertama

### 📅 **Minggu 2: Operations**
- [ ] Purchase order workflow
- [ ] Inventory management
- [ ] Sales process
- [ ] Basic reporting

### 📅 **Minggu 3: Advanced**
- [ ] Financial integration
- [ ] HR management
- [ ] Advanced reporting
- [ ] System optimization

### 📅 **Minggu 4: Mastery**
- [ ] Workflow automation
- [ ] Custom reports
- [ ] User training
- [ ] Performance optimization

---

## 💡 **Tips & Best Practices**

### ✅ **Do's**
1. **Backup Data**: Lakukan backup sebelum input data besar
2. **Test Environment**: Coba fitur di test environment dulu
3. **Consistent Naming**: Gunakan naming convention yang konsisten
4. **Regular Updates**: Update data secara berkala
5. **Training Team**: Pastikan team terlatih sebelum go-live

### ❌ **Don'ts**
1. **Jangan Skip Training**: Jangan langsung production tanpa training
2. **Jangan Input Sembarangan**: Validasi data sebelum input
3. **Jangan Lupakan Backup**: Selalu backup sebelum major changes
4. **Jangan Pakai Data Palsu**: Gunakan data real atau realistic
5. **Jangan Skip Documentation**: Dokumentasikan SOP perusahaan

### 🔧 **Shortcuts Keyboard**
- **Ctrl + F**: Search dalam halaman
- **Ctrl + N**: New record (context-sensitive)
- **Ctrl + S**: Save current form
- **Ctrl + E**: Edit mode
- **Esc**: Cancel/Close dialog

---

## 🆘 **Troubleshooting Awal**

### 🚨 **Masalah Login**
**Problem**: Tidak bisa login
**Solution**:
1. Check username/password
2. Verify company selection
3. Clear browser cache
4. Contact admin untuk reset password

### 🚨 **Halaman Lambat**
**Problem**: Loading lama
**Solution**:
1. Check koneksi internet
2. Close tabs lain
3. Refresh halaman (F5)
4. Clear browser cache

### 🚨 **Data Tidak Muncul**
**Problem**: Data kosong/tidak tampil
**Solution**:
1. Check filter settings
2. Verify permissions
3. Refresh page
4. Contact support jika masih error

---

## 📞 **Bantuan Selanjutnya**

### 📖 **Dokumentasi Lanjutan**
- [Navigasi Detail](./02-navigation.md)
- [Setup Awal Lengkap](./03-initial-setup.md)
- [Master Data Guide](./04-master-data/)

### 💬 **Support Channels**
- **Chat Support**: Available 09:00-17:00 WIB
- **Email**: support@malaka-erp.com
- **Phone**: +62-21-XXXX-XXXX
- **WhatsApp**: +62-8XX-XXXX-XXXX

### 🎓 **Training Resources**
- **Video Tutorials**: [YouTube Channel](link)
- **Webinar Schedule**: [Training Calendar](link)
- **User Manual PDF**: [Download](link)

---

**Selamat! Anda telah menyelesaikan setup awal Malaka ERP. Lanjutkan ke panduan berikutnya untuk memaksimalkan penggunaan sistem.** 🎉