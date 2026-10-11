-- Seguridad: la app accede solo via backend (rol postgres, dueño de las tablas,
-- que no pasa por RLS). Bloqueamos la API REST (PostgREST) para anon/authenticated.
-- Ejecutar desde el SQL Editor de Supabase cuando quieras.

-- RLS sin políticas = deny para todo rol que no sea el dueño
ALTER TABLE sedes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE coros               ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_coros      ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes_coros ENABLE ROW LEVEL SECURITY;
ALTER TABLE clases              ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias         ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sincronizaciones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations   ENABLE ROW LEVEL SECURITY;

-- Las vistas corren como su dueño por defecto: sin esto, anon leería a través de ellas
ALTER VIEW v_participantes_activos_por_coro SET (security_invoker = on);
ALTER VIEW v_asistencia_por_clase          SET (security_invoker = on);
ALTER VIEW v_asistencia_mensual_por_coro   SET (security_invoker = on);
ALTER VIEW v_historial_participante        SET (security_invoker = on);

-- Defensa en profundidad: quitar privilegios a los roles de la API
REVOKE ALL ON ALL TABLES IN SCHEMA public    FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
