# 📦 **Purchase Order Management - Malaka ERP**

Panduan lengkap untuk mengelola Purchase Order (PO) dari supplier dalam sistem inventory.

## 📋 **Overview**

Purchase Order adalah dokumen resmi untuk memesan barang dari supplier. Modul ini mengelola:
- **Pembuatan PO** berdasarkan kebutuhan stok
- **Approval workflow** untuk PO
- **Tracking status** pengiriman
- **Integration** dengan goods receipt
- **Supplier performance** monitoring

---

## 🎯 **Akses Menu Purchase Orders**

### 📱 **Navigasi**
```
Dashboard → Inventory → Purchase Orders
```

### 🖥️ **Tampilan Halaman**
```
┌─ Header ───────────────────────────────────────────────┐
│ 📦 Purchase Orders                    [+ New PO]      │
├───────────────────────────────────────────────────────┤
│ 🔍 [Search PO...]  [🎚️ Filters]  [📊 Analytics]     │
├───────────────────────────────────────────────────────┤
│ Status Overview:                                      │
│ [📝 Draft: 5] [⏳ Pending: 8] [✅ Approved: 12]     │
│ [🚚 Shipped: 6] [📦 Received: 15] [❌ Cancelled: 2] │
├───────────────────────────────────────────────────────┤
│                                                       │
│ ┌── PO List ──────────────────────────────────────────┐
│ │ PO001 │ PT Supplier A    │ Rp 25,000,000 │ Pending│
│ │ PO002 │ CV Sepatu Bagus  │ Rp 18,500,000 │ Shipped│
│ │ PO003 │ UD Kulit Jaya    │ Rp 12,750,000 │ Draft  │
│ └─────────────────────────────────────────────────────┘
└───────────────────────────────────────────────────────┘
```

---

## ➕ **Membuat Purchase Order Baru**

### 📋 **Langkah 1: Inisiasi PO**

#### 🆕 **Klik [+ New PO]**
Pilih metode pembuatan:
```
┌─ Create New Purchase Order ──────────────────────────┐
│                                                      │
│ Creation Method:                                     │
│                                                      │
│ [📋] Manual Entry                                   │
│ Create PO from scratch                               │
│                                                      │
│ [📊] From Reorder Report                            │
│ Based on low stock analysis                          │
│                                                      │
│ [🔄] Copy Existing PO                               │
│ Duplicate previous order                             │
│                                                      │
│ [📝] From Purchase Requisition                      │
│ Convert PR to PO                                     │
│                                                      │
│ [Continue →]                                         │
└──────────────────────────────────────────────────────┘
```

#### 📝 **Header Information**
```
┌─ PO Header Information ──────────────────────────────┐
│                                                      │
│ PO Number*:    [PO2025080001] (Auto-generated)      │
│ Date*:         [03/08/2025]                          │
│ Expected Date: [10/08/2025]                          │
│                                                      │
│ Supplier*:     [PT Sepatu Indonesia        ▼]       │
│ Contact:       [Budi Santoso - 021-5555-1234]       │
│ Email:         [budi@sepatuindonesia.com]            │
│                                                      │
│ Delivery To:   [Gudang Utama Jakarta       ▼]       │
│ Address:       [Jl. Industri No. 123, Jakarta]      │
│                                                      │
│ Currency:      [IDR ▼]                               │
│ Payment Terms: [Net 30 Days ▼]                      │
│ Shipping:      [FOB Warehouse ▼]                    │
└──────────────────────────────────────────────────────┘
```

### 📋 **Langkah 2: Menambah Items**

#### 🛍️ **Add Items Section**
```
┌─ PO Items ───────────────────────────────────────────┐
│                                                      │
│ [+ Add Item] [📁 Add from Template] [📊 Bulk Add]   │
│                                                      │
│ ┌── Item List ────────────────────────────────────── │
│ │No│Article     │Desc      │Qty │Unit│Price   │Total│
│ ├──┼────────────┼──────────┼────┼────┼────────┼─────│
│ │1 │SEP001      │Pantofel  │100 │Pcs │450,000 │45M │
│ │2 │SEP002      │Sneakers  │150 │Pcs │320,000 │48M │
│ │3 │BOOT001     │Work Boots│ 75 │Pcs │580,000 │43M │
│ │  │            │          │    │    │        │136M │
│ └──────────────────────────────────────────────────── │
│                                                      │
│ Subtotal:      Rp 136,500,000                       │
│ Discount:      Rp   1,365,000 (1%)                  │
│ Tax (11%):     Rp  14,864,850                       │
│ ──────────────────────────────                      │
│ Total Amount:  Rp 150,000,000                       │
└──────────────────────────────────────────────────────┘
```

#### 🔍 **Item Selection Process**
Klik **[+ Add Item]**:
```
┌─ Select Product ─────────────────────────────────────┐
│                                                      │
│ Search: [sepatu sport...]                            │
│                                                      │
│ ┌─ Available Products ─────────────────────────────── │
│ │ ☑️ SEP001 - Pantofel Kulit Hitam                   │
│ │    Stock: 25, Reorder: 100, Supplier: ✓           │
│ │                                                    │
│ │ ☑️ SEP002 - Sneakers Casual Putih                  │
│ │    Stock: 12, Reorder: 150, Supplier: ✓           │
│ │                                                    │
│ │ ☑️ BOOT001 - Safety Boots                          │
│ │    Stock: 8, Reorder: 75, Supplier: ✓             │
│ └──────────────────────────────────────────────────── │
│                                                      │
│ Selected: 3 items                                    │
│ [Add Selected Items] [Cancel]                        │
└──────────────────────────────────────────────────────┘
```

#### 📊 **Item Details Configuration**
Untuk setiap item yang ditambahkan:
```
┌─ Item Details: SEP001 ───────────────────────────────┐
│                                                      │
│ Article: SEP001 - Pantofel Kulit Hitam               │
│ Current Stock: 25 pairs                              │
│ Reorder Point: 50 pairs                              │
│                                                      │
│ Order Quantity*: [100] pairs                         │
│ Unit Price*:     [Rp 450,000]                        │
│ Discount:        [0] %                               │
│ Tax Rate:        [11] %                              │
│                                                      │
│ Size Breakdown:                                      │
│ [38: 8] [39: 12] [40: 20] [41: 25]                  │
│ [42: 20] [43: 12] [44: 3]                           │
│                                                      │
│ Delivery Date: [10/08/2025]                          │
│ Notes: [Specify quality requirements if any]         │
│                                                      │
│ [💾 Save Item] [❌ Cancel]                           │
└──────────────────────────────────────────────────────┘
```

### 📋 **Langkah 3: Review & Finalisasi**

#### 📄 **Terms & Conditions**
```
┌─ Terms & Conditions ─────────────────────────────────┐
│                                                      │
│ Payment Terms:                                       │
│ • Net 30 days from invoice date                     │
│ • 2% discount if paid within 10 days                │
│                                                      │
│ Delivery Terms:                                      │
│ • FOB Warehouse (Supplier bears shipping cost)      │
│ • Expected delivery: 7 working days                  │
│ • Partial shipment: Not allowed                     │
│                                                      │
│ Quality Terms:                                       │
│ • All goods subject to quality inspection           │
│ • Return policy: 7 days for defects                 │
│ • Compliance: SNI standards required                │
│                                                      │
│ Special Instructions:                                │
│ [Packaging requirements, delivery time preferences]  │
└──────────────────────────────────────────────────────┘
```

#### 💾 **Save Options**
```
Actions:
[💾 Save as Draft] - Simpan untuk dilanjutkan nanti
[📨 Save & Send for Approval] - Kirim untuk approval
[✅ Save & Send to Supplier] - Langsung kirim ke supplier (jika ada otorisasi)
[❌ Cancel] - Batalkan pembuatan PO
```

---

## 🔍 **Tracking & Monitoring PO**

### 📊 **PO Status Workflow**
```
📝 Draft → ⏳ Pending → ✅ Approved → 📨 Sent → 🚚 Shipped → 📦 Received → ✅ Closed
    ↓         ↓           ↓          ↓        ↓           ↓            ↓
  Edit      Review     Send to    Supplier  Tracking   Goods      Complete
   PO       Process    Supplier   Confirms  Updates    Receipt    
                                  Order
```

### 🔍 **PO Detail View**
Klik pada PO untuk melihat detail:
```
┌─ PO Detail: PO2025080001 ────────────────────────────┐
│                                                      │
│ 📋 Header Info                    Status: [✅ Sent] │
│ Supplier: PT Sepatu Indonesia                        │
│ Date: 03/08/2025 | Expected: 10/08/2025             │
│ Total: Rp 150,000,000                               │
│                                                      │
│ 📦 Items (3)          🚚 Shipping        💰 Payment │
│ ┌────────────────────┬─────────────────┬─────────────┐
│ │ SEP001: 100 pcs    │ Tracking: JNE   │ Terms: Net30│
│ │ SEP002: 150 pcs    │ AWB: JKT123456  │ Due: 02/09  │
│ │ BOOT001: 75 pcs    │ Status: Transit │ Paid: No    │
│ └────────────────────┴─────────────────┴─────────────┘
│                                                      │
│ 📝 Activity Log:                                     │
│ • 03/08 10:30 - PO Created by Admin                 │
│ • 03/08 11:15 - Approved by Manager                 │
│ • 03/08 14:20 - Sent to Supplier                    │
│ • 04/08 09:00 - Confirmed by Supplier               │
│ • 05/08 16:30 - Shipped (AWB: JKT123456)           │
│                                                      │
│ Actions: [✏️ Edit] [📧 Resend] [❌ Cancel] [📄 Print]│
└──────────────────────────────────────────────────────┘
```

### 📈 **PO Analytics Dashboard**
```
┌─ Purchase Order Analytics ───────────────────────────┐
│                                                      │
│ 📊 This Month Overview:                             │
│ Total POs: 45 | Total Value: Rp 2.8B               │
│ Avg PO Value: Rp 62M | Avg Processing: 2.3 days    │
│                                                      │
│ 🏆 Top Suppliers by Volume:                         │
│ 1. PT Sepatu Indonesia    - Rp 850M (30%)          │
│ 2. CV Kulit Berkualitas   - Rp 560M (20%)          │
│ 3. UD Sepatu Handmade     - Rp 420M (15%)          │
│                                                      │
│ ⚡ Performance Metrics:                             │
│ On-time Delivery: 87%                               │
│ Quality Pass Rate: 94%                              │
│ Cost Savings: Rp 125M (4.5%)                       │
│                                                      │
│ 🎯 Action Items:                                    │
│ • 5 POs pending approval                            │
│ • 3 overdue deliveries need follow-up              │
│ • 2 suppliers need payment processing               │
└──────────────────────────────────────────────────────┘
```

---

## ✅ **Approval Workflow**

### 👥 **Multi-level Approval**
Untuk PO dengan nilai tertentu:
```
┌─ Approval Matrix ────────────────────────────────────┐
│                                                      │
│ PO Value Range        Required Approvals             │
│ ─────────────────────────────────────────────────── │
│ < Rp 10M             Supervisor                      │
│ Rp 10M - 50M         Supervisor + Manager           │
│ Rp 50M - 100M        Manager + Director             │
│ > Rp 100M            Manager + Director + Owner      │
│                                                      │
│ Current PO: Rp 150M → Requires 3 approvals          │
│                                                      │
│ Approval Status:                                     │
│ ✅ Supervisor (Andi) - Approved 03/08 11:15         │
│ ✅ Manager (Sari) - Approved 03/08 14:30            │
│ ⏳ Director (Budi) - Pending                         │
└──────────────────────────────────────────────────────┘
```

### 📧 **Notification System**
Auto-notification untuk:
- **Approval requests** ke approver
- **Approval confirmations** ke requester
- **PO sent** ke supplier
- **Delivery updates** ke all stakeholders
- **Overdue alerts** ke procurement team

---

## 📦 **Integration dengan Goods Receipt**

### 🔄 **PO to GR Process**
Ketika barang diterima:
```
┌─ Convert PO to Goods Receipt ────────────────────────┐
│                                                      │
│ Source PO: PO2025080001                              │
│ Supplier: PT Sepatu Indonesia                        │
│                                                      │
│ Delivery Information:                                │
│ Delivery Note: [DN-240803-001]                       │
│ Received Date: [05/08/2025]                          │
│ Received By: [Warehouse Staff - Joni]                │
│                                                      │
│ Items Received:                                      │
│ ┌─────────────────────────────────────────────────── │
│ │Item    │Ordered│Delivered│Received│Variance│Status │
│ ├────────┼───────┼─────────┼────────┼────────┼───────│
│ │SEP001  │  100  │   98    │   98   │  -2    │ ✅   │
│ │SEP002  │  150  │  150    │  147   │  -3    │ ⚠️   │
│ │BOOT001 │   75  │   75    │   75   │   0    │ ✅   │
│ └─────────────────────────────────────────────────── │
│                                                      │
│ Total Received: 320 of 325 items (98.5%)            │
│                                                      │
│ [📦 Process Goods Receipt] [📝 Report Discrepancy]  │
└──────────────────────────────────────────────────────┘
```

---

## 💰 **Financial Integration**

### 🧾 **Invoice Matching**
PO terintegrasi dengan accounts payable:
```
┌─ Invoice Matching: PO2025080001 ─────────────────────┐
│                                                      │
│ Purchase Order Amount: Rp 150,000,000                │
│ Goods Receipt Amount:  Rp 147,000,000 (98%)         │
│ Invoice Amount:        Rp 147,000,000                │
│                                                      │
│ 3-Way Matching Status: ✅ MATCHED                   │
│                                                      │
│ Variance Analysis:                                   │
│ • Price Variance: Rp 0 (0%)                         │
│ • Quantity Variance: Rp 3,000,000 (2%)              │
│ • Total Variance: Rp 3,000,000                      │
│                                                      │
│ Action Required:                                     │
│ [✅ Approve for Payment] [⚠️ Investigate Variance]   │
│ [📝 Create Credit Note] [❌ Reject Invoice]          │
└──────────────────────────────────────────────────────┘
```

### 💳 **Payment Processing**
```
┌─ Payment Processing ─────────────────────────────────┐
│                                                      │
│ Invoice: INV-240805-001                              │
│ Amount: Rp 147,000,000                               │
│ Due Date: 02/09/2025                                 │
│                                                      │
│ Payment Options:                                     │
│ [💰 Full Payment] [📝 Partial Payment]              │
│ [🏦 Bank Transfer] [💳 Check Payment]               │
│                                                      │
│ Early Payment Discount:                              │
│ Pay by 13/08/2025: Save Rp 2,940,000 (2%)          │
│                                                      │
│ [💸 Process Payment] [⏰ Schedule Payment]           │
└──────────────────────────────────────────────────────┘
```

---

## 📊 **Reporting & Analytics**

### 📈 **Standard Reports**

#### 📋 **PO Status Report**
```
┌─ Purchase Order Status Report ───────────────────────┐
│ Period: August 2025                                  │
│                                                      │
│ Status Summary:                                      │
│ • Draft: 8 POs (Rp 425M)                           │
│ • Pending Approval: 5 POs (Rp 280M)                │
│ • Approved: 12 POs (Rp 750M)                       │
│ • Sent to Supplier: 18 POs (Rp 1.2B)               │
│ • In Transit: 10 POs (Rp 650M)                     │
│ • Received: 25 POs (Rp 1.8B)                       │
│ • Closed: 30 POs (Rp 2.1B)                         │
│                                                      │
│ Total Active POs: 108 (Rp 7.2B)                    │
└──────────────────────────────────────────────────────┘
```

#### 🏆 **Supplier Performance**
```
┌─ Supplier Performance Report ────────────────────────┐
│                                                      │
│ Top Performers (Last 3 months):                     │
│                                                      │
│ 🥇 PT Sepatu Indonesia                              │
│    On-time: 96% | Quality: 98% | Value: Rp 2.5B   │
│                                                      │
│ 🥈 CV Kulit Berkualitas                             │
│    On-time: 92% | Quality: 95% | Value: Rp 1.8B   │
│                                                      │
│ 🥉 UD Sepatu Handmade                               │
│    On-time: 88% | Quality: 97% | Value: Rp 1.2B   │
│                                                      │
│ Action Items:                                        │
│ • Review terms with 3 underperforming suppliers     │
│ • Negotiate better pricing with top suppliers       │
│ • Develop backup suppliers for critical items       │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 **Advanced Features**

### 🔄 **Auto-Reorder System**
```
┌─ Automatic Reorder Configuration ────────────────────┐
│                                                      │
│ Enable Auto-PO: [●] Yes [○] No                      │
│                                                      │
│ Reorder Rules:                                       │
│ • Trigger: When stock ≤ Reorder Point               │
│ • Quantity: Economic Order Quantity (EOQ)           │
│ • Supplier: Primary supplier auto-selected          │
│ • Approval: Auto-approve if ≤ Rp 25M               │
│                                                      │
│ Schedule: Check daily at 08:00 WIB                  │
│                                                      │
│ Items Configured: 245 products                      │
│ Last Auto-PO: 02/08/2025 - 8 items                 │
│                                                      │
│ [⚙️ Configure Rules] [📊 View Auto-PO History]     │
└──────────────────────────────────────────────────────┘
```

### 📊 **Predictive Analytics**
```
┌─ Purchase Forecast ──────────────────────────────────┐
│                                                      │
│ Next 30 Days Prediction:                            │
│                                                      │
│ 🎯 Recommended POs:                                 │
│ • SEP001: Order 200 pcs by 10/08                   │
│ • SEP002: Order 150 pcs by 15/08                   │
│ • BOOT001: Order 100 pcs by 20/08                  │
│                                                      │
│ 💰 Budget Impact: Rp 850M                          │
│ 📦 Storage Impact: 450 pairs                       │
│                                                      │
│ AI Confidence Level: 87%                            │
│ Based on: Sales trends, seasonality, lead times     │
│                                                      │
│ [🤖 Generate Auto-PO] [📋 Create Manual PO]        │
└──────────────────────────────────────────────────────┘
```

---

## 🏆 **Best Practices**

### ✅ **Do's**
1. **Regular Reviews**: Review pending POs setiap hari
2. **Supplier Relations**: Maintain good communication dengan supplier
3. **Quality Checks**: Always inspect goods upon receipt
4. **Cost Optimization**: Negotiate terms dan pricing
5. **Documentation**: Keep complete records untuk audit

### ❌ **Don'ts**
1. **Rush Orders**: Hindari emergency PO yang costly
2. **Single Source**: Jangan bergantung pada satu supplier
3. **Skip Approval**: Jangan bypass approval process
4. **Poor Planning**: Hindari stockout karena planning buruk
5. **Ignore Metrics**: Jangan abaikan supplier performance

---

## 🆘 **Troubleshooting**

### ❗ **Common Issues**

#### 📧 **PO Tidak Terkirim ke Supplier**
**Symptoms**: Email PO tidak terkirim
**Solutions**:
1. Check email supplier di master data
2. Verify SMTP configuration
3. Check spam folder supplier
4. Send manual follow-up

#### 📊 **Data Tidak Sinkron dengan Stock**
**Symptoms**: Stock tidak update setelah GR
**Solutions**:
1. Check goods receipt processing
2. Verify warehouse assignment
3. Refresh inventory data
4. Contact system admin

### 📞 **Support Contact**
- **Email**: procurement@malaka-erp.com
- **WhatsApp**: +62-8XX-XXXX-XXXX
- **Internal**: Extension 1234

---

## 📚 **Panduan Terkait**

### 🔗 **Related Guides**
- [Goods Receipt Management](./goods-receipt.md)
- [Supplier Management](../04-master-data/suppliers.md)
- [Stock Control](./stock-control.md)
- [Accounts Payable](../07-finance/receivables-payables.md)

### 🎓 **Training Materials**
- **Video**: PO Creation Process
- **Template**: PO Excel Template
- **SOP**: Purchase Order Standard Operating Procedure

---

**Purchase Order yang dikelola dengan baik adalah kunci supply chain yang efisien!** 📦✨