-- Add referral_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE;

-- Create index on referral_code for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles (referral_code);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.referral_code IS 'Unique referral code for each user to share with others';
