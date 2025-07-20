-- Monthly Closing seed data for Malaka ERP
INSERT INTO monthly_closing (
    id, period_month, period_year, closing_date, closed_by, status,
    total_revenue, total_expenses, net_income, cash_position, bank_position,
    accounts_receivable, accounts_payable, inventory_value, closed_at, created_at
) VALUES 
-- Q1 2024 (January - March)
(gen_random_uuid(), 1, 2024, '2024-02-01', gen_random_uuid(), 'CLOSED',
 125000000.00, 99700000.00, 25300000.00, 50000000.00, 75300000.00,
 35000000.00, 28000000.00, 85000000.00, '2024-02-01 10:00:00', NOW()),

(gen_random_uuid(), 2, 2024, '2024-03-01', gen_random_uuid(), 'CLOSED',
 142000000.00, 127500000.00, 14500000.00, 75300000.00, 89800000.00,
 42000000.00, 32000000.00, 92000000.00, '2024-03-01 10:00:00', NOW()),

(gen_random_uuid(), 3, 2024, '2024-04-01', gen_random_uuid(), 'CLOSED',
 158000000.00, 132200000.00, 25800000.00, 89800000.00, 115600000.00,
 48000000.00, 35000000.00, 98000000.00, '2024-04-01 10:00:00', NOW()),

-- Q2 2024 (April - June)
(gen_random_uuid(), 4, 2024, '2024-05-01', gen_random_uuid(), 'CLOSED',
 135000000.00, 121700000.00, 13300000.00, 115600000.00, 128900000.00,
 38000000.00, 30000000.00, 88000000.00, '2024-05-01 10:00:00', NOW()),

(gen_random_uuid(), 5, 2024, '2024-06-01', gen_random_uuid(), 'CLOSED',
 148000000.00, 131700000.00, 16300000.00, 128900000.00, 145200000.00,
 45000000.00, 33000000.00, 95000000.00, '2024-06-01 10:00:00', NOW()),

(gen_random_uuid(), 6, 2024, '2024-07-01', gen_random_uuid(), 'CLOSED',
 165000000.00, 141500000.00, 23500000.00, 145200000.00, 168700000.00,
 52000000.00, 38000000.00, 102000000.00, '2024-07-01 10:00:00', NOW()),

-- Q3 2024 (July - September) - Current periods
(gen_random_uuid(), 7, 2024, '2024-08-01', NULL, 'OPEN',
 95000000.00, 78500000.00, 16500000.00, 168700000.00, 185200000.00,
 45000000.00, 35000000.00, 98000000.00, NULL, NOW()),

(gen_random_uuid(), 8, 2024, '2024-09-01', NULL, 'OPEN',
 0.00, 0.00, 0.00, 0.00, 0.00,
 0.00, 0.00, 0.00, NULL, NOW()),

(gen_random_uuid(), 9, 2024, '2024-10-01', NULL, 'OPEN',
 0.00, 0.00, 0.00, 0.00, 0.00,
 0.00, 0.00, 0.00, NULL, NOW()),

-- Q4 2024 (October - December) - Future periods
(gen_random_uuid(), 10, 2024, '2024-11-01', NULL, 'OPEN',
 0.00, 0.00, 0.00, 0.00, 0.00,
 0.00, 0.00, 0.00, NULL, NOW()),

(gen_random_uuid(), 11, 2024, '2024-12-01', NULL, 'OPEN',
 0.00, 0.00, 0.00, 0.00, 0.00,
 0.00, 0.00, 0.00, NULL, NOW()),

(gen_random_uuid(), 12, 2024, '2025-01-01', NULL, 'OPEN',
 0.00, 0.00, 0.00, 0.00, 0.00,
 0.00, 0.00, 0.00, NULL, NOW()),

-- Previous year sample (2023 December)
(gen_random_uuid(), 12, 2023, '2024-01-05', gen_random_uuid(), 'CLOSED',
 98000000.00, 90000000.00, 8000000.00, 42000000.00, 50000000.00,
 30000000.00, 25000000.00, 80000000.00, '2024-01-05 10:00:00', NOW()),

-- Next year preparation (2025 January)
(gen_random_uuid(), 1, 2025, '2025-02-01', NULL, 'OPEN',
 0.00, 0.00, 0.00, 0.00, 0.00,
 0.00, 0.00, 0.00, NULL, NOW());