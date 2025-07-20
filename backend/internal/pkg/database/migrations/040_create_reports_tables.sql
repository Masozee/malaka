-- +goose Up
-- Create reports module tables

-- Dynamic OLAP Reports
CREATE TABLE dynamic_olap_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_code VARCHAR(50) UNIQUE NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_category VARCHAR(100) NOT NULL,
    description TEXT,
    data_source VARCHAR(100) NOT NULL,
    sql_query TEXT NOT NULL,
    parameters JSONB,
    dimensions JSONB,
    measures JSONB,
    filters JSONB,
    sort_order JSONB,
    is_public BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    last_executed TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    avg_execution_time INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Static Reports
CREATE TABLE static_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_code VARCHAR(50) UNIQUE NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_category VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    description TEXT,
    template_path VARCHAR(500),
    output_format VARCHAR(20) DEFAULT 'PDF',
    parameters JSONB,
    data_source VARCHAR(100) NOT NULL,
    sql_query TEXT,
    schedule_type VARCHAR(20),
    schedule_config JSONB,
    email_recipients TEXT[],
    auto_send BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    last_generated TIMESTAMP WITH TIME ZONE,
    generation_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Executions (for logging and audit)
CREATE TABLE report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('DYNAMIC', 'STATIC')),
    executed_by UUID NOT NULL,
    execution_start TIMESTAMP WITH TIME ZONE NOT NULL,
    execution_end TIMESTAMP WITH TIME ZONE,
    execution_time INTEGER,
    parameters JSONB,
    result_count INTEGER,
    file_path VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'RUNNING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Subscriptions
CREATE TABLE report_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('DYNAMIC', 'STATIC')),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL,
    schedule_config JSONB NOT NULL,
    parameters JSONB,
    output_format VARCHAR(20) DEFAULT 'PDF',
    is_active BOOLEAN DEFAULT true,
    last_sent TIMESTAMP WITH TIME ZONE,
    next_send TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS report_subscriptions;
DROP TABLE IF EXISTS report_executions;
DROP TABLE IF EXISTS static_reports;
DROP TABLE IF EXISTS dynamic_olap_reports;