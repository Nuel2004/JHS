-- ============================================================
-- Seed: Hermanos de demostración con más de 10 años de antigüedad
-- Ejecutar en el SQL Editor de Supabase
-- Fecha de referencia: 2026-05-11
-- ============================================================

INSERT INTO hermanos (
  auth_id, nombre, apellidos, genero, direccion,
  fecha_nacimiento, email, telefono,
  bautizado, es_cofrade,
  estado, rol, preferencia_paso,
  pago_presencial, fecha_alta,
  stripe_customer_id, notas_admin
) VALUES

-- 1. Ana María Vega Ramos — 51 años, ~19 años en la hermandad
(NULL, 'Ana María', 'Vega Ramos', 'Mujer',
 'Calle Real, 12, Montijo',
 '1975-03-12', 'anavega@demo.jhs', '924111001',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2006-09-15',
 NULL, 'Dato de demostración'),

-- 2. José Morales Díaz — 67 años, ~23 años en la hermandad
(NULL, 'José', 'Morales Díaz', 'Hombre',
 'Avenida Extremadura, 45, Montijo',
 '1958-07-22', 'josemorales@demo.jhs', '924111002',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2003-01-20',
 NULL, 'Dato de demostración'),

-- 3. Carmen Blanco Herrera — 37 años, ~13 años en la hermandad
(NULL, 'Carmen', 'Blanco Herrera', 'Mujer',
 'Plaza de España, 3, Montijo',
 '1988-11-05', 'carmenblanco@demo.jhs', '924111003',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2013-04-10',
 NULL, 'Dato de demostración'),

-- 4. Francisco Ruiz López — 60 años, ~24 años en la hermandad
(NULL, 'Francisco', 'Ruiz López', 'Hombre',
 'Calle San Pedro, 8, Montijo',
 '1965-04-30', 'franciscoruiz@demo.jhs', '924111004',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2001-06-01',
 NULL, 'Dato de demostración'),

-- 5. María Gómez Sánchez — 45 años, ~17 años en la hermandad
(NULL, 'María', 'Gómez Sánchez', 'Mujer',
 'Calle Nueva, 21, Montijo',
 '1980-08-18', 'mariagomez@demo.jhs', '924111005',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2009-02-28',
 NULL, 'Dato de demostración'),

-- 6. Miguel Torres Fernández — 53 años, ~20 años en la hermandad
(NULL, 'Miguel', 'Torres Fernández', 'Hombre',
 'Calle Iglesia, 5, Montijo',
 '1972-12-03', 'migueltorres@demo.jhs', '924111006',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2005-11-12',
 NULL, 'Dato de demostración'),

-- 7. Isabel Martín Castillo — 30 años, ~12 años en la hermandad
(NULL, 'Isabel', 'Martín Castillo', 'Mujer',
 'Avenida de la Paz, 17, Montijo',
 '1995-06-15', 'isabelmartin@demo.jhs', '924111007',
 TRUE, TRUE,
 'activo', 'hermano', NULL,
 FALSE, '2014-03-15',
 NULL, 'Dato de demostración');