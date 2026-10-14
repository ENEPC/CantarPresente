-- Roles del sistema (RF-02). Ids fijos (1 y 2) para que el backend pueda referenciarlos
-- sin lookup: voluntario opera solo sus coros asignados; admin ve y administra todo.
INSERT INTO roles (id, nombre, descripcion) VALUES
  (1, 'voluntario', 'Coordinador de coro: opera sobre los coros asignados (RF-03)'),
  (2, 'admin', 'Administración: ABM de usuarios, sedes, coros y participantes')
ON CONFLICT (nombre) DO NOTHING;

-- Tras insertar ids explícitos, la secuencia de la identity queda en 1: se adelanta
-- para que futuros INSERT sin id no choquen con los seeds.
SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles));
