-- Alter tables to make equation and analogy fields optional (nullable)
ALTER TABLE public.niveles ALTER COLUMN formula_latex DROP NOT NULL;

ALTER TABLE public.analogias ALTER COLUMN ruta_imagen DROP NOT NULL;
ALTER TABLE public.analogias ALTER COLUMN pregunta_texto DROP NOT NULL;
ALTER TABLE public.analogias ALTER COLUMN respuesta_correcta DROP NOT NULL;
ALTER TABLE public.analogias ALTER COLUMN respuestas_incorrectas DROP NOT NULL;
