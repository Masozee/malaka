-- +goose Up
-- Quality Controls main table
CREATE TABLE IF NOT EXISTS quality_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('incoming', 'in_process', 'final', 'random')),
    reference_type VARCHAR(30) NOT NULL CHECK (reference_type IN ('purchase_order', 'work_order', 'finished_goods')),
    reference_id VARCHAR(255) NOT NULL,
    reference_number VARCHAR(100) NOT NULL DEFAULT '',
    product_id VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL DEFAULT '',
    product_name VARCHAR(255) NOT NULL DEFAULT '',
    batch_number VARCHAR(100) NOT NULL,
    quantity_tested INTEGER NOT NULL DEFAULT 0,
    sample_size INTEGER NOT NULL DEFAULT 0,
    test_date DATE NOT NULL,
    inspector VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'testing', 'passed', 'failed', 'conditional')),
    overall_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Quality Tests table (individual tests within a QC)
CREATE TABLE IF NOT EXISTS quality_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quality_ctrl_id UUID NOT NULL REFERENCES quality_controls(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(20) NOT NULL CHECK (test_type IN ('visual', 'measurement', 'functional', 'durability', 'chemical')),
    specification TEXT NOT NULL DEFAULT '',
    actual_value TEXT NOT NULL DEFAULT '',
    result VARCHAR(20) NOT NULL DEFAULT 'pass' CHECK (result IN ('pass', 'fail', 'marginal')),
    score DECIMAL(5, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Quality Defects table (defects found during QC)
CREATE TABLE IF NOT EXISTS quality_defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quality_ctrl_id UUID NOT NULL REFERENCES quality_controls(id) ON DELETE CASCADE,
    defect_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
    quantity INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(255),
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Quality Actions table (corrective actions for QC)
CREATE TABLE IF NOT EXISTS quality_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quality_ctrl_id UUID NOT NULL REFERENCES quality_controls(id) ON DELETE CASCADE,
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('accept', 'reject', 'rework', 'quarantine', 'conditional_accept')),
    description TEXT NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_controls_qc_number ON quality_controls(qc_number);
CREATE INDEX IF NOT EXISTS idx_quality_controls_status ON quality_controls(status);
CREATE INDEX IF NOT EXISTS idx_quality_controls_type ON quality_controls(type);
CREATE INDEX IF NOT EXISTS idx_quality_controls_reference_id ON quality_controls(reference_id);
CREATE INDEX IF NOT EXISTS idx_quality_controls_product_id ON quality_controls(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_controls_test_date ON quality_controls(test_date);
CREATE INDEX IF NOT EXISTS idx_quality_controls_inspector ON quality_controls(inspector);
CREATE INDEX IF NOT EXISTS idx_quality_tests_quality_ctrl_id ON quality_tests(quality_ctrl_id);
CREATE INDEX IF NOT EXISTS idx_quality_defects_quality_ctrl_id ON quality_defects(quality_ctrl_id);
CREATE INDEX IF NOT EXISTS idx_quality_defects_severity ON quality_defects(severity);
CREATE INDEX IF NOT EXISTS idx_quality_actions_quality_ctrl_id ON quality_actions(quality_ctrl_id);
CREATE INDEX IF NOT EXISTS idx_quality_actions_status ON quality_actions(status);
CREATE INDEX IF NOT EXISTS idx_quality_actions_due_date ON quality_actions(due_date);

-- +goose Down
DROP INDEX IF EXISTS idx_quality_actions_due_date;
DROP INDEX IF EXISTS idx_quality_actions_status;
DROP INDEX IF EXISTS idx_quality_actions_quality_ctrl_id;
DROP INDEX IF EXISTS idx_quality_defects_severity;
DROP INDEX IF EXISTS idx_quality_defects_quality_ctrl_id;
DROP INDEX IF EXISTS idx_quality_tests_quality_ctrl_id;
DROP INDEX IF EXISTS idx_quality_controls_inspector;
DROP INDEX IF EXISTS idx_quality_controls_test_date;
DROP INDEX IF EXISTS idx_quality_controls_product_id;
DROP INDEX IF EXISTS idx_quality_controls_reference_id;
DROP INDEX IF EXISTS idx_quality_controls_type;
DROP INDEX IF EXISTS idx_quality_controls_status;
DROP INDEX IF EXISTS idx_quality_controls_qc_number;
DROP TABLE IF EXISTS quality_actions;
DROP TABLE IF EXISTS quality_defects;
DROP TABLE IF EXISTS quality_tests;
DROP TABLE IF EXISTS quality_controls;
