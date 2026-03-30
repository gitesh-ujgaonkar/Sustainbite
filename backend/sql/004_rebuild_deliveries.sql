-- Drop the table entirely to remove enum dependencies
DROP TABLE IF EXISTS public.deliveries CASCADE;

-- Recreate the table with generic TEXT columns
CREATE TABLE public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    ngo_id UUID REFERENCES public.ngos(id) ON DELETE SET NULL,
    dish_name TEXT NOT NULL,
    food_category TEXT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    restaurant_remark TEXT,
    status TEXT DEFAULT 'AVAILABLE',
    pickup_otp TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to SELECT (read) deliveries
CREATE POLICY "Allow anyone to read deliveries" 
    ON public.deliveries 
    FOR SELECT 
    USING (true);

-- 2. Allow restaurants to INSERT
CREATE POLICY "Allow restaurants to insert deliveries" 
    ON public.deliveries 
    FOR INSERT 
    WITH CHECK (auth.uid() = restaurant_id);

-- 3. Allow volunteers and restaurants to UPDATE
CREATE POLICY "Allow related users to update deliveries" 
    ON public.deliveries 
    FOR UPDATE 
    USING (auth.uid() = volunteer_id OR auth.uid() = restaurant_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = volunteer_id OR auth.uid() = restaurant_id OR auth.role() = 'service_role');
