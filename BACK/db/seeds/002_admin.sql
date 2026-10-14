-- Usuario administrador inicial del prototipo.
-- El hash bcrypt ($2a$) lo genera Postgres con pgcrypto: compatible con bcryptjs del backend.
-- ATENCIÓN: contraseña provisoria de prototipo; cambiarla tras el primer uso.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
SELECT 'Admin', 'Cantar Presente', 'admin@cantarpresente.local',
       crypt('Cambiar123!', gen_salt('bf')),
       (SELECT id FROM roles WHERE nombre = 'admin')
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@cantarpresente.local');
