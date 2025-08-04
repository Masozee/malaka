-- Leave Balances seed data (Indonesian business context)
-- Assuming employees already exist, create leave balances for 2024

INSERT INTO leave_balances (id, employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, carried_forward_days, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    '11111111-1111-1111-1111-111111111111', -- Annual leave
    2024,
    12, -- 12 days allocated per year
    FLOOR(RANDOM() * 8), -- Random used days (0-7)
    12 - FLOOR(RANDOM() * 8), -- Remaining = allocated - used
    FLOOR(RANDOM() * 3), -- Random carried forward (0-2)
    NOW(),
    NOW()
FROM employees e
WHERE EXISTS (SELECT 1 FROM employees LIMIT 1)
LIMIT 10;

INSERT INTO leave_balances (id, employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, carried_forward_days, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    '22222222-2222-2222-2222-222222222222', -- Sick leave
    2024,
    30, -- 30 days allocated per year
    FLOOR(RANDOM() * 5), -- Random used days (0-4)
    30 - FLOOR(RANDOM() * 5), -- Remaining = allocated - used
    0, -- No carry forward for sick leave
    NOW(),
    NOW()
FROM employees e
WHERE EXISTS (SELECT 1 FROM employees LIMIT 1)
LIMIT 10;

INSERT INTO leave_balances (id, employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, carried_forward_days, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    '44444444-4444-4444-4444-444444444444', -- Personal leave
    2024,
    6, -- 6 days allocated per year
    FLOOR(RANDOM() * 4), -- Random used days (0-3)
    6 - FLOOR(RANDOM() * 4), -- Remaining = allocated - used
    0, -- No carry forward for personal leave
    NOW(),
    NOW()
FROM employees e
WHERE EXISTS (SELECT 1 FROM employees LIMIT 1)
LIMIT 10;