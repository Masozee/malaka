-- Indonesian Shoe Models Seed Data
INSERT INTO models (name, code, description, status) VALUES
('Oxford Classic', 'OXF-CLS', 'Model oxford klasik untuk formal', 'active'),
('Loafer Executive', 'LOF-EXE', 'Model loafer untuk eksekutif', 'active'),
('Boots Explorer', 'BOT-EXP', 'Model boots untuk petualangan', 'active'),
('Sneakers Urban', 'SNK-URB', 'Model sneakers untuk perkotaan', 'active'),
('Sandal Comfort', 'SDL-CMF', 'Model sandal nyaman', 'active'),
('Pantofel Formal', 'PTF-FRM', 'Model pantofel untuk acara formal', 'active'),
('Casual Walker', 'CSL-WLK', 'Model kasual untuk berjalan', 'active'),
('Safety Worker', 'SFT-WRK', 'Model safety untuk pekerja', 'active'),
('High Heels Elegant', 'HHL-ELG', 'Model high heels elegan', 'active'),
('Flat Shoes Simple', 'FLT-SMP', 'Model flat shoes simpel', 'active'),
('Running Sport', 'RUN-SPT', 'Model running untuk olahraga', 'active'),
('Hiking Mountain', 'HIK-MTN', 'Model hiking untuk gunung', 'active'),
('Slip-On Easy', 'SLP-ESY', 'Model slip-on mudah dipakai', 'active'),
('Ankle Boots Modern', 'ANK-MDN', 'Model ankle boots modern', 'active'),
('Dress Shoes Premium', 'DRS-PRM', 'Model dress shoes premium', 'active'),
('Canvas Casual', 'CNV-CSL', 'Model canvas kasual', 'active'),
('Moccasin Comfort', 'MOC-CMF', 'Model moccasin nyaman', 'active'),
('Platform Trendy', 'PLT-TRN', 'Model platform trendy', 'active'),
('Wedges Stylish', 'WDG-STY', 'Model wedges stylish', 'active'),
('Brogue Traditional', 'BRG-TRD', 'Model brogue tradisional', 'active')
ON CONFLICT DO NOTHING;
