# Malaka ERP - System Requirements Specification (SRS)

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Navigation Structure](#navigation-structure)
4. [Functional Requirements](#functional-requirements)
5. [Technical Specifications](#technical-specifications)
6. [User Interface Requirements](#user-interface-requirements)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [System Features](#system-features)

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the Malaka ERP (Enterprise Resource Planning) system, designed specifically for shoe manufacturing and retail businesses. The system provides comprehensive business management capabilities through a modern web-based interface.

### 1.2 Scope
The Malaka ERP system encompasses all major business operations including master data management, inventory control, sales management, production planning, accounting, human resources, and reporting.

### 1.3 Document Conventions
- **Priority Levels**: High, Medium, Low
- **Status**: ✅ Completed, 🚧 In Progress, 📋 Planned
- **User Roles**: Admin, Manager, Employee, Guest

## 2. System Overview

### 2.1 Architecture
- **Frontend**: Next.js 15.4.2 with TypeScript and Tailwind CSS
- **Backend**: Go 1.21+ with Clean Architecture
- **Database**: PostgreSQL 13+ with migration system
- **Authentication**: JWT-based security
- **API**: RESTful services with OpenAPI documentation

### 2.2 Target Users
- Business owners and executives
- Department managers
- Inventory specialists
- Sales representatives
- Accounting staff
- HR personnel
- Production planners

## 3. Navigation Structure

### 3.1 Two-Level Sidebar Navigation System

#### First Level Sidebar (Main Modules - 48px width)
The primary navigation provides access to major business modules:

1. **Dashboard** 🏠
   - **Route**: `/dashboard`
   - **Purpose**: Central overview of business metrics and KPIs

2. **Calendar** 📅
   - **Route**: `/calendar`
   - **Purpose**: Event and meeting management system

3. **Master Data** 🗄️
   - **Submenus**: 5 items
   - **Purpose**: Core business data management

4. **Products** 👕
   - **Submenus**: 8 items
   - **Purpose**: Product catalog and specifications

5. **Sales** 🛒
   - **Submenus**: 10 items
   - **Purpose**: Sales operations and customer management

6. **Inventory** 📦
   - **Submenus**: 6 items
   - **Purpose**: Stock control and warehouse management

7. **Production** 🏭
   - **Submenus**: 9 items
   - **Purpose**: Manufacturing and supply chain

8. **Procurement** 🛍️
   - **Submenus**: 7 items
   - **Purpose**: Purchasing and vendor management

9. **Shipping** 🗺️
   - **Submenus**: 6 items
   - **Purpose**: Logistics and delivery management

10. **Accounting** 🧮
    - **Submenus**: 8 items
    - **Purpose**: Financial management and reporting

11. **HR Management** 👥
    - **Submenus**: 7 items
    - **Purpose**: Human resources and payroll

12. **Reporting** 📊
    - **Submenus**: 9 items
    - **Purpose**: Business intelligence and analytics

#### Second Level Sidebar (Detailed Menus - 256px/48px collapsible)

##### Master Data Module (5 items)
- **Companies** (24 records) → `/master-data/companies`
- **Users** (156 records) → `/master-data/users`
- **Customers** (3.3k records) → `/master-data/customers`
- **Divisions** (6 records) → `/master-data/divisions`
- **Dept Stores** (12 records) → `/master-data/depstores`

##### Products Module (8 items)
- **Articles** (2.8k records) → `/master-data/articles`
- **Classifications** (18 records) → `/products/classifications`
- **Colors** (42 records) → `/master-data/colors`
- **Models** (89 records) → `/products/models`
- **Sizes** (28 records) → `/products/sizes`
- **Barcodes** → `/master-data/barcodes`
- **Prices** (1.5k records) → `/master-data/prices`
- **Gallery** (456 records) → `/master-data/gallery-images`

##### Sales Module (10 items)
- **Point of Sale** (142 records) → `/sales/pos`
- **Online Sales** (789 records) → `/sales/online`
- **Direct Sales** (234 records) → `/sales/direct`
- **Sales Orders** (567 records) → `/sales/orders`
- **Returns** (23 records) → `/sales/returns`
- **Consignment** (45 records) → `/sales/consignment`
- **Promotions** (8 records) → `/sales/promotions`
- **Sales Targets** → `/sales/targets`
- **Competitors** → `/sales/competitors`
- **Reconciliation** (12 records) → `/sales/reconciliation`

##### Inventory Module (6 items)
- **Stock Control** (1.2k records) → `/inventory/stock-control`
- **Goods Receipt** (34 records) → `/inventory/goods-receipt`
- **Stock Transfer** (16 records) → `/inventory/stock-transfer`
- **Goods Issue** (78 records) → `/inventory/goods-issue`
- **Adjustments** (5 records) → `/inventory/adjustments`
- **Stock Opname** (3 records) → `/inventory/stock-opname`

##### Production Module (9 items)
- **Suppliers** (67 records) → `/production/suppliers`
- **Warehouses** (8 records) → `/production/warehouses`
- **Purchase Orders** (89 records) → `/production/purchase-orders`
- **Work Orders** (45 records) → `/production/work-orders`
- **Quality Control** (12 records) → `/production/quality-control`
- **Material Planning** (15 records) → `/production/material-planning`
- **Analytics** → `/production/analytics`
- **Return Supplier** (7 records) → `/inventory/return-supplier`
- **Barcode Print** → `/inventory/barcode-print`

##### Procurement Module (7 items)
- **Suppliers** (45 records) → `/procurement/suppliers`
- **Purchase Requests** (23 records) → `/procurement/purchase-requests`
- **Purchase Orders** (67 records) → `/procurement/purchase-orders`
- **RFQ (Quotations)** (12 records) → `/procurement/rfq`
- **Vendor Evaluation** (8 records) → `/procurement/vendor-evaluation`
- **Contracts** (15 records) → `/procurement/contracts`
- **Analytics** → `/procurement/analytics`

##### Shipping Module (6 items)
- **Couriers** (15 records) → `/shipping/couriers`
- **Shipment Management** → `/shipping/management`
- **Airwaybill** → `/shipping/airwaybill`
- **Outbound Scanning** → `/shipping/outbound`
- **Manifest** → `/shipping/manifest`
- **Shipping Invoices** → `/shipping/invoices`

##### Accounting Module (8 items)
- **General Ledger** → `/accounting/general-ledger`
- **Journal Entries** → `/accounting/journal`
- **Trial Balance** → `/accounting/trial-balance`
- **Cash & Bank** → `/accounting/cash-bank`
- **Invoices** → `/accounting/invoices`
- **Cost Centers** → `/accounting/cost-centers`
- **Fixed Assets** → `/accounting/fixed-assets`
- **Currency** → `/accounting/currency`

##### HR Management Module (7 items)
- **Employees** → `/hr/employees`
- **Payroll** → `/hr/payroll`
- **Attendance** → `/hr/attendance`
- **Leave Management** → `/hr/leave`
- **Performance** → `/hr/performance`
- **Training** → `/hr/training`
- **SPG Stores** → `/hr/spg-stores`

##### Reporting Module (9 items)
- **BI Dashboard** → `/reports/dashboard`
- **Sales Reports** → `/reports/sales`
- **Inventory Reports** → `/reports/inventory`
- **Financial Reports** → `/reports/financial`
- **Production Reports** → `/reports/production`
- **HR Reports** → `/reports/hr`
- **Custom Reports** → `/reports/custom`
- **Static Reports** → `/reports/static`
- **OLAP Analysis** → `/reports/olap`

#### Bottom Navigation Section
- **Settings** ⚙️ → `/settings`
- **Notifications** 🔔
- **User Profile** 👤

## 4. Functional Requirements

### 4.1 Authentication System
- **FR-001**: JWT-based user authentication
- **FR-002**: Protected route access control
- **FR-003**: Session management with token refresh
- **FR-004**: User login/logout functionality
- **FR-005**: Demo credentials support (testuser/testpass)

### 4.2 Master Data Management
- **FR-006**: CRUD operations for all master data entities
- **FR-007**: Advanced search and filtering capabilities
- **FR-008**: Data pagination and sorting
- **FR-009**: Bulk operations support
- **FR-010**: Data validation and integrity checks

### 4.3 Inventory Management
- **FR-011**: Real-time stock level tracking
- **FR-012**: Multi-warehouse support
- **FR-013**: Goods receipt and issue workflows
- **FR-014**: Stock transfer between locations
- **FR-015**: Inventory adjustments and auditing

### 4.4 Sales Management
- **FR-016**: Point of sale operations
- **FR-017**: Online sales integration
- **FR-018**: Order management workflow
- **FR-019**: Returns processing
- **FR-020**: Sales reporting and analytics

### 4.5 Calendar System
- **FR-021**: Event creation and management
- **FR-022**: Meeting scheduling
- **FR-023**: Task assignment and tracking
- **FR-024**: Calendar views (monthly, weekly, daily)
- **FR-025**: Holiday management

## 5. Technical Specifications

### 5.1 Frontend Architecture
- **Framework**: Next.js 15.4.2 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4.0 with OKLCH colors
- **UI Components**: Radix UI primitives
- **Build Tool**: Turbopack for development
- **Package Manager**: npm

### 5.2 Backend Architecture
- **Language**: Go 1.21+
- **Framework**: Gorilla Mux for routing
- **Architecture**: Clean Architecture with DDD
- **Database**: PostgreSQL 13+ with migrations
- **Cache**: Redis for session management
- **API**: RESTful with OpenAPI specs

### 5.3 Database Requirements
- **Primary Database**: PostgreSQL 13+
- **Migrations**: Automated schema management
- **Seeding**: Sample data for development
- **Backup**: Automated backup strategies
- **Performance**: Indexing and query optimization

### 5.4 API Specifications
- **Base URL**: `http://localhost:8084`
- **Versioning**: `/api/v1` prefix
- **Format**: JSON request/response
- **Authentication**: Bearer JWT tokens
- **CORS**: Configured for frontend integration

## 6. User Interface Requirements

### 6.1 Design System
- **Color Scheme**: Professional gray palette with OKLCH colors
- **Typography**: Geist Sans and Geist Mono fonts
- **Icons**: Lucide React icon library
- **Spacing**: Consistent 4px grid system
- **Breakpoints**: Mobile-first responsive design

### 6.2 Layout Requirements
- **Two-Level Navigation**: Fixed sidebar with expandable submenu
- **Header System**: Unified header with breadcrumbs and actions
- **Data Tables**: Professional tables with pagination and search
- **Modal Forms**: Create/Edit operations in modal dialogs
- **Theme Support**: Light and dark mode switching

### 6.3 Standardized Page Layout
All list pages must follow this structure:
```
TwoLevelLayout
├── Header (outside grey area)
│   ├── Title and Description
│   ├── Breadcrumbs
│   └── Action Buttons
└── Content Area (flex-1 p-6 space-y-6)
    ├── Summary Cards (max 4 cards)
    ├── Filters (no border)
    ├── View Toggle & Sort
    └── Content (Cards or Table)
```

### 6.4 Component Standards
- **Summary Cards**: Maximum 4 cards with consistent styling
- **Search Filters**: Left-aligned search, right-aligned filters
- **Data Tables**: AdvancedDataTable without Card wrapper
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: Graceful error messages and fallbacks

## 7. Non-Functional Requirements

### 7.1 Performance Requirements
- **Page Load Time**: < 3 seconds for initial load
- **API Response Time**: < 500ms for standard operations
- **Database Queries**: Optimized with proper indexing
- **Bundle Size**: Optimized with code splitting
- **Memory Usage**: Efficient state management

### 7.2 Security Requirements
- **Authentication**: Secure JWT implementation
- **Data Validation**: Client and server-side validation
- **XSS Protection**: Built-in Next.js security features
- **CSRF Protection**: Anti-CSRF measures
- **Input Sanitization**: Prevent injection attacks

### 7.3 Usability Requirements
- **Responsive Design**: Mobile and desktop compatibility
- **Accessibility**: WCAG 2.1 compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Loading Feedback**: Clear loading states
- **Error Messages**: User-friendly error communication

### 7.4 Reliability Requirements
- **Uptime**: 99.9% availability target
- **Error Handling**: Comprehensive error management
- **Data Backup**: Regular automated backups
- **Recovery**: Disaster recovery procedures
- **Monitoring**: System health monitoring

## 8. System Features

### 8.1 Navigation Features
- **Smart Menu Activation**: Auto-detects current page
- **Collapsible Sidebar**: Space-efficient design
- **Count Badges**: Real-time record counts
- **Breadcrumb Navigation**: Clear navigation hierarchy
- **Command Palette**: ⌘K quick access to all features

### 8.2 Data Management Features
- **Advanced Search**: Multi-criteria search capabilities
- **Bulk Operations**: Efficient batch processing
- **Export Functionality**: Data export in multiple formats
- **Import Wizards**: Guided data import processes
- **Audit Trails**: Complete change tracking

### 8.3 UI/UX Features
- **Theme System**: Light/dark mode with system detection
- **Responsive Layout**: Mobile-first design approach
- **Loading States**: Professional loading indicators
- **Error Boundaries**: Graceful error handling
- **Form Validation**: Real-time validation feedback

### 8.4 Integration Features
- **API-First Design**: RESTful API architecture
- **Real-time Updates**: Live data synchronization
- **Third-party Integration**: Extensible integration points
- **Webhook Support**: Event-driven integrations
- **SSO Ready**: Single sign-on preparation

### 8.5 Reporting Features
- **Dashboard Widgets**: Customizable business metrics
- **Report Builder**: Dynamic report creation
- **Data Visualization**: Charts and graphs
- **Scheduled Reports**: Automated report delivery
- **Export Options**: Multiple format support

## 9. Development Status

### 9.1 Completed Features ✅
- **Core Infrastructure**: Layout system, routing, API integration
- **Master Data Module**: Full CRUD operations for all entities
- **Inventory Management**: Complete inventory module implementation
- **Calendar System**: Event management with authentication
- **Accounting Module**: General ledger and journal entries
- **Authentication System**: JWT-based login/logout
- **Theme System**: Light/dark mode implementation
- **Navigation System**: Two-level sidebar with command palette

### 9.2 In Progress Features 🚧
- **Additional Inventory Features**: Transfers, adjustments, stock opname
- **Enhanced Reporting**: Advanced analytics and dashboard widgets
- **API Integration**: Backend service integration for remaining modules

### 9.3 Planned Features 📋
- **Production Module**: Work orders, quality control, material planning
- **Shipping Module**: Logistics and delivery management
- **HR & Payroll**: Employee management and payroll processing
- **Advanced Features**: Real-time updates, offline support
- **Mobile Apps**: React Native applications
- **Workflow Engine**: Customizable business workflows

## 10. Deployment Requirements

### 10.1 Development Environment
- **Frontend**: http://localhost:3000 (hot reload enabled)
- **Backend**: http://localhost:8084
- **Database**: PostgreSQL with Docker Compose
- **Redis**: Session management and caching

### 10.2 Production Environment
- **Container**: Docker-based deployment
- **Web Server**: Nginx reverse proxy
- **SSL**: HTTPS with certificate management
- **Monitoring**: Prometheus and Grafana
- **Logging**: Structured logging with rotation

### 10.3 Infrastructure Requirements
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Memory**: Minimum 4GB RAM, Recommended 8GB+
- **Storage**: SSD with minimum 50GB, Recommended 100GB+
- **Network**: Stable internet connection for API operations
- **Backup**: Daily automated database backups

## 11. Quality Assurance

### 11.1 Testing Requirements
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability assessment

### 11.2 Code Quality Standards
- **TypeScript**: Strict mode enforcement
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Code Reviews**: Mandatory peer reviews
- **Documentation**: Comprehensive code documentation

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-30  
**Prepared By**: Malaka ERP Development Team  
**Status**: Active Development  

This SRS document serves as the comprehensive specification for the Malaka ERP system, covering all functional and non-functional requirements, technical specifications, and implementation details.