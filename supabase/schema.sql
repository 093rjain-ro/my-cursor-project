-- Supabase Schema for Student Performance Platform v2
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES table to store user metadata (so we don't have to query auth.users directly for joins)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('student', 'educator', 'admin')) NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- PREDICTIONS table
CREATE TABLE public.predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gender TEXT,
    race_ethnicity TEXT,
    parental_level_of_education TEXT,
    lunch TEXT,
    test_preparation_course TEXT,
    reading_score NUMERIC,
    writing_score NUMERIC,
    predicted_score NUMERIC,
    risk_level TEXT,
    shap_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ALERTS table
CREATE TABLE public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    educator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- can be null if any educator picks it
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Note: Since the backend uses the service_role key, it will bypass RLS.
-- These RLS policies are mainly if the frontend ever connects directly using the anon key.

-- PROFILES policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Educators and Admins can view all profiles" 
ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('educator', 'admin')
  )
);

-- PREDICTIONS policies
CREATE POLICY "Students can view their own predictions" 
ON public.predictions FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Educators and Admins can view all predictions" 
ON public.predictions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('educator', 'admin')
  )
);

-- ALERTS policies
CREATE POLICY "Educators and Admins can view all alerts" 
ON public.alerts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('educator', 'admin')
  )
);

CREATE POLICY "Educators can update alert status" 
ON public.alerts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'
  )
);
