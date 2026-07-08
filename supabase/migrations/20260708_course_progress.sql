-- Function to dynamically calculate user course progress
CREATE OR REPLACE FUNCTION public.obtener_progreso_cursos(user_id_param UUID)
RETURNS TABLE (
    canal_id UUID,
    canal_slug VARCHAR,
    canal_nombre VARCHAR,
    totales BIGINT,
    completados BIGINT,
    porcentaje INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS canal_id,
        c.slug::VARCHAR AS canal_slug,
        c.nombre::VARCHAR AS canal_nombre,
        COUNT(n.id)::BIGINT AS totales,
        COUNT(p.id)::BIGINT AS completados,
        CASE 
            WHEN COUNT(n.id) = 0 THEN 0
            ELSE ((COUNT(p.id) * 100) / COUNT(n.id))::INT
        END AS porcentaje
    FROM public.canales c
    LEFT JOIN public.niveles n ON n.canal = c.slug
    LEFT JOIN public.progreso_usuarios p ON p.nivel_id = n.id AND p.usuario_id = user_id_param
    GROUP BY c.id, c.slug, c.nombre, c.creado_at
    ORDER BY c.creado_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.obtener_progreso_cursos(UUID) TO anon, authenticated, service_role;
