# Malaka ERP

A backend ERP system for YONGKI KOMALADI.

## Overview

This project is a comprehensive ERP system built with Go, following a strict Clean Architecture pattern. It covers various business domains such as master data, inventory, sales, finance, and shipping. The development process emphasizes Test-Driven Development (TDD) and robust security practices.

## Technology Stack

- **Language:** Go
- **Framework:** Gin
- **Database:** PostgreSQL
- **Containerization:** Docker
- **Migration Tool:** Goose
- **Caching:** Redis

## Architecture

The project adheres to Clean Architecture principles, separating concerns into distinct layers:

-   **Domain Layer (`domain/`):** Contains core business entities, repository interfaces, and domain services.
-   **Infrastructure Layer (`infrastructure/`):** Handles persistence (database) and external service integrations.
-   **Presentation Layer (`presentation/`):** Manages HTTP handlers, DTOs, and routing.
-   **Shared (`shared/`):** Provides cross-cutting concerns like authentication, logging, and database connections.

Modules are organized under `internal/modules/` (e.g., `masterdata`, `inventory`, `sales`).

## Implemented Modules and Features

### Accounting Module (`internal/modules/accounting`)

The accounting module provides core financial functionalities, including:

-   [x] **Chart of Accounts:** Define and manage the hierarchical structure of financial accounts.
    -   `GET/POST/PUT/DELETE /api/accounting/chart-of-accounts`
-   [x] **General Ledger:** Maintain a complete record of all financial transactions.
    -   `GET/POST/PUT/DELETE /api/accounting/general-ledger/`
    -   `GET /api/accounting/general-ledger/account/:account_id`
    -   `GET /api/accounting/general-ledger/account/:account_id/balance`
    -   `GET /api/accounting/general-ledger/account/:account_id/report`
    -   `POST /api/accounting/general-ledger/account/:account_id/recalculate`
    -   `GET /api/accounting/general-ledger/company/:company_id`
-   [x] **Journal Entry:** Record financial transactions in the general ledger.
    -   `GET/POST/PUT/DELETE /api/accounting/journal-entries/`
    -   `POST /api/accounting/journal-entries/:id/post`
    -   `POST /api/accounting/journal-entries/:id/reverse`
    -   `POST /api/accounting/journal-entries/:id/lines`
    -   `GET /api/accounting/journal-entries/status`
    -   `GET /api/accounting/journal-entries/date-range`
    -   `GET /api/accounting/journal-entries/company/:company_id`
    -   `GET /api/accounting/journal-entries/company/:company_id/unposted`
    -   `GET /api/accounting/journal-entries/register`
-   [x] **Financial Statements:** Generate and manage balance sheets, income statements, and cash flow statements.
    -   `GET /api/accounting/financial-statements/balance-sheet/:company_id/:as_of_date`
    -   `GET /api/accounting/financial-statements/income-statement/:company_id/:period_start/:period_end`
    -   `GET /api/accounting/financial-statements/cash-flow-statement/:company_id/:period_start/:period_end`
    -   `GET /api/accounting/financial-statements/balance-sheet/history/:company_id/:from_date/:to_date`
    -   `GET /api/accounting/financial-statements/income-statement/history/:company_id/:from_date/:to_date`
    -   `GET /api/accounting/financial-statements/cash-flow-statement/history/:company_id/:from_date/:to_date`
    -   `GET /api/accounting/financial-statements/balance-sheet/latest/:company_id`
    -   `GET /api/accounting/financial-statements/income-statement/latest/:company_id`
    -   `GET /api/accounting/financial-statements/cash-flow-statement/latest/:company_id`
    -   `GET /api/accounting/financial-statements/export/balance-sheet/pdf/:id`
    -   `GET /api/accounting/financial-statements/export/income-statement/pdf/:id`
    -   `GET /api/accounting/financial-statements/export/cash-flow-statement/pdf/:id`
-   [x] **Budget Management:** Create, manage, and track budgets.
    -   `GET/POST/PUT/DELETE /api/accounting/budgets`
    -   `GET /api/accounting/budgets/:id`
    -   `GET /api/accounting/budgets/code/:budget_code`
    -   `GET /api/accounting/budgets/type/:budget_type`
    -   `GET /api/accounting/budgets/status/:status`
    -   `GET /api/accounting/budgets/fiscal-year/:company_id/:fiscal_year`
    -   `GET /api/accounting/budgets/period/:company_id/:start_date/:end_date`
    -   `GET /api/accounting/budgets/company/:company_id`
    -   `GET /api/accounting/budgets/active/company/:company_id`
    -   `GET /api/accounting/budgets/current/:company_id/:budget_type`
    -   `POST /api/accounting/budgets/:id/activate`
    -   `POST /api/accounting/budgets/:id/close`
    -   `PUT /api/accounting/budgets/:id/revise`
    -   `GET /api/accounting/budgets/:id/comparison/:as_of_date`
    -   `POST /api/accounting/budgets/:id/update-actuals`
    -   `GET /api/accounting/budgets/variance-report/:company_id/:budget_type/:as_of_date`
    -   `GET /api/accounting/budgets/:id/utilization`
    -   `GET /api/accounting/budgets/:id/performance/:company_id/:fiscal_year`
    -   `POST /api/accounting/budgets/with-lines`
    -   `PUT /api/accounting/budgets/with-lines`
    -   `GET /api/accounting/budgets/history/:company_id/:account_id`
    -   `GET /api/accounting/budgets/quarterly/:company_id/:fiscal_year`
    -   `POST /api/accounting/budgets/:id/forecast`
    -   `GET /api/accounting/budgets/year-over-year/:company_id/:budget_type/:current_year/:previous_year`
-   [x] **Cost Center Management:** Organize and track costs by specific departments or projects.
    -   `GET/POST/PUT/DELETE /api/accounting/cost-centers`
    -   `GET /api/accounting/cost-centers/:id`
    -   `GET /api/accounting/cost-centers/code/:code`
    -   `GET /api/accounting/cost-centers/type/:type`
    -   `GET /api/accounting/cost-centers/manager/:manager_id`
    -   `GET /api/accounting/cost-centers/parent/:parent_id`
    -   `GET /api/accounting/cost-centers/root/:company_id`
    -   `GET /api/accounting/cost-centers/company/:company_id`
    -   `GET /api/accounting/cost-centers/active/company/:company_id`
    -   `GET /api/accounting/cost-centers/hierarchy/:company_id`
    -   `GET /api/accounting/cost-centers/active/:company_id/:date`
    -   `POST /api/accounting/cost-centers/:id/deactivate`
    -   `POST /api/accounting/cost-centers/:id/reactivate`
    -   `POST /api/accounting/cost-centers/allocations`
    -   `GET /api/accounting/cost-centers/allocations/:id`
    -   `GET /api/accounting/cost-centers/allocations/cost-center/:cost_center_id`
    -   `PUT /api/accounting/cost-centers/allocations/:id`
    -   `DELETE /api/accounting/cost-centers/allocations/:id`
    -   `GET /api/accounting/cost-centers/allocations/active/:cost_center_id/:date`
    -   `GET /api/accounting/cost-centers/allocations/period/:cost_center_id/:start_date/:end_date`
    -   `POST /api/accounting/cost-centers/allocations/process-all/:cost_center_id/:period`
    -   `GET /api/accounting/cost-centers/report/:cost_center_id/:start_date/:end_date`
    -   `GET /api/accounting/cost-centers/performance/:company_id/:start_date/:end_date`
    -   `GET /api/accounting/cost-centers/variance-report/:cost_center_id/:period`
    -   `PUT /api/accounting/cost-centers/:cost_center_id/budget-amounts`
    -   `PUT /api/accounting/cost-centers/:cost_center_id/actual-amounts/:period_start/:period_end`
    -   `GET /api/accounting/cost-centers/:cost_center_id/budget-vs-actual/:period`
    -   `GET /api/accounting/cost-centers/:cost_center_id/allocated-costs/:period`
    -   `GET /api/accounting/cost-centers/:cost_center_id/direct-costs/:start_date/:end_date`
    -   `GET /api/accounting/cost-centers/:cost_center_id/indirect-costs/:start_date/:end_date`
    -   `GET /api/accounting/cost-centers/:cost_center_id/total-costs/:start_date/:end_date`
    -   `GET /api/accounting/cost-centers/:parent_id/children`
    -   `GET /api/accounting/cost-centers/:parent_id/descendants`
    -   `GET /api/accounting/cost-centers/:cost_center_id/path`
    -   `GET /api/accounting/cost-centers/:cost_center_id/level`
    -   `POST /api/accounting/cost-centers/validate-hierarchy`
    -   `POST /api/accounting/cost-centers/validate-allocation`
    -   `GET /api/accounting/cost-centers/:cost_center_id/circular-reference/:parent_id`
    -   `GET /api/accounting/cost-centers/:cost_center_id/efficiency/:period`
    -   `POST /api/accounting/cost-centers/compare-cost-centers/:start_date/:end_date`
    -   `GET /api/accounting/cost-centers/top-performing/:company_id/:period`
    -   `GET /api/accounting/cost-centers/underperforming/:company_id/:period`
    -   `POST /api/accounting/cost-centers/:cost_center_id/validate-allocation-percentages/:period`
    -   `POST /api/accounting/cost-centers/process-monthly-allocations/:company_id/:period`
    -   `POST /api/accounting/cost-centers/:cost_center_id/recalculate-allocations/:period`
    -   `POST /api/accounting/cost-centers/hierarchy`
    -   `PUT /api/accounting/cost-centers/:cost_center_id/move/:new_parent_id`
    -   `PUT /api/accounting/cost-centers/merge/:source_cost_center_id/:target_cost_center_id`
    -   `POST /api/accounting/cost-centers/:cost_center_id/split`
-   [x] **Currency Settings:** Configure and manage various currency settings.
    -   `GET/POST/PUT/DELETE /api/accounting/currency-settings`
    -   `GET /api/accounting/currency-settings/:id`
    -   `GET /api/accounting/currency-settings/company/:company_id`
    -   `GET /api/accounting/currency-settings/active/company/:company_id`
    -   `GET /api/accounting/currency-settings/base/company/:company_id`
    -   `POST /api/accounting/currency-settings/:id/set-base`
    -   `PUT /api/accounting/currency-settings/:id/exchange-rate`
    -   `GET /api/accounting/currency-settings/convert?amount=:amount&from=:fromCurrencyID&to=:toCurrencyID`
    -   `GET /api/accounting/currency-settings/:id/exchange-rate-history`
    -   `GET /api/accounting/currency-settings/:id/latest-exchange-rate`
-   [x] **Trial Balance:** Generate a summary of all ledger accounts to verify the equality of debits and credits.
    -   `GET/POST/PUT/DELETE /api/accounting/trial-balances`
    -   `GET /api/accounting/trial-balances/:id`
    -   `GET /api/accounting/trial-balances/company/:company_id`
    -   `GET /api/accounting/trial-balances/period/:company_id/:period_start/:period_end`
    -   `POST /api/accounting/trial-balances/generate`
    -   `GET /api/accounting/trial-balances/summary/:company_id`
    -   `GET /api/accounting/trial-balances/export/csv/:id`
    -   `GET /api/accounting/trial-balances/export/excel/:id`

### Finance Module (`internal/modules/finance`)

The finance module handles various financial transactions and processes, including:

-   [x] **Accounts Payable:** Manage and track money owed by the company to its suppliers.
    -   `GET/POST/PUT/DELETE /finance/accounts-payable`
-   [x] **Accounts Receivable:** Manage and track money owed to the company by its customers.
    -   `GET/POST/PUT/DELETE /finance/accounts-receivable`
-   [x] **Bank Transfer:** Facilitate and record transfers between bank accounts.
    -   `GET/POST/PUT/DELETE /finance/bank-transfers`
-   [x] **Cash Bank:** Manage cash and bank account transactions.
    -   `GET/POST/PUT/DELETE /finance/cash-banks`
-   [x] **Cash Book:** Record all cash receipts and payments.
    -   `GET/POST/PUT/DELETE /finance/cash-book`
    -   `GET /finance/cash-book/cash-bank/:cash_bank_id`
    -   `GET /finance/cash-book/type/:type`
    -   `GET /finance/cash-book/balance/:cash_bank_id`
    -   `POST /finance/cash-book/recalculate/:cash_bank_id`
-   [x] **Cash Disbursement:** Process and record cash payments made by the company.
    -   `GET/POST/PUT/DELETE /finance/cash-disbursements`
-   [x] **Cash Opening Balance:** Set and manage the initial cash balance.
    -   `GET/POST/PUT/DELETE /finance/cash-opening-balances`
-   [x] **Cash Receipt:** Process and record cash received by the company.
    -   `GET/POST/PUT/DELETE /finance/cash-receipts`
-   [x] **Check Clearance:** Manage the process of clearing checks.
    -   `GET/POST/PUT/DELETE /finance/check-clearance`
    -   `GET /finance/check-clearance/status/:status`
    -   `GET /finance/check-clearance/incoming`
    -   `GET /finance/check-clearance/outgoing`
    -   `POST /finance/check-clearance/:id/clear`
    -   `POST /finance/check-clearance/:id/bounce`
-   [x] **Expenditure Request:** Handle requests for expenditures.
    -   `GET/POST/PUT/DELETE /finance/expenditure-requests`
    -   `GET /finance/expenditure-requests/status/:status`
    -   `POST /finance/expenditure-requests/:id/approve`
    -   `POST /finance/expenditure-requests/:id/reject`
    -   `POST /finance/expenditure-requests/:id/disburse`
-   [x] **Invoice:** Generate and manage invoices for goods or services.
    -   `GET/POST/PUT/DELETE /finance/invoices`
-   [x] **Monthly Closing:** Perform month-end financial closing procedures.
    -   `GET/POST/PUT/DELETE /finance/monthly-closing`
    -   `GET /finance/monthly-closing/period/:month/:year`
    -   `GET /finance/monthly-closing/open`
    -   `POST /finance/monthly-closing/:id/close`
    -   `POST /finance/monthly-closing/:id/lock`
    -   `POST /finance/monthly-closing/:id/unlock`
-   [x] **Payment:** Process and record various types of payments.
    -   `GET/POST/PUT/DELETE /finance/payments`
-   [x] **Purchase Voucher:** Manage vouchers related to purchases.
    -   `GET/POST/PUT/DELETE /finance/purchase-vouchers`
    -   `GET /finance/purchase-vouchers/status/:status`
    -   `POST /finance/purchase-vouchers/:id/approve`

### Inventory Module (`internal/modules/inventory`)

The inventory module manages stock levels and movements, including:

-   [x] **Draft Order:** Complete CRUD operations
    -   `GET/POST/PUT/DELETE /inventory/draft-orders`
-   [x] **Goods Issue:** Record the issuance of goods from inventory.
    -   `GET/POST/PUT/DELETE /inventory/goods-issues`
-   [x] **Goods Receipt:** Record the receipt of goods into inventory.
    -   `GET/POST/PUT/DELETE /inventory/goods-receipts`
-   [x] **Purchase Order:** Manage the creation and tracking of purchase orders.
    -   `GET/POST/PUT/DELETE /inventory/purchase-orders`
-   [x] **Return Supplier:** Handle the process of returning goods to suppliers.
    -   `GET/POST/PUT/DELETE /inventory/return-suppliers`
-   [x] **Simple Goods Issue:** A simplified process for issuing goods.
    -   `GET/POST/PUT/DELETE /inventory/goods-issues` (Note: This might be a duplicate entry with the general Goods Issue, but I'm following the checklist's implied structure)
-   [x] **Stock Adjustment:** Adjust stock levels due to discrepancies.
    -   `GET/POST/PUT/DELETE /inventory/adjustments`
-   [x] **Stock Balance:** View and manage current stock balances.
    -   `GET /inventory/stock/balance`
-   [x] **Stock Movement:** Track all movements of stock within the inventory.
    -   `POST /inventory/stock/movements`
    -   `GET /inventory/stock/movements`
-   [x] **Stock Opname:** Conduct physical inventory counts and reconcile with records.
    -   `GET/POST/PUT/DELETE /inventory/opnames`
-   [x] **Transfer Order/Item:** Manage the transfer of stock between locations.
    -   `GET/POST/PUT/DELETE /inventory/transfers`

### Master Data Module (`internal/modules/masterdata`)

The master data module handles core reference data for the ERP system, including:

-   [x] **Article:** Manage product articles and their details.
    -   `GET/POST/PUT/DELETE /masterdata/articles`
-   [x] **Barcode:** Manage barcode information for products.
    -   `GET/POST/PUT/DELETE /masterdata/barcodes`
-   [x] **Classification:** Organize products and other entities into classifications.
    -   `GET/POST/PUT/DELETE /masterdata/classifications`
-   [x] **Color:** Manage color definitions.
    -   `GET/POST/PUT/DELETE /masterdata/colors`
-   [x] **Company:** Manage company information.
    -   `GET/POST/PUT/DELETE /masterdata/companies`
-   [x] **Courier Rate:** Manage rates for courier services.
    -   `GET/POST/PUT/DELETE /masterdata/courier-rates`
-   [x] **Customer:** Manage customer information.
    -   `GET/POST/PUT/DELETE /masterdata/customers`
-   [x] **Depstore:** Manage department store information.
    -   `GET/POST/PUT/DELETE /masterdata/depstores`
    -   `GET /masterdata/depstores/code/:code`
-   [x] **Division:** Manage organizational divisions.
    -   `GET/POST/PUT/DELETE /masterdata/divisions`
    -   `GET /masterdata/divisions/code/:code`
    -   `GET /masterdata/divisions/parent/:parentId`
    -   `GET /masterdata/divisions/root`
-   [x] **Gallery Image:** Manage product and other gallery images.
    -   `GET/POST/PUT/DELETE /masterdata/gallery-images`
    -   `GET /masterdata/gallery-images/article/:article_id`
-   [x] **Model:** Manage product models.
    -   `GET/POST/PUT/DELETE /masterdata/models`
-   [x] **Price:** Manage product pricing.
    -   `GET/POST/PUT/DELETE /masterdata/prices`
-   [x] **Size:** Manage product sizes.
    -   `GET/POST/PUT/DELETE /masterdata/sizes`
-   [x] **Supplier:** Manage supplier information.
    -   `GET/POST/PUT/DELETE /masterdata/suppliers`
-   [x] **User:** Manage user accounts and roles.
    -   `GET/POST/PUT/DELETE /masterdata/users`
    -   `POST /masterdata/users/login`
-   [x] **Warehouse:** Manage warehouse locations and details.
    -   `GET/POST/PUT/DELETE /masterdata/warehouses`

### Sales Module (`internal/modules/sales`)

The sales module manages various sales-related processes, including:

-   [x] **Consignment Sales:** Handle sales of goods on consignment.
    -   `GET/POST/PUT/DELETE /sales/consignment-sales`
-   [x] **Online Order:** Process and manage online sales orders.
    -   `GET/POST/PUT/DELETE /sales/online-orders`
-   [x] **POS Transaction:** Manage Point of Sale transactions.
    -   `GET/POST/PUT/DELETE /sales/pos-transactions`
-   [x] **Promotion:** Manage sales promotions and discounts.
    -   `GET/POST/PUT/DELETE /sales/promotions`
-   [x] **Proses Margin:** Calculate and analyze sales margins.
    -   `GET/POST/PUT/DELETE /sales/proses-margins`
-   [x] **Sales Invoice:** Generate and manage sales invoices.
    -   `GET/POST/PUT/DELETE /sales/invoices`
-   [x] **Sales Kompetitor:** Track and analyze competitor sales data.
    -   `GET/POST/PUT/DELETE /sales/kompetitors`
-   [x] **Sales Order:** Manage the creation and fulfillment of sales orders.
    -   `GET/POST/PUT/DELETE /sales/orders`
-   [x] **Sales Rekonsiliasi:** Reconcile sales data.
    -   `GET/POST/PUT/DELETE /sales/rekonsiliasi`
-   [x] **Sales Return:** Process and manage customer returns.
    -   `GET/POST/PUT/DELETE /sales/returns`
-   [x] **Sales Target:** Set and track sales targets.
    -   `GET/POST/PUT/DELETE /sales/targets`

### Shipping Module (`internal/modules/shipping`)

The shipping module handles logistics and delivery processes, including:

-   [x] **Airwaybill:** Manage airway bills for shipments.
    -   `GET/POST/PUT/DELETE /shipping/airwaybills`
-   [x] **Courier:** Manage courier information and services.
    -   `GET/POST/PUT/DELETE /shipping/couriers`
-   [x] **Manifest:** Generate and manage shipping manifests.
    -   `GET/POST/PUT/DELETE /shipping/manifests`
-   [x] **Outbound Scan:** Record outbound scans for packages.
    -   `POST /shipping/outbound-scans/`
    -   `GET /shipping/outbound-scans/:id`
    -   `GET /shipping/outbound-scans/shipment/:shipment_id`
-   [x] **Shipment:** Manage overall shipment details.
    -   `GET/POST/PUT/DELETE /shipping/shipments`
-   [x] **Shipping Invoice:** Generate invoices for shipping services.
    -   `GET/POST/PUT/DELETE /shipping/invoices`
    -   `GET /shipping/invoices/number/:invoice_number`
    -   `GET /shipping/invoices/shipment/:shipment_id`
    -   `GET /shipping/invoices/courier/:courier_id`
    -   `GET /shipping/invoices/status/:status`
    -   `GET /shipping/invoices/overdue`
    -   `POST /shipping/invoices/:id/pay`
-   [x] **Fixed Assets:** Manage and track fixed assets, including depreciation and revaluation.
    -   `GET/POST/PUT/DELETE /api/accounting/fixed-assets`
    -   `GET /api/accounting/fixed-assets/:id`
    -   `POST /api/accounting/fixed-assets/:id/depreciation/:period`
    -   `GET /api/accounting/fixed-assets/:id/depreciation-schedule`
    -   `POST /api/accounting/fixed-assets/depreciation/monthly/:company_id/:month/:year`
    -   `GET /api/accounting/fixed-assets/company/:company_id`
    -   `GET /api/accounting/fixed-assets/category/:company_id/:category`
    -   `GET /api/accounting/fixed-assets/status/:company_id/:status`
    -   `GET /api/accounting/fixed-assets/location/:company_id/:location`
    -   `GET /api/accounting/fixed-assets/acquisition-date-range/:company_id/:start_date/:end_date`
    -   `POST /api/accounting/fixed-assets/:id/dispose`
    -   `POST /api/accounting/fixed-assets/:id/revalue`
    -   `POST /api/accounting/fixed-assets/:id/transfer`
    -   `GET /api/accounting/fixed-assets/register/:company_id`
    -   `GET /api/accounting/fixed-assets/depreciation-report/:company_id/:period_start/:period_end`
    -   `GET /api/accounting/fixed-assets/valuation-report/:company_id/:as_of_date`
    -   `GET /api/accounting/fixed-assets/summary/:company_id`
    -   `GET /api/accounting/fixed-assets/:id/audit-trail`
    -   `GET /api/accounting/fixed-assets/integrity/:company_id`

## Getting Started

### Prerequisites

-   Go (latest stable version)
-   Docker and Docker Compose
-   PostgreSQL client (optional, for direct database interaction)
-   `make` utility

### Database Configuration

-   **Driver:** PostgreSQL
-   **User:** `postgres`
-   **Password:** `TanahAbang1971`
-   **DB Name:** `malaka`
-   **Connection String:** `postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable`
-   **Migration Path:** `./internal/pkg/database/migrations`

### Local Development

1.  **Create an environment file:**
    ```bash
    cp .env.example .env
    ```
2.  **Update `.env`** with your specific environment variables, especially `DB_PASSWORD` and `REDIS_PASSWORD` if they differ from defaults.

3.  **Start the full Docker environment (recommended):**
    ```bash
    make docker-up
    ```
    This will build and start all services (PostgreSQL, Redis, Malaka App, Nginx).

4.  **Run database migrations:**
    ```bash
    make migrate_up
    ```

5.  **Access the application:**
    The Malaka App will be accessible via Nginx, typically on `http://localhost` (or port 80/443 if configured).

### Development Commands

Use the `Makefile` for common development tasks:

-   **Build the application:**
    ```bash
    make build
    ```

-   **Clean build artifacts:**
    ```bash
    make clean
    ```

-   **Run the application (builds and starts):**
    ```bash
    make run
    ```

-   **Run tests:**
    ```bash
    make test
    ```
    For verbose output and race detection:
    ```bash
    go test ./... -v -race
    ```

-   **Run database migrations up:**
    ```bash
    make migrate_up
    ```

-   **Rollback database migrations:**
    ```bash
    make migrate_down
    ```

### Docker Environment Commands

-   **Start all services with Docker:**
    ```bash
    make docker-up
    ```

-   **Stop all services:**
    ```bash
    make docker-down
    ```

-   **View application logs:**
    ```bash
    make docker-app-logs
    ```

-   **Reset database with seed data:**
    ```bash
    make docker-db-reset
    ```

## Security

-   **Authentication:** JWT with bcrypt for password hashing.
-   **Authorization:** Role-Based Access Control (RBAC).
-   **API Security:** Input validation and sanitization to prevent common vulnerabilities like SQL injection.
-   **Secrets Management:** Environment variables (`app.env`) or secrets manager.

## Contributing

We welcome contributions to the Malaka ERP project! Please adhere to the following guidelines:

-   **Test-Driven Development (TDD):** All new features and bug fixes should be accompanied by comprehensive tests written before the implementation.
-   **Clean Architecture:** Maintain the established Clean Architecture and module structure.
-   **Indonesian Dummy Data:** When implementing new features that require seed data, ensure you create realistic Indonesian dummy data in `./internal/pkg/database/seeds/`.
