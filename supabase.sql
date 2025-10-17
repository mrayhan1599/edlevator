-- Skema dan data awal untuk platform Edlevator

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp DEFAULT now()
);

-- Helper function to evaluate admin privileges without triggering recursive
-- policy checks on the profiles table. SECURITY DEFINER allows this function
-- to read from profiles without being subject to row level security policies.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;

CREATE TABLE courses (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  category text,
  level text,
  hours int,
  rating numeric(2,1),
  instructor text
);

CREATE TABLE enrollments (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id bigint REFERENCES courses(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses profiles
CREATE POLICY "select own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin select all profiles" ON profiles
FOR SELECT USING (public.is_admin(auth.uid()));

-- Kebijakan akses enrollments
CREATE POLICY "user insert enrollment" ON enrollments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user select own enrollment" ON enrollments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin select all enrollments" ON enrollments
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "admin update enrollments" ON enrollments
FOR UPDATE USING (public.is_admin(auth.uid()));

-- Data awal kursus
INSERT INTO courses (title, category, level, hours, rating, instructor) VALUES
  ('Dasar Pemrograman Web', 'Teknik Informatika', 'Pemula', 24, 4.8, 'Dr. Sinta Wardhani'),
  ('Manajemen Proyek Digital', 'Manajemen Bisnis', 'Menengah', 18, 4.6, 'Bima Adi, M.M.'),
  ('Psikologi Komunikasi Massa', 'Psikologi', 'Lanjutan', 20, 4.9, 'Dr. Rani Kartika'),
  ('Branding Visual untuk Startup', 'Desain Komunikasi Visual', 'Menengah', 16, 4.7, 'Aditia Permana, S.Ds.'),
  ('Analisis Data Bisnis', 'Manajemen Bisnis', 'Lanjutan', 22, 4.5, 'Fadhil Ramadhan, M.BA'),
  ('UI/UX Research Fundamentals', 'Desain Komunikasi Visual', 'Pemula', 14, 4.4, 'Natasya Lingga, M.Ds.');
