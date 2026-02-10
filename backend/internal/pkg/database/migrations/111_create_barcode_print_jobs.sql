-- +goose Up
CREATE TABLE IF NOT EXISTS barcode_print_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(255) NOT NULL,
    barcode_type VARCHAR(50) NOT NULL DEFAULT 'ean13',
    template VARCHAR(100) DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    priority VARCHAR(50) NOT NULL DEFAULT 'normal',
    total_labels INT NOT NULL DEFAULT 0,
    printed_labels INT NOT NULL DEFAULT 0,
    failed_labels INT NOT NULL DEFAULT 0,
    printer_name VARCHAR(255) DEFAULT '',
    requested_by VARCHAR(255) DEFAULT '',
    paper_size VARCHAR(100) DEFAULT '',
    label_dimensions VARCHAR(100) DEFAULT '',
    notes TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_barcode_print_jobs_status ON barcode_print_jobs(status);
CREATE INDEX idx_barcode_print_jobs_created_at ON barcode_print_jobs(created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS barcode_print_jobs;
