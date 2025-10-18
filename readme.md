# Edlevator
Platform pembelajaran kuliah sederhana dan lengkap.

## Konfigurasi Supabase

1. **Siapkan kredensial proyek.**
   - Buka proyek Supabase Anda lalu salin `Project URL` dan `anon key`.
   - Perbarui nilai pada `config.js` agar sesuai dengan proyek yang digunakan.

2. **Jalankan skrip basis data.**
   - Masuk ke menu **SQL Editor** kemudian jalankan isi file [`supabase.sql`](./supabase.sql).
   - Skrip tersebut membuat tabel `profiles`, `profile_details`, `courses`, `enrollments`, serta seluruh kebijakan RLS dan bucket penyimpanan avatar (`avatars`).

3. **Pastikan bucket avatar aktif.**
   - Setelah menjalankan skrip, buka menu **Storage** dan pastikan bucket `avatars` sudah muncul dengan akses publik.
   - Jika bucket belum ada, buat bucket baru bernama `avatars`, centang opsi _Public bucket_, lalu jalankan kembali bagian akhir skrip atau salin kebijakan berikut di SQL Editor:

     ```sql
     -- Izinkan semua orang membaca gambar avatar
     CREATE POLICY "Avatar publik" ON storage.objects
     FOR SELECT USING (bucket_id = 'avatars');

     -- Izinkan pengguna terautentikasi mengelola avatar miliknya
     CREATE POLICY "Pengguna unggah avatar" ON storage.objects
     FOR INSERT
     WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND auth.uid() = owner);

     CREATE POLICY "Pengguna ubah avatar" ON storage.objects
     FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner)
     WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

     CREATE POLICY "Pengguna hapus avatar" ON storage.objects
     FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);
     ```

4. **Batasan berkas avatar.**
   - Aplikasi hanya menerima gambar `PNG`, `JPG/JPEG`, atau `WEBP` dengan ukuran maksimum 2&nbsp;MB.
   - Setiap unggahan disimpan di bucket `avatars` dengan nama berkas unik per pengguna.

Setelah langkah di atas selesai, fitur profil dan penyimpanan avatar akan sinkron di perangkat mobile maupun desktop.
