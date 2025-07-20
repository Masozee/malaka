-- +goose Up
-- Create attendance module tables

-- Biometric Machines
CREATE TABLE biometric_machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    ip_address INET,
    port INTEGER DEFAULT 4370,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biometric Attendance Head Office
CREATE TABLE biometric_attendance_headoffice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    machine_id UUID NOT NULL REFERENCES biometric_machines(id),
    attendance_date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    work_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PRESENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- GPS Attendance SPG
CREATE TABLE gps_attendance_spg (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    store_id UUID,
    attendance_date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    clock_in_latitude DECIMAL(10,8),
    clock_in_longitude DECIMAL(11,8),
    clock_out_latitude DECIMAL(10,8),
    clock_out_longitude DECIMAL(11,8),
    clock_in_address TEXT,
    clock_out_address TEXT,
    work_hours DECIMAL(4,2) DEFAULT 0,
    distance_from_store DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'PRESENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- Daily Attendance Tracking
CREATE TABLE daily_attendance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    scheduled_in TIME,
    scheduled_out TIME,
    actual_in TIMESTAMP WITH TIME ZONE,
    actual_out TIMESTAMP WITH TIME ZONE,
    late_minutes INTEGER DEFAULT 0,
    early_out_minutes INTEGER DEFAULT 0,
    work_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PRESENT',
    remarks TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- Automatic Attendance Cards
CREATE TABLE automatic_attendance_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    rfid_tag VARCHAR(100),
    biometric_template TEXT,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS automatic_attendance_cards;
DROP TABLE IF EXISTS daily_attendance_tracking;
DROP TABLE IF EXISTS gps_attendance_spg;
DROP TABLE IF EXISTS biometric_attendance_headoffice;
DROP TABLE IF EXISTS biometric_machines;