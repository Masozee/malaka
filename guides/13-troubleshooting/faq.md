# ❓ **FAQ - Frequently Asked Questions**

Kumpulan pertanyaan yang sering ditanyakan pengguna Malaka ERP beserta solusinya.

---

## 🔐 **Login & Authentication**

### **Q: Lupa password, bagaimana cara reset?**
**A:** 
1. Klik "Forgot Password" di halaman login
2. Masukkan email Anda
3. Check email untuk reset link
4. Atau hubungi admin untuk manual reset

### **Q: Kenapa tidak bisa login padahal password benar?**
**A:** Kemungkinan penyebab:
- **Account locked** setelah 5x salah password
- **Session expired** - clear browser cache
- **Browser tidak compatible** - gunakan Chrome/Firefox terbaru
- **Company code salah** - pastikan pilih company yang benar

### **Q: Apakah bisa login dari multiple device?**
**A:** Ya, bisa login dari beberapa device sekaligus. Namun untuk security, logout otomatis setelah 8 jam idle.

---

## 👥 **User Management**

### **Q: Bagaimana cara menambah user baru?**
**A:** 
1. Login sebagai Admin
2. Go to **Master Data → Users**
3. Klik **[+ Add User]**
4. Isi data lengkap dan assign role
5. User akan dapat email dengan temporary password

### **Q: Apa perbedaan antara role Admin, Manager, dan Operator?**
**A:** 
- **Admin**: Full access, bisa manage user, system settings
- **Manager**: Access to reports, approval workflow, tidak bisa manage user
- **Operator**: Daily operations, input data, tidak bisa approve

### **Q: Bisa mengubah role user yang sudah dibuat?**
**A:** Ya, Admin bisa edit role user kapan saja di menu **Master Data → Users → Edit**.

---

## 📦 **Inventory Management**

### **Q: Stock tidak update setelah input goods receipt, kenapa?**
**A:** Check:
1. **Goods receipt status** - pastikan sudah "Posted"
2. **Warehouse assignment** - pastikan item masuk warehouse yang benar
3. **Article mapping** - pastikan article code sesuai
4. Refresh page atau contact admin jika masih error

### **Q: Bagaimana cara setting reorder point?**
**A:**
1. Go to **Master Data → Articles**
2. Edit artikel yang ingin diset
3. Set **Reorder Point** dan **Maximum Stock**
4. System akan auto-alert jika stock dibawah reorder point

### **Q: Bisa track barang yang sedang dalam perjalanan?**
**A:** Ya, di menu **Inventory → Purchase Orders**, klik PO yang sudah shipped untuk melihat tracking info dari courier.

### **Q: Bagaimana cara handle barang return dari customer?**
**A:**
1. **Sales → Returns → + New Return**
2. Input detail barang yang diretur
3. Pilih reason (defect, wrong size, etc.)
4. Stock akan otomatis bertambah setelah return diprocess

---

## 💰 **Sales & Finance**

### **Q: Invoice otomatis generate setelah sales order?**
**A:** Tidak otomatis. Sales order perlu diprocess dulu:
1. **Sales Order → Process**
2. Generate delivery note
3. Setelah barang delivered, baru **Generate Invoice**

### **Q: Bisa edit harga setelah sales order dibuat?**
**A:** Tergantung status:
- **Draft status**: Bisa edit
- **Confirmed status**: Perlu approval manager
- **Shipped status**: Tidak bisa edit, buat credit note jika perlu adjust

### **Q: Bagaimana cara track pembayaran customer?**
**A:**
1. **Finance → Accounts Receivable**
2. Filter by customer atau date range
3. Status akan show: Outstanding, Partial, Paid
4. Bisa send payment reminder otomatis

### **Q: Cara setup auto-discount untuk customer tertentu?**
**A:**
1. **Master Data → Customers → Edit**
2. Set **Customer Group** (VIP, Regular, etc.)
3. **Sales → Pricing → Customer Group Discount**
4. Set discount percentage per group

---

## 🧮 **Accounting**

### **Q: Journal entry tidak balance, bagaimana fix?**
**A:**
1. Check **Debit** dan **Credit** harus sama
2. Pastikan **Account Code** benar
3. Check **Amount** tidak ada yang negative
4. Jika masih error, save as draft dan contact accounting team

### **Q: Bisa import data dari software accounting lama?**
**A:** Ya, support import format:
- **Excel template** (download dari menu Import)
- **CSV format** dengan mapping fields
- **Zahir/MYOB format** (contact support untuk assistance)

### **Q: Kapan posting period di-close?**
**A:** Default **tanggal 5** setiap bulan untuk bulan sebelumnya. Setelah close, tidak bisa edit transaksi bulan tersebut.

---

## 👨‍💼 **Human Resources**

### **Q: Bagaimana cara input absensi manual?**
**A:**
1. **HR → Attendance**
2. Pilih tanggal dan employee
3. **Manual Entry → Input Time In/Out**
4. Add reason untuk manual entry

### **Q: Payroll auto-calculate overtime?**
**A:** Ya, berdasarkan:
- **Standard working hours**: 8 hours/day
- **Overtime rate**: 1.5x untuk weekday, 2x untuk weekend
- **Holiday rate**: 3x normal rate

### **Q: Bisa generate slip gaji dalam format PDF?**
**A:** Ya, di **HR → Payroll → Generate Payslip** pilih format PDF. Bisa send email langsung ke employee atau download batch.

---

## 🚚 **Shipping & Logistics**

### **Q: Tracking number tidak update, kenapa?**
**A:**
1. **Check dengan courier** - mungkin belum diinput sistem mereka
2. **Refresh tracking** di menu Shipping
3. **Manual update** jika diperlukan
4. Contact courier jika tracking tidak available 24 jam

### **Q: Bisa integr si dengan multiple courier?**
**A:** Ya, saat ini support:
- **JNE, J&T, SiCepat, Pos Indonesia**
- **Same-day delivery**: GoSend, GrabExpress
- **Custom courier** bisa ditambah manual

### **Q: Bagaimana cara split shipment untuk satu order?**
**A:**
1. **Sales → Sales Orders → Edit**
2. **Split Order** button
3. Tentukan items per shipment
4. Generate separate airwaybill untuk each shipment

---

## 📊 **Reports & Analytics**

### **Q: Report loading lama, bagaimana optimize?**
**A:**
1. **Narrow date range** - jangan ambil data lebih dari 3 bulan
2. **Use filters** - filter by specific customer/product
3. **Export to Excel** untuk analysis detail
4. **Run during off-peak hours** (malam hari)

### **Q: Bisa customize report format?**
**A:** 
- **Standard reports**: Bisa adjust filters dan columns
- **Custom reports**: Contact support untuk request
- **Excel export**: Always available untuk further customization

### **Q: Dashboard tidak show real-time data?**
**A:** Dashboard refresh setiap **15 menit**. Untuk real-time data, access langsung ke menu specific (Sales, Inventory, etc.).

---

## 🔧 **Technical Issues**

### **Q: Browser mana yang paling optimal?**
**A:** Recommended:
1. **Google Chrome** (latest version)
2. **Mozilla Firefox** (latest version)
3. **Microsoft Edge** (latest version)
4. **Minimum resolution**: 1024x768

### **Q: Internet putus saat input data, apakah data hilang?**
**A:** 
- **Auto-save** setiap 2 menit untuk form yang sedang diisi
- **Check "Draft" folder** untuk recover data
- **Always click Save** sebelum navigate ke page lain

### **Q: Upload file gagal terus, kenapa?**
**A:** Check:
1. **File size** - maximum 2MB per file
2. **File format** - only JPG, PNG, PDF, Excel
3. **Internet connection** - pastikan stable
4. **Browser cache** - clear cache dan try again

### **Q: Bisa akses via mobile?**
**A:** Ya, web responsive support mobile browser. Untuk feature lengkap, gunakan desktop/laptop.

---

## 💾 **Data Management**

### **Q: Seberapa sering data di-backup?**
**A:** 
- **Daily backup**: Setiap hari jam 02:00 WIB
- **Weekly backup**: Setiap Minggu (retained 4 weeks)
- **Monthly backup**: Setiap akhir bulan (retained 12 months)

### **Q: Bisa restore data dari tanggal tertentu?**
**A:** Ya, contact support dengan info:
- **Tanggal restore** yang diinginkan
- **Reason** for restore request
- **Business justification**
- Approval dari Management required

### **Q: Import data Excel ada error, bagaimana fix?**
**A:**
1. **Download template terbaru** dari menu Import
2. **Check format columns** - pastikan sesuai template
3. **Remove special characters** dari data
4. **Save as CSV** jika Excel masih error

---

## 🎯 **Best Practices**

### **Q: Tips agar data tetap akurat?**
**A:**
1. **Training team** secara berkala
2. **Standard operating procedures** untuk setiap proses
3. **Regular audit** data master
4. **Access control** sesuai job function
5. **Backup strategy** yang konsisten

### **Q: Bagaimana optimize performance system?**
**A:**
1. **Regular cleanup** data lama yang tidak terpakai
2. **Use filters** saat generate reports
3. **Close unused browser tabs**
4. **Update browser** ke versi terbaru
5. **Stable internet connection**

---

## 📞 **Support & Contact**

### **Q: Jam berapa support available?**
**A:**
- **Business Hours**: Senin-Jumat, 09:00-17:00 WIB
- **Emergency Support**: 24/7 untuk critical issues
- **Response Time**: 
  - High Priority: 2 hours
  - Medium Priority: 8 hours  
  - Low Priority: 24 hours

### **Q: Channel mana yang paling cepat untuk support?**
**A:**
1. **WhatsApp**: +62-8XX-XXXX-XXXX (fastest)
2. **Email**: support@malaka-erp.com
3. **Phone**: +62-21-XXXX-XXXX
4. **In-app Chat**: Available during business hours

### **Q: Apakah ada training untuk user baru?**
**A:**
- **Online Training**: Self-paced video tutorials
- **Live Training**: Weekly webinar every Thursday
- **On-site Training**: Available upon request
- **Certification Program**: Coming Q4 2025

---

## 🔄 **System Updates**

### **Q: Kapan system update dan apakah ada downtime?**
**A:**
- **Minor Updates**: Setiap 2 minggu, no downtime
- **Major Updates**: Quarterly, maksimal 2 jam downtime
- **Maintenance Window**: Minggu dini hari 02:00-05:00 WIB
- **Notification**: 7 hari sebelumnya via email

### **Q: Feature request bisa diajukan?**
**A:** Ya, melalui:
1. **Feature Request Form** di support portal
2. **Email** dengan detail requirement
3. **Quarterly User Meeting** untuk discuss roadmap
4. **Priority** based on business impact dan user votes

---

## 🚀 **Getting More Value**

### **Q: Modul mana yang paling critical untuk business?**
**A:** Tergantung business type:
- **Retail**: Master Data + Sales + Inventory
- **Manufacturing**: Inventory + Purchase + Production  
- **Distribution**: Inventory + Sales + Shipping
- **Service**: HR + Finance + CRM

### **Q: ROI dari implement ERP biasanya berapa lama?**
**A:** Berdasarkan user experience:
- **Small Business**: 6-12 bulan
- **Medium Business**: 12-18 bulan  
- **Large Business**: 18-24 bulan
- **Key factors**: User adoption, process optimization, training quality

---

**Tidak menemukan jawaban yang Anda cari? Hubungi support team kami!** 🆘

**Email**: support@malaka-erp.com  
**WhatsApp**: +62-8XX-XXXX-XXXX  
**Phone**: +62-21-XXXX-XXXX