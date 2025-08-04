-- +goose Up
-- Performance review management tables

-- Create performance review cycles table
CREATE TABLE performance_review_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('quarterly', 'annual', 'probation', 'mid-year')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance goals table
CREATE TABLE performance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    weight DECIMAL(3,2) DEFAULT 1.0,
    target_value VARCHAR(100),
    measurement_unit VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competency framework table
CREATE TABLE competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    max_score INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance reviews table
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    review_cycle_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    review_period VARCHAR(50) NOT NULL,
    overall_score DECIMAL(3,2),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'overdue')),
    review_date DATE,
    submission_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    self_review_completed BOOLEAN DEFAULT false,
    manager_review_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (review_cycle_id) REFERENCES performance_review_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create performance goals assignments table
CREATE TABLE performance_review_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_review_id UUID NOT NULL,
    goal_id UUID NOT NULL,
    target_value VARCHAR(100),
    actual_value VARCHAR(100),
    achievement_percentage DECIMAL(5,2),
    is_achieved BOOLEAN DEFAULT false,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (performance_review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES performance_goals(id) ON DELETE CASCADE
);

-- Create competency evaluations table
CREATE TABLE performance_competency_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_review_id UUID NOT NULL,
    competency_id UUID NOT NULL,
    self_score DECIMAL(3,2),
    manager_score DECIMAL(3,2),
    final_score DECIMAL(3,2),
    self_comments TEXT,
    manager_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (performance_review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE
);

-- Create performance development plans table
CREATE TABLE performance_development_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_review_id UUID NOT NULL,
    area_for_improvement VARCHAR(200) NOT NULL,
    development_action TEXT NOT NULL,
    target_completion_date DATE,
    responsible_person VARCHAR(100),
    progress_status VARCHAR(20) DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (performance_review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE
);

-- Create performance recognition table
CREATE TABLE performance_recognitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_review_id UUID NOT NULL,
    recognition_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    awarded_by UUID NOT NULL,
    award_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (performance_review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_reviews_cycle_id ON performance_reviews(review_cycle_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_performance_reviews_review_date ON performance_reviews(review_date);
CREATE INDEX idx_performance_review_goals_review_id ON performance_review_goals(performance_review_id);
CREATE INDEX idx_performance_competency_evaluations_review_id ON performance_competency_evaluations(performance_review_id);
CREATE INDEX idx_performance_development_plans_review_id ON performance_development_plans(performance_review_id);
CREATE INDEX idx_performance_recognitions_review_id ON performance_recognitions(performance_review_id);

-- Create unique constraints
CREATE UNIQUE INDEX idx_performance_review_employee_cycle ON performance_reviews(employee_id, review_cycle_id);
CREATE UNIQUE INDEX idx_performance_review_goal_unique ON performance_review_goals(performance_review_id, goal_id);
CREATE UNIQUE INDEX idx_performance_competency_evaluation_unique ON performance_competency_evaluations(performance_review_id, competency_id);

-- Add comments for documentation
COMMENT ON TABLE performance_review_cycles IS 'Performance review cycles (quarterly, annual, etc.)';
COMMENT ON TABLE performance_goals IS 'Performance goals template that can be assigned to reviews';
COMMENT ON TABLE competencies IS 'Competency framework for employee evaluation';
COMMENT ON TABLE performance_reviews IS 'Main performance review records';
COMMENT ON TABLE performance_review_goals IS 'Goals assigned to specific performance reviews';
COMMENT ON TABLE performance_competency_evaluations IS 'Competency evaluations for performance reviews';
COMMENT ON TABLE performance_development_plans IS 'Development plans created from performance reviews';
COMMENT ON TABLE performance_recognitions IS 'Recognition and awards given during performance reviews';

-- +goose Down
DROP TABLE IF EXISTS performance_recognitions CASCADE;
DROP TABLE IF EXISTS performance_development_plans CASCADE;
DROP TABLE IF EXISTS performance_competency_evaluations CASCADE;
DROP TABLE IF EXISTS performance_review_goals CASCADE;
DROP TABLE IF EXISTS performance_reviews CASCADE;
DROP TABLE IF EXISTS competencies CASCADE;
DROP TABLE IF EXISTS performance_goals CASCADE;
DROP TABLE IF EXISTS performance_review_cycles CASCADE;