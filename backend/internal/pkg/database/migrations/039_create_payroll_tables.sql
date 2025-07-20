-- +goose Up
-- Create payroll module tables

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE NOT NULL,
    birth_date DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    marital_status VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    id_number VARCHAR(50),
    tax_id VARCHAR(50),
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    basic_salary DECIMAL(12,2) DEFAULT 0,
    allowances DECIMAL(12,2) DEFAULT 0,
    employment_status VARCHAR(20) DEFAULT 'ACTIVE',
    supervisor_id UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SPG Stores
CREATE TABLE spg_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    store_code VARCHAR(20) NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    assignment_date DATE NOT NULL,
    end_date DATE,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    target_amount DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SPB SPG (Sales Performance Bonus for SPG)
CREATE TABLE spb_spg (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    actual_sales DECIMAL(15,2) DEFAULT 0,
    achievement_percentage DECIMAL(5,2) DEFAULT 0,
    base_commission DECIMAL(12,2) DEFAULT 0,
    bonus_amount DECIMAL(12,2) DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    calculated_by UUID,
    calculated_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, period_year, period_month)
);

-- Employee Sales
CREATE TABLE employee_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    sale_date DATE NOT NULL,
    store_code VARCHAR(20),
    invoice_number VARCHAR(50),
    customer_code VARCHAR(50),
    total_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    commission_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Loans
CREATE TABLE employee_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    loan_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    remaining_amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    installment_amount DECIMAL(12,2) NOT NULL,
    installment_count INTEGER NOT NULL,
    paid_installments INTEGER DEFAULT 0,
    loan_date DATE NOT NULL,
    first_payment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Deductions
CREATE TABLE employee_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    deduction_type VARCHAR(50) NOT NULL,
    deduction_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(5,2),
    is_recurring BOOLEAN DEFAULT false,
    effective_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary Calculation
CREATE TABLE salary_calculation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances DECIMAL(12,2) DEFAULT 0,
    overtime_amount DECIMAL(12,2) DEFAULT 0,
    commission_amount DECIMAL(12,2) DEFAULT 0,
    bonus_amount DECIMAL(12,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) NOT NULL,
    tax_deduction DECIMAL(12,2) DEFAULT 0,
    insurance_deduction DECIMAL(12,2) DEFAULT 0,
    loan_deduction DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    calculated_by UUID,
    calculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, period_year, period_month)
);

-- Attendance Calculation
CREATE TABLE attendance_calculation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    working_days INTEGER NOT NULL,
    present_days INTEGER DEFAULT 0,
    absent_days INTEGER DEFAULT 0,
    late_days INTEGER DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    leave_days INTEGER DEFAULT 0,
    sick_days INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    overtime_amount DECIMAL(12,2) DEFAULT 0,
    deduction_amount DECIMAL(12,2) DEFAULT 0,
    calculated_by UUID,
    calculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, period_year, period_month)
);

-- Salary Verification Approval
CREATE TABLE salary_verification_approval (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    salary_calculation_id UUID NOT NULL REFERENCES salary_calculation(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    verified_gross_salary DECIMAL(12,2) NOT NULL,
    verified_net_salary DECIMAL(12,2) NOT NULL,
    adjustment_amount DECIMAL(12,2) DEFAULT 0,
    adjustment_reason TEXT,
    verified_by UUID NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'VERIFIED',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary Posting
CREATE TABLE salary_posting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    total_employees INTEGER NOT NULL,
    total_gross_salary DECIMAL(15,2) NOT NULL,
    total_net_salary DECIMAL(15,2) NOT NULL,
    total_deductions DECIMAL(15,2) NOT NULL,
    posting_date DATE NOT NULL,
    journal_number VARCHAR(50),
    posted_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'POSTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period_year, period_month)
);

-- Receivable Notes
CREATE TABLE receivable_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    amount DECIMAL(12,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'OUTSTANDING',
    paid_amount DECIMAL(12,2) DEFAULT 0,
    remaining_amount DECIMAL(12,2) NOT NULL,
    payment_date DATE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS receivable_notes;
DROP TABLE IF EXISTS salary_posting;
DROP TABLE IF EXISTS salary_verification_approval;
DROP TABLE IF EXISTS attendance_calculation;
DROP TABLE IF EXISTS salary_calculation;
DROP TABLE IF EXISTS employee_deductions;
DROP TABLE IF EXISTS employee_loans;
DROP TABLE IF EXISTS employee_sales;
DROP TABLE IF EXISTS spb_spg;
DROP TABLE IF EXISTS spg_stores;
DROP TABLE IF EXISTS employees;