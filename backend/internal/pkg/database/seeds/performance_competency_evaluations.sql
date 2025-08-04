-- Performance Competency Evaluations Seed Data
-- Evaluates employees on various competencies with self and manager scores

INSERT INTO performance_competency_evaluations (
    id, performance_review_id, competency_id, self_score, manager_score, final_score,
    self_comments, manager_comments
) VALUES
-- Budi Santoso (Manager Operasional) Q2 2024 Competencies
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 4.5, 4.5, 4.5, 'Saya memiliki pengalaman teknis yang kuat dalam produksi sepatu', 'Budi memang memiliki keahlian teknis yang sangat baik'),
('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 3.8, 4.0, 4.0, 'Merasa komunikasi lisan sudah cukup baik', 'Komunikasi Budi dengan tim sudah baik, namun perlu ditingkatkan dengan departemen lain'),
('13131313-1313-1313-1313-131313131313', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 4.2, 4.3, 4.3, 'Selalu berusaha memimpin tim dengan baik', 'Kepemimpinan Budi terhadap tim produksi sangat baik'),
('14141414-1414-1414-1414-141414141414', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4.0, 4.1, 4.1, 'Bekerja sama dengan tim untuk mencapai target', 'Kerja sama tim Budi sangat baik, selalu mendukung anggota tim'),
('15151515-1515-1515-1515-151515151515', '11111111-1111-1111-1111-111111111111', '20202020-2020-2020-2020-202020202020', 3.9, 4.0, 4.0, 'Selalu mencoba menganalisis masalah secara sistematis', 'Budi baik dalam analisis masalah operasional'),

-- Sari Dewi (Supervisor Penjualan) Q2 2024 Competencies
('21212121-2121-2121-2121-212121212121', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 4.0, 4.2, 4.2, 'Pengetahuan produk sepatu sudah cukup baik', 'Sari memiliki pengetahuan produk yang sangat baik untuk sales'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 4.8, 4.8, 4.8, 'Komunikasi adalah kekuatan utama saya', 'Komunikasi lisan Sari sangat baik, efektif dengan pelanggan'),
('23232323-2323-2323-2323-232323232323', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4.3, 4.5, 4.5, 'Berusaha memotivasi tim sales untuk mencapai target', 'Sari sangat baik dalam memotivasi tim sales'),
('24242424-2424-2424-2424-242424242424', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4.8, 4.9, 4.9, 'Selalu berbagi teknik sales yang efektif dengan tim', 'Sari sangat generous dalam berbagi pengetahuan dengan tim'),
('25252525-2525-2525-2525-252525252525', '22222222-2222-2222-2222-222222222222', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 4.7, 4.6, 4.6, 'Fokus utama saya adalah kepuasan pelanggan', 'Orientasi pelanggan Sari sangat kuat'),

-- Ahmad Hidayat (Staff Gudang) Q2 2024 Competencies
('31313131-3131-3131-3131-313131313131', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 4.3, 4.5, 4.5, 'Selalu memperhatikan standar kualitas', 'Ahmad memiliki kesadaran quality yang sangat baik'),
('32323232-3232-3232-3232-323232323232', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 3.0, 3.2, 3.2, 'Masih perlu belajar komunikasi yang lebih efektif', 'Ahmad perlu meningkatkan komunikasi lisan terutama dalam meeting'),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 3.2, 3.5, 3.5, 'Masih belajar untuk memimpin tim kecil', 'Ahmad menunjukkan potensi leadership yang baik'),
('34343434-3434-3434-3434-343434343434', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3.6, 3.8, 3.8, 'Berusaha bekerja sama dengan tim QC', 'Kerja sama Ahmad dengan tim sudah cukup baik'),
('35353535-3535-3535-3535-353535353535', '33333333-3333-3333-3333-333333333333', '20202020-2020-2020-2020-202020202020', 3.8, 4.0, 4.0, 'Selalu mencoba menganalisis penyebab defect', 'Ahmad baik dalam analisis masalah quality'),

-- Maya Sari Putri (Staff Keuangan) Q2 2024 Competencies
('41414141-4141-4141-4141-414141414141', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 4.2, 4.3, 4.3, 'Keahlian HR saya terus berkembang', 'Maya memiliki keahlian teknis HR yang sangat baik'),
('42424242-4242-4242-4242-424242424242', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 4.6, 4.7, 4.7, 'Komunikasi adalah kunci sukses dalam HR', 'Komunikasi Maya sangat baik dalam menangani karyawan'),
('43434343-4343-4343-4343-434343434343', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4.3, 4.4, 4.4, 'Selalu berusaha mengambil keputusan yang tepat', 'Maya baik dalam pengambilan keputusan HR'),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4.5, 4.6, 4.6, 'Senang berbagi knowledge dengan kolega', 'Maya sangat baik dalam berbagi pengetahuan'),
('45454545-4545-4545-4545-454545454545', '44444444-4444-4444-4444-444444444444', '30303030-3030-3030-3030-303030303030', 4.4, 4.5, 4.5, 'Selalu mencari solusi kreatif untuk masalah HR', 'Maya kreatif dalam mencari solusi HR'),

-- Andi Wijaya (Staff Keamanan) Q2 2024 Competencies
('51515151-5151-5151-5151-515151515151', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 3.6, 3.8, 3.8, 'Masih belajar menggunakan sistem gudang yang baru', 'Andi masih perlu pelatihan untuk sistem teknologi baru'),
('52525252-5252-5252-5252-525252525252', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 3.0, 3.2, 3.2, 'Perlu meningkatkan komunikasi dengan tim lain', 'Andi perlu meningkatkan komunikasi lintas departemen'),
('53535353-5353-5353-5353-535353535353', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 2.8, 3.0, 3.0, 'Masih belajar untuk memimpin shift malam', 'Andi menunjukkan potensi leadership tapi perlu pengembangan'),
('54545454-5454-5454-5454-545454545454', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3.5, 3.7, 3.7, 'Bekerja sama dengan tim keamanan', 'Kerja sama Andi dengan tim sudah cukup baik'),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '70707070-7070-7070-7070-707070707070', 3.8, 4.0, 4.0, 'Selalu bertanggung jawab dengan tugas keamanan', 'Andi sangat bertanggung jawab dalam tugasnya'),

-- Annual Review Competencies - Sari Dewi
('61616161-6161-6161-6161-616161616161', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 4.5, 4.6, 4.6, 'Pengetahuan produk terus saya tingkatkan', 'Pengetahuan produk Sari sangat komprehensif'),
('62626262-6262-6262-6262-626262626262', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 4.8, 4.8, 4.8, 'Komunikasi adalah kekuatan utama saya sepanjang tahun', 'Komunikasi Sari konsisten sangat baik'),
('63636363-6363-6363-6363-636363636363', '88888888-8888-8888-8888-888888888888', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 4.7, 4.6, 4.6, 'Customer satisfaction adalah prioritas utama', 'Orientasi pelanggan Sari luar biasa'),

-- Annual Review Competencies - Ahmad Hidayat  
('71717171-7171-7171-7171-717171717171', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 4.4, 4.5, 4.5, 'Quality awareness saya meningkat sepanjang tahun', 'Ahmad menunjukkan peningkatan quality awareness yang signifikan'),
('72727272-7272-7272-7272-727272727272', '99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 3.8, 4.0, 4.0, 'Komunikasi saya sudah lebih baik dari awal tahun', 'Ahmad menunjukkan improvement dalam komunikasi'),
('73737373-7373-7373-7373-737373737373', '99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 3.8, 4.0, 4.0, 'Mulai mengambil tanggung jawab leadership', 'Ahmad menunjukkan potential leadership yang baik'),

-- Probation Review Competencies - Dewi Permatasari
('81818181-8181-8181-8181-818181818181', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 3.8, 4.0, 4.0, 'Belajar dengan cepat skill teknis yang dibutuhkan', 'Dewi menunjukkan adaptasi teknis yang baik'),
('82828282-8282-8282-8282-828282828282', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 4.0, 4.0, 4.0, 'Komunikasi dengan tim sudah baik', 'Komunikasi Dewi sangat baik untuk fresh graduate'),
('83838383-8383-8383-8383-838383838383', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4.2, 4.2, 4.2, 'Senang bekerja dalam tim', 'Dewi sangat baik dalam kerja sama tim'),

-- Probation Review Competencies - Rudi Hartono
('91919191-9191-9191-9191-919191919191', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 4.2, 4.3, 4.3, 'Background teknis saya membantu adaptasi kerja', 'Rudi memiliki keahlian teknis yang sangat baik'),
('92929292-9292-9292-9292-929292929292', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 4.3, 4.3, 4.3, 'Sangat memperhatikan standar kualitas', 'Quality awareness Rudi sangat baik'),
('93939393-9393-9393-9393-939393939393', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '90909090-9090-9090-9090-909090909090', 4.4, 4.4, 4.4, 'Mudah beradaptasi dengan lingkungan kerja baru', 'Adaptabilitas Rudi sangat baik untuk karyawan baru');