# 👟 **Manajemen Data Artikel/Produk Sepatu**

Panduan lengkap untuk mengelola data produk sepatu dalam sistem Malaka ERP.

## 📋 **Overview**

Modul Articles adalah jantung dari sistem ERP untuk bisnis sepatu. Di sini Anda mengelola:
- **Master produk sepatu** dengan semua variannya
- **Klasifikasi** berdasarkan jenis, gender, usia
- **Warna, model, dan ukuran** 
- **Harga dan barcode**
- **Foto produk** dan gallery
- **Relasi dengan supplier**

---

## 🎯 **Akses Menu Articles**

### 📱 **Navigasi**
```
Dashboard → Master Data → Articles
```

### 🖥️ **Tampilan Halaman**
```
┌─ Header ───────────────────────────────────────────────┐
│ 👟 Articles Management                    [+ Add New] │
├───────────────────────────────────────────────────────┤
│ 🔍 [Search products...]  [🎚️ Filters]  [📥 Import] │
├───────────────────────────────────────────────────────┤
│ View: [📋 Cards] [📊 Table]    Total: 1,247 products │
├───────────────────────────────────────────────────────┤
│                                                       │
│ Product Cards/Table View                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│ │ [Photo] │ │ [Photo] │ │ [Photo] │                  │
│ │ SEP001  │ │ SEP002  │ │ SEP003  │                  │
│ │ Pantofel│ │ Sneakers│ │ Boots   │                  │
│ │ Rp450K  │ │ Rp320K  │ │ Rp580K  │                  │
│ └─────────┘ └─────────┘ └─────────┘                  │
└───────────────────────────────────────────────────────┘
```

---

## ➕ **Menambah Artikel Baru**

### 📝 **Langkah-langkah**

#### 1. **Klik [+ Add New Article]**
Akan muncul form input artikel baru

#### 2. **Isi Informasi Dasar**
```
┌─ Basic Information ─────────────────────────────┐
│                                                 │
│ Article Code*: [SEP004    ] (Auto-generated)   │
│ Article Name*: [Sepatu Sport Casual Pria]      │
│ Description:   [Sepatu olahraga casual untuk   │
│                 pria, bahan canvas dengan sol  │
│                 karet anti-slip]                │
│                                                 │
│ Status: [●] Active  [○] Inactive               │
└─────────────────────────────────────────────────┘
```

#### 3. **Pilih Klasifikasi & Kategori**
```
┌─ Classification ────────────────────────────────┐
│                                                 │
│ Classification*: [🏃 Sport Shoes        ▼]     │
│ Gender:         [👨 Pria                ▼]     │
│ Age Group:      [👨‍💼 Dewasa              ▼]     │
│ Season:         [☀️ All Season          ▼]     │
│ Material:       [👟 Canvas + Rubber     ▼]     │
└─────────────────────────────────────────────────┘
```

#### 4. **Setup Varian Produk**
```
┌─ Product Variants ──────────────────────────────┐
│                                                 │
│ Color*:  [🔴 Merah] [🔵 Biru] [⚫ Hitam]      │
│          [+ Add Color]                          │
│                                                 │
│ Model*:  [Sport Casual SC-01] [+ Add Model]    │
│                                                 │
│ Sizes*:  [38] [39] [40] [41] [42] [43] [44]    │
│          [+ Add Size]                           │
└─────────────────────────────────────────────────┘
```

#### 5. **Input Harga & Supplier**
```
┌─ Pricing & Supplier ────────────────────────────┐
│                                                 │
│ Supplier*:      [PT Sepatu Indonesia    ▼]     │
│ Purchase Price: [Rp 180,000]                   │
│ Selling Price*: [Rp 320,000]                   │
│ Margin:         [77.8%] (Auto-calculated)      │
│                                                 │
│ Currency:       [IDR ▼]                         │
│ Price Valid:    [01/08/2025] to [31/12/2025]   │
└─────────────────────────────────────────────────┘
```

#### 6. **Generate/Input Barcode**
```
┌─ Barcode & SKU ─────────────────────────────────┐
│                                                 │
│ SKU Pattern: [SEP004-{COLOR}-{SIZE}]            │
│                                                 │
│ Generated SKUs:                                 │
│ • SEP004-RED-38  → [||||||||||||] (Barcode)   │
│ • SEP004-RED-39  → [||||||||||||] (Barcode)   │
│ • SEP004-BLU-38  → [||||||||||||] (Barcode)   │
│                                                 │
│ [🖨️ Print Barcodes] [📱 Generate QR]          │
└─────────────────────────────────────────────────┘
```

#### 7. **Upload Foto Produk**
```
┌─ Product Images ────────────────────────────────┐
│                                                 │
│ Main Image*:     [📷 Upload] [Preview]          │
│                  ┌─────────┐                    │
│                  │ [Photo] │                    │
│                  │ Preview │                    │
│                  └─────────┘                    │
│                                                 │
│ Gallery Images:  [📷] [📷] [📷] [📷] [+ Add]   │
│                                                 │
│ Image Guidelines:                               │
│ • Format: JPG, PNG                             │
│ • Size: Max 2MB per image                      │
│ • Resolution: Minimum 800x600                  │
│ • Background: White/transparent preferred      │
└─────────────────────────────────────────────────┘
```

#### 8. **Simpan Artikel**
```
[💾 Save as Draft] [✅ Save & Activate] [❌ Cancel]
```

---

## 🔍 **Mencari & Filter Artikel**

### 🔎 **Search Function**
Ketik di search box untuk mencari berdasarkan:
- **Kode artikel**: SEP001, BOOT045
- **Nama produk**: "sepatu sport", "pantofel"
- **Brand/Model**: "Nike Air", "Adidas"
- **Supplier**: "PT Sepatu Indonesia"

### 🎚️ **Filter Options**
```
┌─ Filters ─────────────────────────────────┐
│                                           │
│ Classification: [All ▼] [Sport ▼]        │
│ Gender:        [All ▼] [Pria ▼]          │
│ Color:         [All ▼] [Merah ▼]         │
│ Size Range:    [38] to [44]              │
│ Price Range:   [100K] to [1M]            │
│ Supplier:      [All ▼] [PT Indonesia ▼]  │
│ Status:        [All ▼] [Active ▼]        │
│                                           │
│ [🔍 Apply Filters] [🧹 Clear All]        │
└───────────────────────────────────────────┘
```

### 📊 **Sorting Options**
- **Newest First**: Artikel terbaru dahulu
- **Code A-Z**: Berdasarkan kode artikel
- **Name A-Z**: Berdasarkan nama produk
- **Price Low-High**: Harga terendah dulu
- **Best Seller**: Berdasarkan volume penjualan

---

## ✏️ **Edit & Update Artikel**

### 📝 **Cara Edit**
1. **Klik artikel** di list atau card view
2. **Klik [✏️ Edit]** di detail page
3. **Modify fields** yang ingin diubah
4. **[💾 Save Changes]**

### 🔄 **Bulk Actions**
Pilih multiple artikel untuk:
```
☑️ SEP001 - Pantofel Kulit Hitam
☑️ SEP002 - Sneakers Casual Putih  
☑️ SEP003 - Boots Kerja Coklat

Actions: [💰 Update Prices] [🏷️ Change Status] 
         [📦 Move Category] [🗑️ Delete Selected]
```

### 📈 **Price Management**
```
┌─ Bulk Price Update ──────────────────────────┐
│                                              │
│ Selected Items: 3 products                  │
│                                              │
│ Update Method:                               │
│ [○] Fixed Amount    [●] Percentage          │
│ [○] New Price       [○] Cost Plus Margin    │
│                                              │
│ Increase: [10] %                            │
│                                              │
│ Preview:                                     │
│ • SEP001: Rp450K → Rp495K                  │
│ • SEP002: Rp320K → Rp352K                  │
│ • SEP003: Rp580K → Rp638K                  │
│                                              │
│ [💰 Apply Changes] [❌ Cancel]              │
└──────────────────────────────────────────────┘
```

---

## 📸 **Manajemen Foto Produk**

### 🖼️ **Gallery Management**
```
┌─ Photo Gallery - SEP001 Pantofel ────────────┐
│                                               │
│ Main Image:                                   │
│ ┌─────────────┐                              │
│ │   [PHOTO]   │ [🔄 Replace] [🗑️ Delete]     │
│ │   Front     │                              │
│ │   View      │                              │
│ └─────────────┘                              │
│                                               │
│ Additional Images:                            │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ [+ Add]      │
│ │Side │ │Back │ │Sole │ │Box  │              │
│ │View │ │View │ │     │ │     │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                               │
│ [📱 Generate QR Code] [🔗 Copy Image URLs]   │
└───────────────────────────────────────────────┘
```

### 📱 **QR Code untuk Produk**
Setiap artikel dapat memiliki QR code untuk:
- **Quick access** ke detail produk
- **Mobile scanning** di gudang
- **Customer information** di showroom
- **Inventory tracking**

---

## 📊 **Stock Integration**

### 📦 **Stock Information**
Artikel terintegrasi dengan sistem inventory:
```
┌─ Stock Status ────────────────────────────────┐
│                                               │
│ Article: SEP001 - Pantofel Kulit              │
│                                               │
│ ┌─ Per Warehouse ─────────────────────────────┐
│ │ Gudang Utama:    120 pairs                 │
│ │ Gudang Cabang:    45 pairs                 │
│ │ Showroom:         15 pairs                 │
│ │ ────────────────────────────                │
│ │ Total Stock:     180 pairs                 │
│ └─────────────────────────────────────────────┘
│                                               │
│ ┌─ Per Size ──────────────────────────────────┐
│ │ 38: 12  39: 18  40: 25  41: 32             │
│ │ 42: 28  43: 22  44: 15  45: 8              │
│ └─────────────────────────────────────────────┘
│                                               │
│ Safety Stock: 50 pairs                       │
│ Reorder Point: ⚠️ Low stock alert             │
└───────────────────────────────────────────────┘
```

### 🔄 **Auto Stock Alerts**
Sistem otomatis memberikan notifikasi:
- **Low Stock**: Stok dibawah safety level
- **Out of Stock**: Stok habis
- **Overstock**: Stok berlebihan
- **Slow Moving**: Produk tidak laku

---

## 📈 **Analytics & Reports**

### 📊 **Product Performance**
```
┌─ Article Analytics ───────────────────────────┐
│                                               │
│ Article: SEP001 - Pantofel Kulit              │
│ Period: Last 30 days                          │
│                                               │
│ 📈 Sales Metrics:                            │
│ • Units Sold: 45 pairs                       │
│ • Revenue: Rp 20,250,000                     │
│ • Avg Sale Price: Rp 450,000                 │
│ • Profit Margin: 60%                         │
│                                               │
│ 📦 Inventory Metrics:                        │
│ • Turnover Rate: 8.5x annually               │
│ • Days in Stock: 43 days                     │
│ • Fill Rate: 98%                             │
│                                               │
│ 🎯 Customer Metrics:                         │
│ • Repeat Purchase: 35%                       │
│ • Return Rate: 2%                            │
│ • Satisfaction: 4.5/5                        │
└───────────────────────────────────────────────┘
```

### 📋 **Standard Reports**
1. **Product Catalog**: Daftar lengkap semua artikel
2. **Price List**: Harga terkini semua produk
3. **Stock Report**: Status stok per artikel
4. **Sales Analysis**: Performa penjualan per produk
5. **Slow Moving**: Produk dengan penjualan lambat
6. **Profitability**: Analisis margin per artikel

---

## 🔧 **Advanced Features**

### 🏷️ **Product Variants Matrix**
Untuk produk dengan banyak varian:
```
┌─ Variant Matrix: SEP001 Pantofel ────────────┐
│                                               │
│       │ 38│ 39│ 40│ 41│ 42│ 43│ 44│ Total   │
│ ──────┼───┼───┼───┼───┼───┼───┼───┼─────── │
│ Hitam │ 5 │ 8 │12 │15 │12 │ 8 │ 3 │  63    │
│ Coklat│ 3 │ 6 │10 │12 │10 │ 6 │ 2 │  49    │
│ Brown │ 2 │ 4 │ 8 │10 │ 8 │ 4 │ 1 │  37    │
│ ──────┼───┼───┼───┼───┼───┼───┼───┼─────── │
│ Total │10 │18 │30 │37 │30 │18 │ 6 │ 149    │
└───────────────────────────────────────────────┘
```

### 🔄 **Product Lifecycle**
Track status produk dari development hingga discontinue:
- **🧪 Development**: Produk dalam tahap pengembangan
- **✅ Active**: Produk aktif untuk penjualan
- **⚠️ Discontinued**: Produk tidak diproduksi lagi
- **🗄️ Archive**: Produk lama untuk referensi

### 🏆 **Best Practices**

#### ✅ **Do's**
1. **Consistent Naming**: Gunakan naming convention yang jelas
2. **Complete Data**: Isi semua field yang diperlukan
3. **Quality Photos**: Upload foto berkualitas tinggi
4. **Regular Updates**: Update harga dan info secara berkala
5. **Stock Monitoring**: Monitor stock level secara rutin

#### ❌ **Don'ts**
1. **Duplicate Codes**: Jangan gunakan kode artikel yang sama
2. **Incomplete Info**: Jangan skip field penting
3. **Poor Photos**: Hindari foto buram atau tidak jelas
4. **Wrong Categories**: Jangan salah klasifikasi produk
5. **Ignore Alerts**: Jangan abaikan notifikasi stock

---

## 🆘 **Troubleshooting**

### ❗ **Common Issues**

#### 🚫 **Tidak Bisa Upload Foto**
**Symptoms**: Error saat upload gambar
**Solutions**:
1. Check ukuran file (max 2MB)
2. Verify format file (JPG/PNG)
3. Check koneksi internet
4. Clear browser cache

#### 📊 **Stock Data Tidak Update**
**Symptoms**: Stok tidak sesuai transaksi
**Solutions**:
1. Refresh halaman
2. Check inventory transactions
3. Verify warehouse assignments
4. Contact system admin

#### 🔍 **Search Tidak Bekerja**
**Symptoms**: Pencarian tidak menampilkan hasil
**Solutions**:
1. Check spelling
2. Clear search filters
3. Use partial keywords
4. Refresh browser

### 📞 **Contact Support**
Untuk masalah yang tidak terpecahkan:
- **Email**: support@malaka-erp.com
- **WhatsApp**: +62-8XX-XXXX-XXXX
- **Phone**: +62-21-XXXX-XXXX

---

## 📚 **Panduan Selanjutnya**

### 🔗 **Related Guides**
- [Setup Classifications](./classifications.md)
- [Color Management](./colors.md)
- [Size Management](./sizes.md)
- [Supplier Management](./suppliers.md)
- [Inventory Integration](../05-inventory/)

### 🎓 **Training Materials**
- **Video Tutorial**: Article management walkthrough
- **Best Practices Guide**: Industry standards
- **Template Files**: Excel import templates

---

**Artikel yang dikelola dengan baik adalah fondasi kesuksesan bisnis sepatu Anda!** 👟✨