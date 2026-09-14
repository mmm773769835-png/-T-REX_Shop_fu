-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add views_count to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 3. Insert default categories if table is empty
INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'إلكترونيات', 'Electronics', 'phone-portrait-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Electronics');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'أزياء', 'Fashion', 'shirt-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Fashion');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'منزل', 'Home', 'home-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Home');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'رياضة', 'Sports', 'football-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Sports');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'جمال', 'Beauty', 'sparkles-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Beauty');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'سيارات ومستلزمات السيارات', 'Cars & Automotive', 'car-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Cars & Automotive');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'مطعم و بقالة', 'Restaurant & Grocery', 'basket-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Restaurant & Grocery');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'أحذية', 'Shoes', 'footsteps-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Shoes');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'إكسسوارات', 'Accessories', 'diamond-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Accessories');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'ألعاب', 'Toys', 'game-controller-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Toys');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'صحة', 'Health', 'medical-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Health');

INSERT INTO public.categories (name_ar, name_en, icon)
SELECT 'كتب', 'Books', 'book-outline'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Books');

-- 4. Function to increment views safely
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to calculate average vendor rating based on all their products reviews
CREATE OR REPLACE FUNCTION get_vendor_rating(v_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(r.rating), 0)
  INTO avg_rating
  FROM public.reviews r
  JOIN public.products p ON r.product_id = p.id
  WHERE p.vendor_id = v_id;
  
  RETURN ROUND(avg_rating, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
