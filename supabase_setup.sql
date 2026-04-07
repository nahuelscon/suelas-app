-- ============================================
-- EJECUTAR ESTO EN SUPABASE > SQL EDITOR
-- ============================================

-- Tabla de modelos de suelas
CREATE TABLE IF NOT EXISTS modelos_suela (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  temporada TEXT NOT NULL CHECK (temporada IN ('verano', 'invierno')),
  categoria TEXT NOT NULL CHECK (categoria IN ('dama', 'nino')),
  descripcion TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes de tendencias
CREATE TABLE IF NOT EXISTS reportes_tendencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  temporada TEXT NOT NULL,
  concepto_dama TEXT,
  concepto_nino TEXT,
  alerta_emergente TEXT,
  texto_completo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar acceso público de lectura a modelos_suela
ALTER TABLE modelos_suela ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura publica modelos" ON modelos_suela FOR SELECT USING (true);
CREATE POLICY "Insercion publica modelos" ON modelos_suela FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminacion publica modelos" ON modelos_suela FOR DELETE USING (true);

-- Habilitar acceso público de lectura a reportes
ALTER TABLE reportes_tendencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura publica reportes" ON reportes_tendencias FOR SELECT USING (true);
CREATE POLICY "Insercion publica reportes" ON reportes_tendencias FOR INSERT WITH CHECK (true);
