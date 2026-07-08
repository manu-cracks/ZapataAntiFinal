-- Drop tables if exist to make it idempotent
DROP TABLE IF EXISTS public.progreso_usuarios CASCADE;
DROP TABLE IF EXISTS public.analogias CASCADE;
DROP TABLE IF EXISTS public.niveles CASCADE;
DROP TYPE IF EXISTS channel_type CASCADE;
DROP TYPE IF EXISTS level_status CASCADE;

-- 1. Create custom ENUM types
CREATE TYPE channel_type AS ENUM ('aritmética', 'álgebra', 'física');
CREATE TYPE level_status AS ENUM ('active', 'locked', 'dx');

-- 2. Niveles Table
CREATE TABLE public.niveles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(100) NOT NULL,
    canal channel_type NOT NULL,
    estado level_status NOT NULL DEFAULT 'locked',
    formula_latex TEXT NOT NULL,
    prerrequisito_id UUID REFERENCES public.niveles(id) ON DELETE SET NULL,
    orden_index INT NOT NULL,
    creado_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure order indexes are positive
    CONSTRAINT positive_order_index CHECK (orden_index >= 0)
);

CREATE INDEX idx_niveles_canal_orden ON public.niveles(canal, orden_index);

-- 3. Analogias Table
CREATE TABLE public.analogias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nivel_id UUID UNIQUE NOT NULL REFERENCES public.niveles(id) ON DELETE CASCADE,
    ruta_imagen TEXT NOT NULL,
    pregunta_texto TEXT NOT NULL,
    respuesta_correcta VARCHAR(255) NOT NULL,
    respuestas_incorrectas VARCHAR(255)[] NOT NULL,
    creado_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT check_wrong_answers_count CHECK (array_length(respuestas_incorrectas, 1) = 3)
);

-- 4. Progreso Usuarios Table
CREATE TABLE public.progreso_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nivel_id UUID NOT NULL REFERENCES public.niveles(id) ON DELETE CASCADE,
    completado_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    puntaje_energia INT NOT NULL CHECK (puntaje_energia >= 0 AND puntaje_energia <= 100),
    
    CONSTRAINT unique_usuario_nivel_progreso UNIQUE (usuario_id, nivel_id)
);

CREATE INDEX idx_progreso_usuario ON public.progreso_usuarios(usuario_id);

-- 5. RLS Activation
ALTER TABLE public.niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analogias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_usuarios ENABLE ROW LEVEL SECURITY;

-- 6. Policies
CREATE POLICY "Permitir lectura global de niveles" 
ON public.niveles FOR SELECT 
USING (true);

CREATE POLICY "Permitir lectura global de analogias" 
ON public.analogias FOR SELECT 
USING (true);

CREATE POLICY "Usuarios pueden leer su propio progreso" 
ON public.progreso_usuarios FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden registrar su propio progreso" 
ON public.progreso_usuarios FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio progreso" 
ON public.progreso_usuarios FOR UPDATE 
USING (auth.uid() = usuario_id);

-- 7. Seeding Data
INSERT INTO public.niveles (id, titulo, canal, estado, formula_latex, orden_index) VALUES
('8f830a3b-2bd4-44df-9e45-b4bb183e8b08', 'Suma de Fracciones', 'aritmética', 'active', $$\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}$$, 1),
('e4f8d976-78ab-41c3-88cc-b0c6a5d4e321', 'Multiplicación de Fracciones', 'aritmética', 'active', $$\frac{a}{b} \cdot \frac{c}{d} = \frac{ac}{bd}$$, 2),
('11a22b33-cc44-55dd-66ee-77ff88aa99bb', 'Fracciones dx', 'aritmética', 'dx', $$\frac{a}{b} \div \frac{c}{d} = \frac{ad}{bc}$$, 3),
('22b33c44-dd55-66ee-77ff-88aa99bb00cc', 'Ecuación Lineal', 'álgebra', 'active', $$ax + b = c \implies x = \frac{c-b}{a}$$, 1),
('33c44d55-ee66-77ff-88aa-99bb00cc11dd', 'Binomio al Cuadrado', 'álgebra', 'active', $$(a+b)^2 = a^2 + 2ab + b^2$$, 2),
('44d55e66-ff77-88aa-99bb-00cc11dd22ee', 'Diferencia de Cuadrados', 'álgebra', 'active', $$a^2 - b^2 = (a-b)(a+b)$$, 3),
('55e66f77-aa88-99bb-00cc-11dd22ee33ff', 'Velocidad Media', 'física', 'active', $$v = \frac{d}{t}$$, 1),
('66f77a88-bb99-00cc-11dd-22ee33ff44aa', 'Segunda Ley de Newton', 'física', 'active', $$F = m \cdot a$$, 2),
('77a88b99-cc00-11dd-22ee-33ff44aa55bb', 'Relatividad Especial dx', 'física', 'dx', $$E = m \cdot c^2$$, 3);

-- Update prerequisites
UPDATE public.niveles SET prerrequisito_id = '8f830a3b-2bd4-44df-9e45-b4bb183e8b08' WHERE titulo = 'Multiplicación de Fracciones';
UPDATE public.niveles SET prerrequisito_id = 'e4f8d976-78ab-41c3-88cc-b0c6a5d4e321' WHERE titulo = 'Fracciones dx';
UPDATE public.niveles SET prerrequisito_id = '22b33c44-dd55-66ee-77ff-88aa99bb00cc' WHERE titulo = 'Binomio al Cuadrado';
UPDATE public.niveles SET prerrequisito_id = '33c44d55-ee66-77ff-88aa-99bb00cc11dd' WHERE titulo = 'Diferencia de Cuadrados';
UPDATE public.niveles SET prerrequisito_id = '55e66f77-aa88-99bb-00cc-11dd22ee33ff' WHERE titulo = 'Segunda Ley de Newton';
UPDATE public.niveles SET prerrequisito_id = '66f77a88-bb99-00cc-11dd-22ee33ff44aa' WHERE titulo = 'Relatividad Especial dx';

-- Seeding Analogies
INSERT INTO public.analogias (nivel_id, ruta_imagen, pregunta_texto, respuesta_correcta, respuestas_incorrectas) VALUES
('8f830a3b-2bd4-44df-9e45-b4bb183e8b08', 'pizza-sum.png', 'Si tienes 1/2 de una pizza y sumas 1/3 de otra pizza, ¿qué porción de pizza tienes en total?', '5/6', ARRAY['2/5', '2/3', '3/4']),
('e4f8d976-78ab-41c3-88cc-b0c6a5d4e321', 'cake-mul.png', 'Tienes 1/2 pastel y le das 1/3 de tu porción a un amigo. ¿Qué fracción del pastel total le diste?', '1/6', ARRAY['2/5', '1/4', '1/2']),
('22b33c44-dd55-66ee-77ff-88aa99bb00cc', 'taxi-ride.png', 'Un taxi cobra un cargo fijo de $2 y luego $3 por km. Si el costo total es $14, ¿cuántos km viajaste (x)?', '4', ARRAY['2', '5', '3']),
('33c44d55-ee66-77ff-88aa-99bb00cc11dd', 'room-expansion.png', 'Una habitación cuadrada de lado ''a'' se expande en ''b'' metros en ambas direcciones. ¿Cuál es su nueva área total?', 'a² + 2ab + b²', ARRAY['a² + b²', 'a² - 2ab + b²', '2a + 2b']),
('44d55e66-ff77-88aa-99bb-00cc11dd22ee', 'garden-sub.png', 'A un terreno cuadrado de área a² le quitas una porción cuadrada de área b². ¿Cómo se expresa su nueva área combinada?', '(a-b)(a+b)', ARRAY['(a-b)²', 'a² + 2ab - b²', 'a² - 2ab + b²']),
('55e66f77-aa88-99bb-00cc-11dd22ee33ff', 'car-trip.png', 'Un auto recorre 240 km en 3 horas. ¿Cuál fue su velocidad media (v) durante el trayecto?', '80 km/h', ARRAY['60 km/h', '100 km/h', '120 km/h']),
('66f77a88-bb99-00cc-11dd-22ee33ff44aa', 'box-push.png', 'Empujas una caja de 10 kg con una aceleración de 2 m/s². ¿Qué fuerza neta (F) estás aplicando?', '20 N', ARRAY['10 N', '5 N', '50 N']);
