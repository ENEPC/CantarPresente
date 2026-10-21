-- DNI obligatorio y único en participantes.
-- Las filas existentes reciben un DNI aleatorio provisorio de 8 dígitos:
-- sin él, ALTER COLUMN SET NOT NULL fallaría sobre datos ya cargados.
-- Los DNIs reales deben reemplazarlos con un UPDATE posterior.

ALTER TABLE participantes ADD COLUMN IF NOT EXISTS dni TEXT;

WITH numerados AS (
  SELECT ctid,
         (floor(random() * 90000000) + 10000000)::bigint::text AS dni_random
  FROM participantes
  WHERE dni IS NULL
)
UPDATE participantes p
SET dni = n.dni_random
FROM numerados n
WHERE p.ctid = n.ctid;

ALTER TABLE participantes ALTER COLUMN dni SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS participantes_dni_key ON participantes (dni);
