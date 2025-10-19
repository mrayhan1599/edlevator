-- Skema dan data awal untuk platform Edlevator

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_details (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  birthdate date,
  gender text,
  track text,
  major text,
  occupation text,
  company text,
  location text,
  bio text,
  avatar_data_url text,
  avatar_storage_path text,
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Helper function to sinkronisasi data admin secara otomatis.
CREATE OR REPLACE FUNCTION public.sync_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.role = 'admin' THEN
      INSERT INTO admin_users (user_id)
      VALUES (NEW.id)
      ON CONFLICT (user_id) DO NOTHING;
    ELSE
      DELETE FROM admin_users WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM admin_users WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_admin_user_trigger ON profiles;
CREATE TRIGGER sync_admin_user_trigger
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_admin_user();

INSERT INTO admin_users (user_id)
SELECT id FROM profiles WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = $1
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;

CREATE TABLE IF NOT EXISTS courses (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  category text,
  track text,
  level text,
  hours int,
  rating numeric(2,1),
  instructor text,
  is_active boolean DEFAULT true
);

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS track text;

CREATE TABLE IF NOT EXISTS enrollments (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id bigint REFERENCES courses(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  created_at timestamp DEFAULT now(),
  enrolled_at timestamp DEFAULT now()
);

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS enrolled_at timestamp DEFAULT now();

ALTER TABLE enrollments
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'select own profile'
  ) THEN
    CREATE POLICY "select own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'update own profile'
  ) THEN
    CREATE POLICY "update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'insert own profile'
  ) THEN
    CREATE POLICY "insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'admin select all profiles'
  ) THEN
    CREATE POLICY "admin select all profiles" ON profiles
      FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Kebijakan akses profile_details
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_details'
      AND policyname = 'select own profile details'
  ) THEN
    CREATE POLICY "select own profile details" ON profile_details
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_details'
      AND policyname = 'insert own profile details'
  ) THEN
    CREATE POLICY "insert own profile details" ON profile_details
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_details'
      AND policyname = 'update own profile details'
  ) THEN
    CREATE POLICY "update own profile details" ON profile_details
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_details'
      AND policyname = 'admin select profile details'
  ) THEN
    CREATE POLICY "admin select profile details" ON profile_details
      FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Kebijakan akses enrollments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enrollments'
      AND policyname = 'user insert enrollment'
  ) THEN
    CREATE POLICY "user insert enrollment" ON enrollments
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enrollments'
      AND policyname = 'user select own enrollment'
  ) THEN
    CREATE POLICY "user select own enrollment" ON enrollments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enrollments'
      AND policyname = 'admin select all enrollments'
  ) THEN
    CREATE POLICY "admin select all enrollments" ON enrollments
      FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enrollments'
      AND policyname = 'admin update enrollments'
  ) THEN
    CREATE POLICY "admin update enrollments" ON enrollments
      FOR UPDATE USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Kebijakan akses courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'courses'
      AND policyname = 'public select courses'
  ) THEN
    CREATE POLICY "public select courses" ON courses
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'courses'
      AND policyname = 'admin insert courses'
  ) THEN
    DROP POLICY "admin insert courses" ON courses;
  END IF;
END $$;

CREATE POLICY "admin insert courses" ON courses
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'courses'
      AND policyname = 'admin delete courses'
  ) THEN
    DROP POLICY "admin delete courses" ON courses;
  END IF;
END $$;

CREATE POLICY "admin delete courses" ON courses
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Hapus data kursus contoh agar daftar "Kursus Saya" hanya berisi kursus terdaftar pengguna
DELETE FROM courses
WHERE title IN (
  'Dasar Pemrograman Web',
  'Manajemen Proyek Digital',
  'Psikologi Komunikasi Massa',
  'Branding Visual untuk Startup',
  'Analisis Data Bisnis',
  'UI/UX Research Fundamentals'
);

-- Seed data kursus lintas jalur IPA dan IPS bila belum tersedia
WITH seed_data AS (
  SELECT * FROM (
    VALUES
      ('Teknik Pertambangan', 'Teknik & Teknologi', 'IPA', 'Pemula', 24, 4.7, 'Tim Mentor Edlevator', true),
      ('Pengantar Biologi Lingkungan', 'Sains', 'IPA', 'Pemula', 20, 4.8, 'Dr. Wina Sari', true),
      ('Fisika Terapan untuk Energi', 'Sains', 'IPA', 'Menengah', 18, 4.6, 'Ir. Bima Prakoso', true),
      ('Ekonomi Kreatif Digital', 'Bisnis & Ekonomi', 'IPS', 'Menengah', 16, 4.5, 'Mira Anggraini, M.Ec.', true),
      ('Sosiologi Perkotaan Modern', 'Ilmu Sosial', 'IPS', 'Pemula', 14, 4.4, 'Dr. Satya Firmansyah', true),
      ('Sejarah Indonesia Modern', 'Ilmu Sosial', 'IPS', 'Pemula', 12, 4.3, 'Prof. Dian Agustina', true)
  ) AS seed(title, category, track, level, hours, rating, instructor, is_active)
)
INSERT INTO courses (title, category, track, level, hours, rating, instructor, is_active)
SELECT
  s.title,
  s.category,
  s.track,
  s.level,
  s.hours,
  s.rating,
  s.instructor,
  s.is_active
FROM seed_data s
WHERE NOT EXISTS (
  SELECT 1 FROM courses c WHERE c.title = s.title
);

-- Bucket penyimpanan avatar (dibuat hanya jika belum ada)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    PERFORM storage.create_bucket('avatars', public := true);
  END IF;
END $$;

-- Kebijakan akses bucket avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Avatar publik'
  ) THEN
    CREATE POLICY "Avatar publik" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Pengguna unggah avatar'
  ) THEN
    CREATE POLICY "Pengguna unggah avatar" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars' AND auth.role() = 'authenticated' AND auth.uid() = owner
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Pengguna ubah avatar'
  ) THEN
    CREATE POLICY "Pengguna ubah avatar" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'avatars' AND auth.uid() = owner
      )
      WITH CHECK (
        bucket_id = 'avatars' AND auth.uid() = owner
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Pengguna hapus avatar'
  ) THEN
    CREATE POLICY "Pengguna hapus avatar" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'avatars' AND auth.uid() = owner
      );
  END IF;
END $$;
