-- Índices y vistas de indicadores (RF-09, RF-19..21, RF-27..29)

-- RF-09/28: conteos y reportes por sede
CREATE INDEX idx_coros_sede ON coros (sede_id);

-- RF-19/21: historial por participante (la PK cubre clase_id, no el orden inverso)
CREATE INDEX idx_asistencias_participante_clase ON asistencias (participante_id, clase_id);

-- RF-09/16: padrón activo por coro
CREATE INDEX idx_participantes_coros_activos ON participantes_coros (coro_id) WHERE fecha_baja IS NULL;

-- Filtros por rango de fechas en GET /api/attendances
CREATE INDEX idx_clases_fecha ON clases (fecha);

-- RF-09/28: participantes activos por coro y sede
CREATE VIEW v_participantes_activos_por_coro AS
SELECT c.id AS coro_id, c.nombre AS coro_nombre,
       s.id AS sede_id, s.nombre AS sede_nombre,
       count(*) AS participantes_activos
FROM coros c
JOIN sedes s ON s.id = c.sede_id
JOIN participantes_coros pc ON pc.coro_id = c.id AND pc.fecha_baja IS NULL
JOIN participantes p ON p.id = pc.participante_id AND p.activo AND p.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.nombre, s.id, s.nombre;

-- RF-20/27: totales por estado en cada clase
CREATE VIEW v_asistencia_por_clase AS
SELECT c.id AS clase_id, c.coro_id, c.fecha,
       count(*) FILTER (WHERE a.estado = 'presente') AS presentes,
       count(*) FILTER (WHERE a.estado = 'ausente') AS ausentes,
       count(*) FILTER (WHERE a.estado = 'justificado') AS justificados,
       count(*) AS total
FROM clases c
JOIN asistencias a ON a.clase_id = c.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.coro_id, c.fecha;

-- RF-27/28: % de asistencia mensual por coro y sede (reportes a donantes)
CREATE VIEW v_asistencia_mensual_por_coro AS
SELECT co.id AS coro_id, co.nombre AS coro_nombre,
       s.id AS sede_id, s.nombre AS sede_nombre,
       to_char(cl.fecha, 'YYYY-MM') AS mes,
       count(*) AS registros,
       count(*) FILTER (WHERE a.estado = 'presente') AS presentes,
       count(*) FILTER (WHERE a.estado = 'justificado') AS justificados,
       round(100.0 * count(*) FILTER (WHERE a.estado IN ('presente','justificado')) / count(*), 1) AS pct_asistencia
FROM clases cl
JOIN coros co ON co.id = cl.coro_id
JOIN sedes s ON s.id = co.sede_id
JOIN asistencias a ON a.clase_id = cl.id
WHERE cl.deleted_at IS NULL
GROUP BY co.id, co.nombre, s.id, s.nombre, to_char(cl.fecha, 'YYYY-MM');

-- RF-19/21: historial simple por participante
CREATE VIEW v_historial_participante AS
SELECT a.participante_id, p.nombre, p.apellido,
       cl.coro_id, cl.fecha, a.estado
FROM asistencias a
JOIN participantes p ON p.id = a.participante_id
JOIN clases cl ON cl.id = a.clase_id AND cl.deleted_at IS NULL;

-- Rachas de ausencias consecutivas (alertas de umbral): quedan como consulta con
-- window functions para el panel admin; no se materializan por el volumen actual.
