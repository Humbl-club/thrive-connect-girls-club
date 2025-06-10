
-- Add missing columns to the challenges table
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS goal integer DEFAULT 10000,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'steps',
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public';

-- Add missing role column to the profiles table  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
