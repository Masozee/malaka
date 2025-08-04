# Frontend Path Analysis

## Routes with BOTH List and Detail Pages

### HR Module
- **List**: `/hr/employees/page.tsx`
- **Detail**: `/hr/employees/[id]/page.tsx`
- **Edit**: `/hr/employees/[id]/edit/page.tsx`
- **New**: `/hr/employees/new/page.tsx`

### Accounting Module
- **List**: `/accounting/journal/page.tsx`
- **Detail**: `/accounting/journal/[id]/page.tsx`

### Production Module
- **Suppliers**: List (`/production/suppliers/page.tsx`) + Detail (`/production/suppliers/[id]/page.tsx`)
- **Quality Control**: List (`/production/quality-control/page.tsx`) + Detail (`/production/quality-control/[id]/page.tsx`)
- **Warehouses**: List (`/production/warehouses/page.tsx`) + Detail (`/production/warehouses/[id]/page.tsx`)
- **Work Orders**: List (`/production/work-orders/page.tsx`) + Detail (`/production/work-orders/[id]/page.tsx`)
- **Purchase Orders**: List (`/production/purchase-orders/page.tsx`) + Detail (`/production/purchase-orders/[id]/page.tsx`)

## Routes with ONLY List Pages

### Master Data
- Companies, Articles, Colors, Users, Customers, Divisions, Dept Stores, Barcodes, Prices, Gallery Images

### Sales
- POS, Online, Orders, Direct, Returns, Consignment, Promotions, Targets, Competitors, Reconciliation

### Inventory
- Stock Control, Goods Receipt, Goods Issue, Stock Transfer, Adjustments, Return Supplier, Barcode Print

### Accounting
- General Ledger, Invoices, Fixed Assets, Cash Bank, Currency, Cost Centers, Trial Balance

### HR
- Payroll (with sub-pages: Process, Settings, History), Attendance, Leave, Performance, Training, SPG Stores

### Others
- All Shipping, Procurement, Products, Reports, Profile, Settings modules

## Summary
- **6 modules** have both list and detail pages
- **60+ routes** have only list pages

## Complete Frontend Page Structure

```
frontend/src/app/
├── page.tsx (Root/Home)
├── dashboard/page.tsx
├── calendar/page.tsx
├── master-data/
│   ├── page.tsx
│   ├── companies/page.tsx
│   ├── articles/page.tsx
│   ├── colors/page.tsx
│   ├── users/page.tsx
│   ├── customers/page.tsx
│   ├── divisions/page.tsx
│   ├── depstores/page.tsx
│   ├── barcodes/page.tsx
│   ├── prices/page.tsx
│   └── gallery-images/page.tsx
├── products/
│   ├── classifications/page.tsx
│   ├── models/page.tsx
│   └── sizes/page.tsx
├── sales/
│   ├── dashboard/page.tsx
│   ├── reports/page.tsx
│   ├── pos/page.tsx
│   ├── online/page.tsx
│   ├── orders/page.tsx
│   ├── direct/page.tsx
│   ├── returns/page.tsx
│   ├── consignment/page.tsx
│   ├── promotions/page.tsx
│   ├── targets/page.tsx
│   ├── competitors/page.tsx
│   └── reconciliation/page.tsx
├── inventory/
│   ├── page.tsx
│   ├── stock-control/page.tsx
│   ├── goods-receipt/page.tsx
│   ├── goods-issue/page.tsx
│   ├── stock-transfer/page.tsx
│   ├── adjustments/page.tsx
│   ├── return-supplier/page.tsx
│   └── barcode-print/page.tsx
├── production/
│   ├── page.tsx
│   ├── suppliers/
│   │   ├── page.tsx (LIST)
│   │   └── [id]/page.tsx (DETAIL)
│   ├── quality-control/
│   │   ├── page.tsx (LIST)
│   │   └── [id]/page.tsx (DETAIL)
│   ├── warehouses/
│   │   ├── page.tsx (LIST)
│   │   └── [id]/page.tsx (DETAIL)
│   ├── work-orders/
│   │   ├── page.tsx (LIST)
│   │   └── [id]/page.tsx (DETAIL)
│   ├── purchase-orders/
│   │   ├── page.tsx (LIST)
│   │   └── [id]/page.tsx (DETAIL)
│   ├── material-planning/page.tsx
│   └── analytics/page.tsx
├── shipping/
│   ├── couriers/page.tsx
│   ├── management/page.tsx
│   ├── airwaybill/page.tsx
│   ├── outbound/page.tsx
│   ├── manifest/page.tsx
│   └── invoices/page.tsx
├── accounting/
│   ├── general-ledger/page.tsx
│   ├── journal/
│   │   ├── page.tsx (LIST)
│   │   └── [id]/page.tsx (DETAIL)
│   ├── invoices/page.tsx
│   ├── fixed-assets/page.tsx
│   ├── cash-bank/page.tsx
│   ├── currency/page.tsx
│   ├── cost-centers/page.tsx
│   └── trial-balance/page.tsx
├── hr/
│   ├── page.tsx
│   ├── employees/
│   │   ├── page.tsx (LIST)
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx (DETAIL)
│   │       └── edit/page.tsx
│   ├── payroll/
│   │   ├── page.tsx
│   │   ├── process/page.tsx
│   │   ├── settings/page.tsx
│   │   └── history/page.tsx
│   ├── attendance/page.tsx
│   ├── leave/page.tsx
│   ├── performance/page.tsx
│   ├── training/page.tsx
│   └── spg-stores/page.tsx
├── procurement/
│   ├── suppliers/page.tsx
│   ├── purchase-requests/page.tsx
│   ├── purchase-orders/page.tsx
│   ├── rfq/page.tsx
│   ├── vendor-evaluation/page.tsx
│   ├── contracts/page.tsx
│   └── analytics/page.tsx
├── reports/
│   ├── dashboard/page.tsx
│   ├── sales/page.tsx
│   └── inventory/page.tsx
├── profile/
│   ├── page.tsx
│   └── settings/page.tsx
└── settings/
    ├── web/page.tsx
    ├── api/page.tsx
    └── tools/page.tsx
```