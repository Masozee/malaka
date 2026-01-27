-- +goose Up
-- Training Programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    training_type VARCHAR(50) NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 0,
    max_participants INTEGER NOT NULL DEFAULT 0,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    completed_count INTEGER NOT NULL DEFAULT 0,
    instructor_name VARCHAR(255),
    target_departments TEXT[],
    program_status VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    training_location VARCHAR(255),
    cost_per_participant DECIMAL(15, 2) NOT NULL DEFAULT 0,
    provides_certification BOOLEAN NOT NULL DEFAULT false,
    prerequisites TEXT[],
    training_materials TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Training Enrollments table
CREATE TABLE IF NOT EXISTS training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    employee_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    program_id UUID NOT NULL REFERENCES training_programs(id),
    program_title VARCHAR(255) NOT NULL,
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    progress_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    enrollment_status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
    final_score DECIMAL(5, 2),
    certificate_issued BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_programs_status ON training_programs(program_status);
CREATE INDEX IF NOT EXISTS idx_training_programs_category ON training_programs(category);
CREATE INDEX IF NOT EXISTS idx_training_programs_start_date ON training_programs(start_date);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_employee_id ON training_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_program_id ON training_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_status ON training_enrollments(enrollment_status);

-- +goose Down
DROP INDEX IF EXISTS idx_training_enrollments_status;
DROP INDEX IF EXISTS idx_training_enrollments_program_id;
DROP INDEX IF EXISTS idx_training_enrollments_employee_id;
DROP INDEX IF EXISTS idx_training_programs_start_date;
DROP INDEX IF EXISTS idx_training_programs_category;
DROP INDEX IF EXISTS idx_training_programs_status;
DROP TABLE IF EXISTS training_enrollments;
DROP TABLE IF EXISTS training_programs;
