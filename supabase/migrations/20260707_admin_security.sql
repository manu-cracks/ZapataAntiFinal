-- 1. Create admin profiles table
CREATE TABLE IF NOT EXISTS public.perfiles_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    creado_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert the admin email
INSERT INTO public.perfiles_admin (email) 
VALUES ('enzocostareyes@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Create security function to check if email is admin
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.perfiles_admin 
        WHERE email = auth.jwt() ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply write policies on public.niveles (read is already public)
DROP POLICY IF EXISTS "Permitir escritura a administradores" ON public.niveles;
CREATE POLICY "Permitir escritura a administradores" 
ON public.niveles FOR ALL 
TO authenticated
USING (public.es_administrador())
WITH CHECK (public.es_administrador());

-- Apply write policies on public.analogias (read is already public)
DROP POLICY IF EXISTS "Permitir escritura a administradores de analogias" ON public.analogias;
CREATE POLICY "Permitir escritura a administradores de analogias" 
ON public.analogias FOR ALL 
TO authenticated
USING (public.es_administrador())
WITH CHECK (public.es_administrador());

-- 4. Create the storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analogias-imagenes', 'analogias-imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Setup storage access policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Write Access" ON storage.objects;

CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'analogias-imagenes');

CREATE POLICY "Admin Write Access" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'analogias-imagenes' AND public.es_administrador())
WITH CHECK (bucket_id = 'analogias-imagenes' AND public.es_administrador());
