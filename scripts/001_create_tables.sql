-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (administradores)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de convenciones
CREATE TABLE IF NOT EXISTS convenciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  costo DECIMAL(10, 2) DEFAULT 0,
  cupo_maximo INTEGER,
  imagen_url TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pastores
CREATE TABLE IF NOT EXISTS pastores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  sede VARCHAR(255),
  cargo VARCHAR(255),
  foto_url TEXT,
  biografia TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  convencion_id UUID REFERENCES convenciones(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  sede VARCHAR(255),
  tipo_inscripcion VARCHAR(50) DEFAULT 'pastor',
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de galería
CREATE TABLE IF NOT EXISTS galeria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT NOT NULL,
  categoria VARCHAR(100),
  convencion_id UUID REFERENCES convenciones(id) ON DELETE SET NULL,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  referencia VARCHAR(255),
  fecha_pago TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_convenciones_activa ON convenciones(activa);
CREATE INDEX idx_convenciones_fecha_inicio ON convenciones(fecha_inicio);
CREATE INDEX idx_pastores_activo ON pastores(activo);
CREATE INDEX idx_pastores_sede ON pastores(sede);
CREATE INDEX idx_inscripciones_convencion ON inscripciones(convencion_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX idx_galeria_categoria ON galeria(categoria);
CREATE INDEX idx_pagos_inscripcion ON pagos(inscripcion_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_convenciones_updated_at BEFORE UPDATE ON convenciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pastores_updated_at BEFORE UPDATE ON pastores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inscripciones_updated_at BEFORE UPDATE ON inscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_galeria_updated_at BEFORE UPDATE ON galeria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
