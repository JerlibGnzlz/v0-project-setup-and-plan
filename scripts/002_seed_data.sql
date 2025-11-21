-- Insertar usuario administrador de prueba
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (email, password, nombre, rol) 
VALUES (
  'admin@ministerio-amva.org',
  '$2b$10$rOjLPqGnJkKV5Y.WKJxpw.5yYlG/M4xZ9YqN6hQ8YxHJKl6H5Kp5O',
  'Administrador Principal',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insertar convención de ejemplo
INSERT INTO convenciones (titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, costo, cupo_maximo, activa)
VALUES (
  'Convención Anual 2025',
  'Gran convención anual del ministerio con enseñanzas, adoración y compañerismo',
  '2025-06-15 09:00:00',
  '2025-06-17 18:00:00',
  'Argentina',
  150.00,
  500,
  true
);

-- Insertar pastores de ejemplo
INSERT INTO pastores (nombre, apellido, email, telefono, sede, cargo, activo)
VALUES 
  ('Juan', 'Pérez', 'juan.perez@ministerio.org', '+54 11 1234-5678', 'Buenos Aires', 'Pastor Principal', true),
  ('María', 'González', 'maria.gonzalez@ministerio.org', '+54 11 2345-6789', 'Córdoba', 'Pastora Asociada', true),
  ('Carlos', 'Rodríguez', 'carlos.rodriguez@ministerio.org', '+54 11 3456-7890', 'Rosario', 'Pastor de Jóvenes', true);

-- Insertar categorías de galería
INSERT INTO galeria (titulo, descripcion, imagen_url, categoria, orden, activa)
VALUES 
  ('Convención 2024', 'Momentos especiales de nuestra convención anual', '/placeholder.svg?height=400&width=600', 'convenciones', 1, true),
  ('Alabanza y Adoración', 'Nuestro equipo de alabanza en acción', '/placeholder.svg?height=400&width=600', 'alabanza', 2, true),
  ('Reuniones de Pastores', 'Capacitación y comunión pastoral', '/placeholder.svg?height=400&width=600', 'reuniones', 3, true);
