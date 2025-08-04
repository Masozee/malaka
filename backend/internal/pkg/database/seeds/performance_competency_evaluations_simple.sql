-- Performance Competency Evaluations Seed Data (Simplified)
-- Evaluates employees on various competencies with self and manager scores

INSERT INTO performance_competency_evaluations (
    id, performance_review_id, competency_id, self_score, manager_score, final_score,
    self_comments, manager_comments
) VALUES
-- Budi Santoso (Manager Operasional) Q2 2024 Competencies
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 4.5, 4.5, 4.5, 'Saya memiliki pengalaman teknis yang kuat dalam operasional', 'Budi memang memiliki keahlian teknis yang sangat baik'),
('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 3.8, 4.0, 4.0, 'Merasa komunikasi lisan sudah cukup baik', 'Komunikasi Budi dengan tim sudah baik, namun perlu ditingkatkan dengan departemen lain'),
('13131313-1313-1313-1313-131313131313', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 4.2, 4.3, 4.3, 'Selalu berusaha memimpin tim dengan baik', 'Kepemimpinan Budi terhadap tim operasional sangat baik'),
('14141414-1414-1414-1414-141414141414', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4.0, 4.1, 4.1, 'Bekerja sama dengan tim untuk mencapai target', 'Kerja sama tim Budi sangat baik, selalu mendukung anggota tim'),
('15151515-1515-1515-1515-151515151515', '11111111-1111-1111-1111-111111111111', '20202020-2020-2020-2020-202020202020', 3.9, 4.0, 4.0, 'Selalu mencoba menganalisis masalah secara sistematis', 'Budi baik dalam analisis masalah operasional'),

-- Sari Dewi (Supervisor Penjualan) Q2 2024 Competencies
('21212121-2121-2121-2121-212121212121', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 4.0, 4.2, 4.2, 'Pengetahuan produk sepatu sudah cukup baik', 'Sari memiliki pengetahuan produk yang sangat baik untuk sales'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 4.8, 4.8, 4.8, 'Komunikasi adalah kekuatan utama saya', 'Komunikasi lisan Sari sangat baik, efektif dengan pelanggan'),
('23232323-2323-2323-2323-232323232323', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4.8, 4.9, 4.9, 'Selalu berbagi teknik sales yang efektif dengan tim', 'Sari sangat generous dalam berbagi pengetahuan dengan tim'),
('24242424-2424-2424-2424-242424242424', '22222222-2222-2222-2222-222222222222', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 4.7, 4.6, 4.6, 'Fokus utama saya adalah kepuasan pelanggan', 'Orientasi pelanggan Sari sangat kuat'),

-- Ahmad Hidayat (Staff Logistik) Q2 2024 Competencies
('31313131-3131-3131-3131-313131313131', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 3.8, 4.0, 4.0, 'Keahlian teknis logistik terus saya tingkatkan', 'Ahmad memiliki keahlian teknis logistik yang baik'),
('32323232-3232-3232-3232-323232323232', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 3.0, 3.2, 3.2, 'Masih perlu belajar komunikasi yang lebih efektif', 'Ahmad perlu meningkatkan komunikasi lisan terutama dalam meeting'),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3.6, 3.8, 3.8, 'Berusaha bekerja sama dengan tim logistik', 'Kerja sama Ahmad dengan tim sudah cukup baik'),
('34343434-3434-3434-3434-343434343434', '33333333-3333-3333-3333-333333333333', '20202020-2020-2020-2020-202020202020', 3.8, 4.0, 4.0, 'Selalu mencoba menganalisis penyebab masalah inventory', 'Ahmad baik dalam analisis masalah logistik'),

-- Dewi Permatasari (Staff Penjualan) Q2 2024 Competencies
('41414141-4141-4141-4141-414141414141', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 3.8, 4.0, 4.0, 'Belajar dengan cepat skill sales yang dibutuhkan', 'Dewi menunjukkan adaptasi teknis yang baik'),
('42424242-4242-4242-4242-424242424242', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 4.0, 4.0, 4.0, 'Komunikasi dengan pelanggan sudah baik', 'Komunikasi Dewi sangat baik untuk fresh graduate'),
('43434343-4343-4343-4343-434343434343', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4.2, 4.2, 4.2, 'Senang bekerja dalam tim', 'Dewi sangat baik dalam kerja sama tim'),

-- Rudi Hartono (Staff Logistik) Q2 2024 Competencies
('51515151-5151-5151-5151-515151515151', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 4.0, 4.1, 4.1, 'Background teknis saya membantu adaptasi kerja logistik', 'Rudi memiliki keahlian teknis yang sangat baik'),
('52525252-5252-5252-5252-525252525252', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 3.5, 3.7, 3.7, 'Perlu meningkatkan komunikasi dengan tim lain', 'Rudi perlu meningkatkan komunikasi lintas departemen'),
('53535353-5353-5353-5353-535353535353', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3.8, 4.0, 4.0, 'Bekerja sama dengan tim logistik', 'Kerja sama Rudi dengan tim sudah cukup baik'),
('54545454-5454-5454-5454-545454545454', '55555555-5555-5555-5555-555555555555', '70707070-7070-7070-7070-707070707070', 4.0, 4.1, 4.1, 'Selalu bertanggung jawab dengan tugas logistik', 'Rudi sangat bertanggung jawab dalam tugasnya');