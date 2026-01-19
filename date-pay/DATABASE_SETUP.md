# Database Setup for Profile Matching

The profile matching functionality requires some database functions and triggers to be set up in your Supabase project. Follow these steps to enable the feature:

## 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

## 2. Run the Following SQL Commands

### Create the Match Checking Function

```sql
-- Create function to check for matches when a swipe is created
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only check for matches on likes
  IF NEW.action = 'like' THEN
    -- Check if there's a mutual like
    IF EXISTS (
      SELECT 1 FROM public.swipes 
      WHERE swiper_id = NEW.swiped_id 
      AND swiped_id = NEW.swiper_id 
      AND action = 'like'
    ) THEN
      -- Create a match (avoid duplicates by using least/greatest)
      INSERT INTO public.matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
```

### Create the Trigger

```sql
-- Create trigger to automatically check for matches when a swipe is created
CREATE TRIGGER on_swipe_created
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_for_match();
```

### Fix RLS Policies for Date Requests

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create date requests" ON public.date_requests;
DROP POLICY IF EXISTS "Users can update their received date requests" ON public.date_requests;

-- Create more permissive policies that allow proper functionality
CREATE POLICY "Users can create date requests" ON public.date_requests 
FOR INSERT WITH CHECK (auth.uid() = requester_id OR auth.uid() = requested_id);

CREATE POLICY "Users can update their own date requests" ON public.date_requests 
FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = requested_id);

CREATE POLICY "Users can delete their own date requests" ON public.date_requests 
FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = requested_id);
```

### Add Foreign Key Constraints (Optional but Recommended)

```sql
-- Add foreign key constraints to profiles table for easier joins
-- This makes the date request queries more efficient
ALTER TABLE public.date_requests 
ADD CONSTRAINT date_requests_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.date_requests 
ADD CONSTRAINT date_requests_requested_id_fkey 
FOREIGN KEY (requested_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
```

## 3. Verify the Setup

After running the SQL commands:

1. The function `check_for_match()` should be created
2. The trigger `on_swipe_created` should be attached to the `swipes` table
3. The RLS policies should be updated to allow proper date request creation
4. The foreign key constraints should be created (if you ran the optional commands)
5. When a user swipes right (likes) on a profile, the system will automatically:
   - Record the swipe in the `swipes` table
   - Check if there's a mutual like
   - Create a match in the `matches` table if both users liked each other

## 4. Test the Functionality

1. Create two test user accounts
2. Have one user swipe right on the other's profile
3. Have the second user swipe right on the first user's profile
4. Check the `matches` table to see if a match was created

## 5. Test Date Request Swiping

1. Create a date request from one user to another
2. The recipient should see the date request in their "Date Requests" tab
3. Swipe right to accept → Creates a match!
4. Swipe left to decline → Marks as declined

## Troubleshooting

If you encounter any issues:

1. **Row-Level Security Error**: If you get "new row violates row-level security policy" errors, make sure you've run the RLS policy fixes above.

2. **Foreign Key Error**: If you get errors about missing relationships, the foreign key constraints may not be set up. The system will work without them, but queries may be slower.

3. **Check the Supabase logs** for any error messages

4. **Verify that the RLS policies** allow the function to work

5. **Ensure the `swipes` and `matches` tables exist** and have the correct structure

## Notes

- The function uses `SECURITY DEFINER` to bypass RLS policies
- Matches are created automatically when there are mutual likes
- The system prevents duplicate matches using the `ON CONFLICT` clause
- User IDs are ordered (least/greatest) to ensure consistent match records
- RLS policies have been updated to allow proper date request functionality
- Foreign key constraints are optional but improve query performance
- The system will work with or without the foreign key constraints
