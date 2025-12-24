# Solución para Error P1002 - Timeout de Conexión a Neon

## Error
```
Error: P1002
The database server at `ep-royal-fog-adfbwf9n-pooler.c-2.us-east-1.aws.neon.tech:5432` was reached but timed out.
```

## Causas Comunes

### 1. Base de Datos Pausada (Más Común)
Neon pausa automáticamente las bases de datos que están inactivas por más de 5 minutos (en el plan gratuito).

**Solución:**
1. Ve a tu dashboard de Neon: https://console.neon.tech/
2. Selecciona tu proyecto
3. Si la base de datos está pausada, verás un botón "Resume" o "Resume Database"
4. Haz clic en "Resume" para reactivar la base de datos
5. Espera unos segundos mientras se reactiva
6. Intenta la conexión nuevamente

### 2. URL de Conexión Incorrecta

**Verificar la URL de conexión:**

La URL de Neon debe tener este formato:
```
postgresql://usuario:password@host.neon.tech/database?sslmode=require
```

**Para conexiones con pooler (recomendado):**
```
postgresql://usuario:password@host-pooler.neon.tech/database?sslmode=require
```

**Pasos para obtener la URL correcta:**
1. Ve a tu dashboard de Neon
2. Selecciona tu proyecto
3. Ve a la sección "Connection Details"
4. Copia la URL de conexión completa
5. Asegúrate de usar la URL con `-pooler` si está disponible (mejor rendimiento)

### 3. Problemas de Red Temporales

**Solución:**
1. Espera unos minutos y vuelve a intentar
2. Verifica tu conexión a internet
3. Si estás usando VPN, intenta desconectarla temporalmente

### 4. Configuración de Timeout

**Aumentar el timeout en Prisma:**

Edita `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Aumentar timeout de conexión
  directUrl = env("DATABASE_DIRECT_URL") // URL directa sin pooler (opcional)
}
```

O agrega parámetros de conexión a la URL:
```
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require&connect_timeout=10&pool_timeout=10"
```

### 5. Usar URL Directa en lugar de Pooler

Si el pooler está causando problemas, intenta usar la URL directa:

1. En Neon Dashboard, ve a "Connection Details"
2. Busca la sección "Direct connection" (no pooler)
3. Copia esa URL
4. Úsala temporalmente en tu `.env`

**Nota:** La URL directa puede ser más lenta pero más estable para migraciones.

## Soluciones Rápidas

### Opción 1: Reactivar la Base de Datos (Más Rápido)
```bash
# 1. Ve a https://console.neon.tech/
# 2. Selecciona tu proyecto
# 3. Haz clic en "Resume" si está pausada
# 4. Espera 10-30 segundos
# 5. Intenta nuevamente
```

### Opción 2: Verificar Variables de Entorno
```bash
# Verificar que DATABASE_URL esté configurada
cd backend
cat .env | grep DATABASE_URL

# Si no existe, crear .env desde .env.example
cp env.example.txt .env
# Editar .env con tu URL de Neon
```

### Opción 3: Probar Conexión Directa
```bash
# Probar conexión con psql (si está instalado)
psql "postgresql://usuario:password@host.neon.tech/database?sslmode=require"

# O usar Prisma Studio para probar
cd backend
npx prisma studio
```

## Configuración Recomendada para Neon

### En `.env`:
```env
# URL con pooler (recomendado para producción)
DATABASE_URL="postgresql://usuario:password@host-pooler.neon.tech/database?sslmode=require&connect_timeout=10"

# URL directa (para migraciones y desarrollo)
DATABASE_DIRECT_URL="postgresql://usuario:password@host.neon.tech/database?sslmode=require"
```

### En `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL") // Opcional, para migraciones
}
```

## Prevención

### Para Evitar que la Base de Datos se Pause:

1. **Plan de Pago:** Los planes pagos de Neon no pausan automáticamente
2. **Keep-Alive Script:** Crear un script que haga una query periódica:
   ```bash
   # Ejecutar cada 4 minutos para mantener activa la BD
   */4 * * * * cd /ruta/al/backend && npx prisma db execute --stdin <<< "SELECT 1"
   ```

3. **Conexión Persistente:** Configurar Prisma para mantener conexiones activas

## Verificación

Después de aplicar las soluciones, verifica la conexión:

```bash
cd backend
npx prisma db pull  # Intenta conectarse y obtener el schema
# O
npx prisma migrate status  # Verifica estado de migraciones
```

## Contacto con Soporte

Si el problema persiste:
1. Revisa los logs en Neon Dashboard
2. Verifica el estado del servicio en https://status.neon.tech/
3. Contacta soporte de Neon si es necesario

---

**Nota:** Este error es común en desarrollo con Neon gratuito. La solución más rápida suele ser reactivar la base de datos desde el dashboard.

