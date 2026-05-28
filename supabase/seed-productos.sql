-- Ejecutar en: supabase.com → tu proyecto → SQL Editor

-- 1. Actualizar productos existentes con la categoría antigua
UPDATE productos
SET categoria = 'Productos oficiales'
WHERE categoria = 'Merchandising';

-- 2. Insertar Estampita (solo si no existe ya)
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, activo)
SELECT 'Estampita', 'Estampita oficial de nuestra imagen de Jesús.', 5.00, 100,
       'Productos oficiales', '/images/estampita.png', true
WHERE NOT EXISTS (
    SELECT 1 FROM productos WHERE nombre = 'Estampita'
);
