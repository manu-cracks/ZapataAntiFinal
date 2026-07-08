-- Create perfiles table for custom user metadata
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nick TEXT,
    creado_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Enable Policies
DROP POLICY IF EXISTS "Permitir lectura de perfiles a todos" ON public.perfiles;
CREATE POLICY "Permitir lectura de perfiles a todos" 
ON public.perfiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Usuarios pueden modificar su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios pueden modificar su propio perfil" 
ON public.perfiles FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
