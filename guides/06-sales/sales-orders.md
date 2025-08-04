# 💰 **Sales Order Management - Malaka ERP**

Panduan lengkap untuk mengelola sales order dari customer dalam sistem penjualan.

## 📋 **Overview**

Sales Order adalah dokumen utama dalam proses penjualan yang mengelola:
- **Order dari customer** dengan detail produk dan pricing
- **Workflow approval** untuk order besar
- **Integration** dengan inventory dan finance
- **Delivery scheduling** dan tracking
- **Customer relationship** management

---

## 🎯 **Akses Menu Sales Orders**

### 📱 **Navigasi**
```
Dashboard → Sales → Sales Orders
```

### 🖥️ **Tampilan Halaman**
```
┌─ Header ───────────────────────────────────────────────┐
│ 💰 Sales Orders                     [+ New Order]     │
├───────────────────────────────────────────────────────┤
│ 🔍 [Search orders...]  [🎚️ Filters]  [📊 Analytics] │
├───────────────────────────────────────────────────────┤
│ Status Overview:                                      │
│ [📝 Draft: 8] [⏳ Pending: 5] [✅ Confirmed: 15]     │
│ [📦 Shipped: 12] [✅ Delivered: 25] [❌ Cancelled: 3]│
├───────────────────────────────────────────────────────┤
│                                                       │
│ ┌── Order List ───────────────────────────────────────┐
│ │SO001│ Toko Sepatu Maju │ Rp 15,750,000│ Confirmed │
│ │SO002│ CV Retail Bagus  │ Rp 8,500,000 │ Shipped  │
│ │SO003│ PT Fashion House │ Rp 25,000,000│ Pending  │
│ └─────────────────────────────────────────────────────┘
└───────────────────────────────────────────────────────┘
```

---

## ➕ **Membuat Sales Order Baru**

### 📋 **Langkah 1: Customer Selection**

#### 🆕 **Klik [+ New Order]**
Pilih customer atau create new:
```
┌─ Select Customer ────────────────────────────────────┐
│                                                      │
│ Search Customer: [Toko Sepatu...]                    │
│                                                      │
│ ┌─ Existing Customers ────────────────────────────── │
│ │ ✅ Toko Sepatu Maju                               │
│ │    Jakarta - Credit Limit: Rp 50M                │
│ │    Last Order: 25/07/2025 - Rp 12M               │
│ │                                                    │
│ │ ✅ CV Retail Bagus                                │
│ │    Bandung - Credit Limit: Rp 25M                │
│ │    Last Order: 20/07/2025 - Rp 8M                │
│ └──────────────────────────────────────────────────── │
│                                                      │
│ [+ Add New Customer] [Continue with Selected]        │
└──────────────────────────────────────────────────────┘
```

#### 📝 **Order Header Information**
```
┌─ Sales Order Header ─────────────────────────────────┐
│                                                      │
│ SO Number*:     [SO2025080001] (Auto-generated)     │
│ Date*:          [03/08/2025]                         │
│ Required Date:  [10/08/2025]                         │
│                                                      │
│ Customer*:      [Toko Sepatu Maju]                   │
│ Contact Person: [Budi Santoso - 021-5555-1234]      │
│ Email:          [budi@tokosepatumaju.com]            │
│                                                      │
│ Delivery Address:                                    │
│ [📍 Jl. Pasar Baru No. 45, Jakarta Pusat 10110]    │
│                                                      │
│ Sales Rep:      [Sari Dewi ▼]                       │
│ Payment Terms:  [Net 30 Days ▼]                     │
│ Currency:       [IDR ▼]                              │
│ Price List:     [Retail 2025 ▼]                     │
└──────────────────────────────────────────────────────┘
```

### 📋 **Langkah 2: Product Selection**

#### 🛍️ **Add Products Section**
```
┌─ Order Items ────────────────────────────────────────┐
│                                                      │
│ [+ Add Item] [📱 Scan Barcode] [📋 Quick Add]       │
│                                                      │
│ ┌── Item List ──────────────────────────────────────┐
│ │No│Product     │Description │Qty│Price    │Total  │
│ ├──┼────────────┼────────────┼───┼─────────┼───────│
│ │1 │SEP001-BLK  │Pantofel    │25 │450,000  │11.25M│
│ │2 │SEP002-WHT  │Sneakers    │30 │320,000  │9.60M │
│ │3 │BOOT001-BRN │Work Boots  │15 │580,000  │8.70M │
│ │  │            │            │   │         │29.55M│
│ └────────────────────────────────────────────────────┘
│                                                      │
│ Subtotal:       Rp 29,550,000                       │
│ Customer Disc:  Rp    295,500 (1%)                  │
│ Tax (11%):      Rp  3,218,045                       │
│ ──────────────────────────────                      │
│ Total Amount:   Rp 32,472,545                       │
└──────────────────────────────────────────────────────┘
```

#### 🔍 **Product Selection Process**
Klik **[+ Add Item]**:
```
┌─ Select Products ────────────────────────────────────┐
│                                                      │
│ Search: [sepatu casual...]                           │
│ Category: [All ▼] [Formal ▼] [Casual ▼] [Sport ▼]  │
│                                                      │
│ ┌─ Available Products ─────────────────────────────── │
│ │ [📷] SEP001 - Pantofel Kulit Hitam                │
│ │      Stock: 120 pcs | Price: Rp 450,000          │
│ │      Qty: [25] [Add to Cart]                      │
│ │                                                    │
│ │ [📷] SEP002 - Sneakers Casual Putih               │
│ │      Stock: 85 pcs | Price: Rp 320,000           │
│ │      Qty: [30] [Add to Cart]                      │
│ │                                                    │
│ │ [📷] BOOT001 - Safety Boots Coklat                │
│ │      Stock: 45 pcs | Price: Rp 580,000           │
│ │      Qty: [15] [Add to Cart]                      │
│ └──────────────────────────────────────────────────── │
│                                                      │
│ [🛒 Add Selected Items] [❌ Cancel]                  │
└──────────────────────────────────────────────────────┘
```

#### 📊 **Item Details & Pricing**
Untuk setiap item yang ditambahkan:
```
┌─ Item Details: SEP001 ───────────────────────────────┐
│                                                      │
│ Product: SEP001 - Pantofel Kulit Hitam               │
│ Available Stock: 120 pairs                           │
│ Reserved: 25 pairs (from this order)                 │
│                                                      │
│ Quantity*: [25] pairs                                │
│ Unit Price*: [Rp 450,000]                           │
│ Discount: [0] % or [Rp 0]                           │
│ Special Price: [Use Price List ▼]                   │
│                                                      │
│ Size Breakdown (Optional):                           │
│ [38: 2] [39: 3] [40: 6] [41: 8]                     │
│ [42: 4] [43: 2] [44: 0]                             │
│                                                      │
│ Delivery Date: [10/08/2025]                          │
│ Notes: [Customer specific requirements]              │
│                                                      │
│ Line Total: Rp 11,250,000                           │
│                                                      │
│ [💾 Save Item] [❌ Remove]                           │
└──────────────────────────────────────────────────────┘
```

### 📋 **Langkah 3: Terms & Conditions**

#### 💳 **Payment & Delivery Terms**
```
┌─ Order Terms ────────────────────────────────────────┐
│                                                      │
│ Payment Terms:                                       │
│ • Payment Method: [Bank Transfer ▼]                 │
│ • Terms: Net 30 days from invoice date              │
│ • Credit Limit Check: ✅ PASSED (Usage: 65%)       │
│                                                      │
│ Delivery Terms:                                      │
│ • Delivery Method: [Company Truck ▼]                │
│ • Expected Delivery: [10/08/2025]                   │
│ • Delivery Cost: [FOB Customer ▼]                   │
│ • Special Instructions: [Delivery 09:00-17:00]      │
│                                                      │
│ Sales Terms:                                         │
│ • Warranty: 30 days manufacturing defect            │
│ • Return Policy: 7 days with original condition     │
│ • Quality Standard: SNI certified products          │
│                                                      │
│ Order Notes:                                         │
│ [Customer requested early delivery if possible.      │
│  Priority customer - ensure quality packaging.]     │
└──────────────────────────────────────────────────────┘
```

#### 💾 **Save Options**
```
Actions:
[💾 Save as Draft] - Simpan untuk dilanjutkan nanti
[📨 Save & Send for Approval] - Kirim untuk approval (jika diperlukan)
[✅ Confirm Order] - Konfirmasi order dan reserve stock
[📧 Save & Email Customer] - Kirim konfirmasi ke customer
[❌ Cancel] - Batalkan pembuatan order
```

---

## 🔍 **Order Tracking & Status Management**

### 📊 **Order Status Workflow**
```
📝 Draft → ⏳ Pending → ✅ Confirmed → 📦 Processing → 🚚 Shipped → ✅ Delivered → 💰 Invoiced
    ↓         ↓           ↓            ↓              ↓            ↓             ↓
  Edit      Review     Reserve       Pick &         Dispatch     Customer      Payment
  Order     Process    Stock         Pack           Tracking     Receives      Processing
                                     Items          Updates      Goods
```

### 🔍 **Order Detail View**
Klik pada order untuk melihat detail:
```
┌─ Order Detail: SO2025080001 ─────────────────────────┐
│                                                      │
│ 📋 Header Info                   Status: [✅ Confirmed]│
│ Customer: Toko Sepatu Maju                           │
│ Date: 03/08/2025 | Required: 10/08/2025            │
│ Total: Rp 32,472,545                               │
│                                                      │
│ 📦 Items (3)         🚚 Delivery        💰 Payment  │
│ ┌──────────────────┬─────────────────┬──────────────┐
│ │ SEP001: 25 pcs   │ Method: Truck   │ Terms: Net30 │
│ │ SEP002: 30 pcs   │ Date: 10/08     │ Due: 02/09   │
│ │ BOOT001: 15 pcs  │ Status: Pending │ Status: Open │
│ └──────────────────┴─────────────────┴──────────────┘
│                                                      │
│ 📝 Activity Log:                                     │
│ • 03/08 10:30 - Order Created by Sales Rep          │
│ • 03/08 11:15 - Confirmed by Manager               │
│ • 03/08 14:20 - Stock Reserved                     │
│ • 04/08 09:00 - Picking Process Started            │
│ • 04/08 15:30 - Packed and Ready to Ship           │
│                                                      │
│ Actions: [✏️ Edit] [📦 Process] [🚚 Ship] [📄 Print]│
└──────────────────────────────────────────────────────┘
```

### 📈 **Sales Analytics Dashboard**
```
┌─ Sales Order Analytics ──────────────────────────────┐
│                                                      │
│ 📊 This Month Performance:                          │
│ Total Orders: 87 | Total Value: Rp 1.2B            │
│ Avg Order Value: Rp 13.8M | Conversion: 78%        │
│                                                      │
│ 🏆 Top Customers by Value:                          │
│ 1. Toko Sepatu Maju       - Rp 245M (20%)          │
│ 2. CV Retail Bagus        - Rp 180M (15%)          │
│ 3. PT Fashion House       - Rp 156M (13%)          │
│                                                      │
│ 🎯 Performance Metrics:                             │
│ On-time Delivery: 92%                               │
│ Order Accuracy: 96%                                 │
│ Customer Satisfaction: 4.6/5                        │
│                                                      │
│ 🚀 Action Items:                                    │
│ • 5 orders need approval                            │
│ • 8 orders ready for delivery                      │
│ • 12 invoices pending payment                      │
└──────────────────────────────────────────────────────┘
```

---

## ✅ **Order Processing Workflow**

### 👥 **Approval Process**
Untuk order dengan nilai tertentu:
```
┌─ Approval Matrix ────────────────────────────────────┐
│                                                      │
│ Order Value Range       Required Approvals           │
│ ──────────────────────────────────────────────────── │
│ < Rp 5M                Sales Rep                     │
│ Rp 5M - 25M            Sales Rep + Sales Manager    │
│ Rp 25M - 50M           Sales Manager + Director     │
│ > Rp 50M               Director + Owner              │
│                                                      │
│ Current Order: Rp 32.5M → Requires 2 approvals     │
│                                                      │
│ Approval Status:                                     │
│ ✅ Sales Rep (Sari) - Approved 03/08 10:45         │
│ ✅ Sales Manager (Andi) - Approved 03/08 14:20     │
│ ✅ APPROVED - Ready for Processing                  │
└──────────────────────────────────────────────────────┘
```

### 📦 **Order Fulfillment Process**

#### 🎯 **Pick & Pack**
```
┌─ Order Fulfillment: SO2025080001 ────────────────────┐
│                                                      │
│ Warehouse: Gudang Utama Jakarta                     │
│ Picker: Warehouse Staff - Joni                      │
│                                                      │
│ Pick List:                                           │
│ ┌────────────────────────────────────────────────── │
│ │Item    │Location│Ordered│Picked│Status │Notes     │
│ ├────────┼────────┼───────┼──────┼───────┼──────────│
│ │SEP001  │ A-12-3 │  25   │  25  │ ✅   │ Complete │
│ │SEP002  │ B-05-1 │  30   │  28  │ ⚠️   │ 2 damaged│
│ │BOOT001 │ C-08-2 │  15   │  15  │ ✅   │ Complete │
│ └────────────────────────────────────────────────── │
│                                                      │
│ Pick Completion: 68 of 70 items (97%)              │
│                                                      │
│ [📦 Complete Picking] [⚠️ Report Issue]             │
│ [📝 Add Notes] [🔄 Re-pick Shortage]               │
└──────────────────────────────────────────────────────┘
```

#### 📋 **Quality Check**
```
┌─ Quality Control Check ──────────────────────────────┐
│                                                      │
│ QC Inspector: Quality Team - Made                   │
│ Check Date: 04/08/2025 14:30                        │
│                                                      │
│ Quality Checklist:                                   │
│ ✅ Product condition: No defects                    │
│ ✅ Size accuracy: All sizes correct                 │
│ ✅ Color matching: As per order                     │
│ ✅ Packaging: Proper protection                     │
│ ✅ Documentation: Complete                          │
│                                                      │
│ QC Status: ✅ PASSED                               │
│                                                      │
│ Special Notes:                                       │
│ [2 pcs SEP002 replaced due to minor scuff.          │
│  All items meet quality standards.]                 │
│                                                      │
│ [✅ Approve for Shipping] [❌ Reject Order]         │
└──────────────────────────────────────────────────────┘
```

---

## 🚚 **Shipping & Delivery**

### 📦 **Delivery Note Generation**
```
┌─ Generate Delivery Note ─────────────────────────────┐
│                                                      │
│ Order: SO2025080001                                  │
│ Customer: Toko Sepatu Maju                          │
│                                                      │
│ Delivery Information:                                │
│ Delivery Date: [05/08/2025]                         │
│ Delivery Method: [Company Truck ▼]                  │
│ Driver: [Ahmad - 0812-3456-7890]                    │
│                                                      │
│ Delivery Address:                                    │
│ [Jl. Pasar Baru No. 45, Jakarta Pusat 10110]      │
│ Contact: Budi Santoso - 021-5555-1234              │
│                                                      │
│ Items to Deliver:                                    │
│ ┌────────────────────────────────────────────────── │
│ │ SEP001: 25 pcs (5 boxes)                         │
│ │ SEP002: 28 pcs (5 boxes) - 2 shortage reported   │
│ │ BOOT001: 15 pcs (3 boxes)                        │
│ │ Total: 68 pcs (13 boxes)                         │
│ └────────────────────────────────────────────────── │
│                                                      │
│ [🚚 Generate DN & Ship] [📄 Print DN] [❌ Cancel]   │
└──────────────────────────────────────────────────────┘
```

### 📱 **Real-time Tracking**
```
┌─ Delivery Tracking ──────────────────────────────────┐
│                                                      │
│ DN Number: DN2025080001                              │
│ Status: 🚚 EN ROUTE                                 │
│                                                      │
│ Progress:                                            │
│ ✅ 08:00 - Departed from warehouse                  │
│ ✅ 09:30 - Passed Cawang Toll Gate                  │
│ 🚚 10:15 - Current: Jl. Sudirman area              │
│ ⏳ 11:00 - ETA: Customer location                   │
│                                                      │
│ Driver Contact: Ahmad - 0812-3456-7890              │
│ Vehicle: B 1234 CD                                   │
│                                                      │
│ [📞 Call Driver] [📱 Share Tracking] [📧 Notify Customer]│
└──────────────────────────────────────────────────────┘
```

---

## 💰 **Financial Integration**

### 🧾 **Invoice Generation**
Setelah delivery confirmed:
```
┌─ Generate Invoice from SO ───────────────────────────┐
│                                                      │
│ Source Order: SO2025080001                           │
│ Customer: Toko Sepatu Maju                          │
│ Delivery: Completed 05/08/2025                      │
│                                                      │
│ Invoice Details:                                     │
│ Invoice Number: [INV2025080001] (Auto-generated)    │
│ Invoice Date: [05/08/2025]                          │
│ Due Date: [04/09/2025] (Net 30)                     │
│                                                      │
│ Items Invoiced:                                      │
│ ┌────────────────────────────────────────────────── │
│ │ SEP001: 25 pcs × Rp 450,000 = Rp 11,250,000     │
│ │ SEP002: 28 pcs × Rp 320,000 = Rp  8,960,000     │
│ │ BOOT001: 15 pcs × Rp 580,000 = Rp  8,700,000     │
│ │ ──────────────────────────────────────────────── │
│ │ Subtotal: Rp 28,910,000                          │
│ │ Discount (1%): Rp 289,100                        │
│ │ Tax (11%): Rp 3,148,309                          │
│ │ Total: Rp 31,769,209                             │
│ └────────────────────────────────────────────────── │
│                                                      │
│ [💰 Generate Invoice] [📧 Email to Customer]        │
│ [📄 Print Invoice] [💾 Save as Draft]               │
└──────────────────────────────────────────────────────┘
```

### 💳 **Payment Tracking**
```
┌─ Payment Status ─────────────────────────────────────┐
│                                                      │
│ Invoice: INV2025080001                               │
│ Amount: Rp 31,769,209                               │
│ Due Date: 04/09/2025                                │
│ Days Outstanding: 15 days                           │
│                                                      │
│ Payment History:                                     │
│ • 10/08 - Payment reminder sent                     │
│ • 15/08 - Customer called for follow-up             │
│ • 18/08 - Partial payment Rp 15M received          │
│ • 20/08 - Balance due: Rp 16,769,209               │
│                                                      │
│ Next Actions:                                        │
│ [📧 Send Payment Reminder] [📞 Call Customer]       │
│ [💰 Record Payment] [📋 Payment Plan]               │
└──────────────────────────────────────────────────────┘
```

---

## 📊 **Customer Relationship Management**

### 👤 **Customer Profile Integration**
```
┌─ Customer Profile: Toko Sepatu Maju ─────────────────┐
│                                                      │
│ 📊 Customer Statistics:                             │
│ Total Orders: 47 | Total Value: Rp 1.2B            │
│ Avg Order: Rp 25.5M | Frequency: 2.3x/month        │
│ Payment Terms: Net 30 | Avg Payment: 28 days        │
│                                                      │
│ 🎯 Purchase Patterns:                               │
│ Top Categories: Formal (45%), Casual (35%), Sport   │
│ Seasonal Peak: Sep-Dec (Lebaran & Christmas)        │
│ Size Distribution: 40-42 (60% of orders)            │
│                                                      │
│ 💰 Financial Profile:                               │
│ Credit Limit: Rp 50M | Current Usage: 65%          │
│ Payment History: 98% on-time                        │
│ Outstanding: Rp 32.5M                               │
│                                                      │
│ 📈 Opportunities:                                   │
│ • Increase sport shoes category                     │
│ • Seasonal promotion for Q4                        │
│ • Volume discount negotiation                       │
└──────────────────────────────────────────────────────┘
```

### 🎯 **Sales Forecasting**
```
┌─ Sales Forecast: Toko Sepatu Maju ──────────────────┐
│                                                      │
│ Next 3 Months Prediction:                          │
│                                                      │
│ September 2025:                                      │
│ Predicted: Rp 45M (Pre-Lebaran surge)              │
│ Recommended: Focus on formal & kids shoes           │
│                                                      │
│ October 2025:                                        │
│ Predicted: Rp 28M (Normal demand)                   │
│ Recommended: Stock casual & sport varieties         │
│                                                      │
│ November 2025:                                       │
│ Predicted: Rp 52M (Holiday season)                  │
│ Recommended: Premium range & gift sets              │
│                                                      │
│ AI Confidence: 89%                                   │
│ Based on: 2 years historical data, market trends    │
│                                                      │
│ [📊 Detailed Forecast] [📧 Share with Sales Team]   │
└──────────────────────────────────────────────────────┘
```

---

## 📈 **Reports & Analytics**

### 📊 **Sales Performance Reports**

#### 📋 **Order Summary Report**
```
┌─ Sales Order Summary Report ─────────────────────────┐
│ Period: August 2025                                  │
│                                                      │
│ Overall Performance:                                 │
│ • Total Orders: 87                                   │
│ • Total Value: Rp 1,247,500,000                    │
│ • Avg Order Value: Rp 14,339,080                   │
│ • Order Growth: +15% vs July                       │
│                                                      │
│ Status Breakdown:                                    │
│ • Completed: 72 orders (Rp 1.1B)                   │
│ • In Process: 12 orders (Rp 142M)                  │
│ • Cancelled: 3 orders (Rp 35M)                     │
│                                                      │
│ Top Performing Products:                             │
│ • SEP001 (Pantofel): 245 pcs sold                  │
│ • SEP002 (Sneakers): 189 pcs sold                  │
│ • BOOT001 (Boots): 156 pcs sold                    │
└──────────────────────────────────────────────────────┘
```

#### 🏆 **Sales Team Performance**
```
┌─ Sales Rep Performance ──────────────────────────────┐
│                                                      │
│ Top Performers (August):                             │
│                                                      │
│ 🥇 Sari Dewi                                        │
│    Orders: 28 | Value: Rp 425M | Conversion: 85%   │
│    Target Achievement: 142%                         │
│                                                      │
│ 🥈 Andi Pratama                                     │
│    Orders: 24 | Value: Rp 380M | Conversion: 78%   │
│    Target Achievement: 127%                         │
│                                                      │
│ 🥉 Made Sutrisno                                    │
│    Orders: 21 | Value: Rp 315M | Conversion: 72%   │
│    Target Achievement: 105%                         │
│                                                      │
│ Team Total: 73 orders | Rp 1.12B                   │
│ Team Target Achievement: 124%                       │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 **Advanced Features**

### 🔄 **Recurring Orders**
```
┌─ Setup Recurring Order ──────────────────────────────┐
│                                                      │
│ Customer: Toko Sepatu Maju                          │
│ Base Order: SO2025080001                            │
│                                                      │
│ Recurrence Pattern:                                  │
│ Frequency: [Monthly ▼] [Every 2 weeks ▼]           │
│ Start Date: [01/09/2025]                            │
│ End Date: [Optional - 31/12/2025]                   │
│                                                      │
│ Order Modifications:                                 │
│ [●] Use same items and quantities                   │
│ [○] Allow quantity adjustments                      │
│ [○] Seasonal quantity changes                       │
│                                                      │
│ Auto-Processing:                                     │
│ [●] Auto-generate order                             │
│ [○] Send for approval                               │
│ [○] Auto-confirm if stock available                 │
│                                                      │
│ [⚙️ Setup Recurring] [❌ Cancel]                    │
└──────────────────────────────────────────────────────┘
```

### 💱 **Multi-Currency Support**
```
┌─ Multi-Currency Order ───────────────────────────────┐
│                                                      │
│ Customer: International Shoe Store                   │
│ Base Currency: USD                                   │
│                                                      │
│ Currency Settings:                                   │
│ Order Currency: [USD ▼]                             │
│ Exchange Rate: 1 USD = 15,420 IDR                  │
│ Rate Date: 03/08/2025                               │
│                                                      │
│ Price Display:                                       │
│ [●] Show both currencies                            │
│ [○] Show order currency only                        │
│                                                      │
│ Payment Terms:                                       │
│ • Payment in: [USD ▼]                               │
│ • Bank Account: [USD Account - Bank XYZ]            │
│ • Exchange Risk: [Customer bears ▼]                 │
│                                                      │
│ Order Total:                                         │
│ USD $2,110.45 (IDR Rp 32,542,739)                  │
└──────────────────────────────────────────────────────┘
```

---

## 🏆 **Best Practices**

### ✅ **Do's**
1. **Verify Stock**: Selalu check stock availability sebelum confirm order
2. **Customer Credit**: Monitor credit limit dan payment history
3. **Order Accuracy**: Double-check item details dan quantities
4. **Communication**: Keep customer informed tentang status order
5. **Documentation**: Maintain complete records untuk audit trail

### ❌ **Don'ts**
1. **Oversell**: Jangan confirm order jika stock tidak cukup
2. **Skip Approval**: Jangan bypass approval untuk large orders
3. **Delayed Processing**: Jangan tunda processing order terlalu lama
4. **Poor Communication**: Jangan biarkan customer tidak terinformasi
5. **Incomplete Data**: Jangan skip informasi penting dalam order

---

## 🆘 **Troubleshooting**

### ❗ **Common Issues**

#### 📦 **Stock Tidak Cukup**
**Symptoms**: Error saat confirm order
**Solutions**:
1. Check available stock di inventory
2. Partial delivery dengan customer approval
3. Request stock transfer dari warehouse lain
4. Adjust order quantity sesuai stock

#### 💳 **Credit Limit Exceeded**
**Symptoms**: Warning credit limit terlampaui
**Solutions**:
1. Request payment untuk outstanding invoice
2. Increase credit limit dengan management approval
3. Cash on delivery untuk order ini
4. Partial order sesuai available credit

### 📞 **Support Contact**
- **Sales Team**: sales@malaka-erp.com
- **Customer Service**: cs@malaka-erp.com
- **Technical Support**: support@malaka-erp.com

---

## 📚 **Panduan Terkait**

### 🔗 **Related Guides**
- [Customer Management](../04-master-data/customers.md)
- [Inventory Control](../05-inventory/stock-control.md)
- [Invoice & Billing](./invoicing.md)
- [Accounts Receivable](../07-finance/receivables-payables.md)

### 🎓 **Training Materials**
- **Video**: Sales Order Process Walkthrough
- **Template**: Sales Order SOP Template
- **Best Practices**: Sales Excellence Guide

---

**Sales Order yang dikelola dengan baik adalah kunci kepuasan customer dan pertumbuhan bisnis!** 💰✨