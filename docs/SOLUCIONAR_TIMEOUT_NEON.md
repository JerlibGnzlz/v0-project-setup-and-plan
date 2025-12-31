# 🔧 Solucionar Error P1002: Timeout de Conexión a Neon

## 🎯 Problema

```
Error: P1002
The database server at `ep-royal-fog-adfbwf9n-pooler.c-2.us-east-1.aws.neon.tech:5432` was reached but timed out.
```

Este error significa que Prisma **pudo alcanzar** el servidor de Neon, pero la conexión **expiró** antes de completarse.

---

## ✅ Soluciones

### Solución 1: Reactivar Base de Datos en Neon (Más Común)

**Neon pausa automáticamente las bases de datos gratuitas después de 5 minutos de inactividad.**

#### Paso 1: Ir a Neon Dashboard

1. Ve a: **https://console.neon.tech**
2. Inicia sesión con tu cuenta

#### Paso 2: Seleccionar Proyecto

1. En la lista de proyectos, busca tu proyecto (probablemente `amva-digital` o similar)
2. Haz clic en el proyecto

#### Paso 3: Reactivar Base de Datos

1. Si la base de datos está pausada, verás un botón **"Resume"** o **"Resume Database"**
2. Haz clic en **"Resume"**
3. Espera unos segundos a que se reactive

#### Paso 4: Verificar Estado

1. Deberías ver el estado cambiar a **"Active"** o **"Running"**
2. Ahora intenta ejecutar el comando de Prisma nuevamente

---

### Solución 2: Verificar Variables de Entorno

#### Paso 1: Verificar DATABASE_URL

Asegúrate de que `DATABASE_URL` esté configurada correctamente:

**En desarrollo (backend/.env):**
```env
DATABASE_URL="postgresql://usuario:password@ep-royal-fog-adfbwf9n-pooler.c-2.us-east-1.aws.neon.tech:5432/dbname?sslmode=require"
```

**En producción (Render):**
1. Ve a Render Dashboard → Tu servicio backend
2. Ve a **Environment Variables**
3. Verifica que `DATABASE_URL` esté configurada
4. Si falta, agrega la URL completa de Neon

#### Paso 2: Verificar Formato de URL

La URL debe tener este formato:
```
postgresql://[usuario]:[password]@[host]:[puerto]/[database]?sslmode=require
```

**Ejemplo correcto:**
```
postgresql://usuario:password123@ep-royal-fog-adfbwf9n-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

---

### Solución 3: Usar Connection Pooling

Neon ofrece dos tipos de conexiones:

#### Opción A: Connection Pooler (Recomendado)

Usa el endpoint con `-pooler` en la URL:
```
postgresql://usuario:password@ep-royal-fog-adfbwf9n-pooler.c-2.us-east-1.aws.neon.tech:5432/dbname?sslmode=require
```

#### Opción B: Direct Connection

Si el pooler falla, intenta la conexión directa:
```
postgresql://usuario:password@ep-royal-fog-adfbwf9n.c-2.us-east-1.aws.neon.tech:5432/dbname?sslmode=require
```

**Nota:** La conexión directa puede ser más lenta pero más estable.

---

### Solución 4: Aumentar Timeout en Prisma

#### Modificar schema.prisma

Agrega parámetros de conexión en `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Aumentar timeout
  directUrl = env("DIRECT_URL") // Opcional: conexión directa para migraciones
}
```

#### O usar variables de entorno con timeout

En `backend/.env`:
```env
DATABASE_URL="postgresql://usuario:password@host:5432/dbname?sslmode=require&connect_timeout=10"
```

---

### Solución 5: Verificar Estado de Neon

#### Paso 1: Verificar en Neon Dashboard

1. Ve a: **https://console.neon.tech**
2. Selecciona tu proyecto
3. Ve a **"Dashboard"** o **"Overview"**
4. Verifica el estado de la base de datos:
   - ✅ **Active** = Base de datos activa
   - ⏸️ **Paused** = Base de datos pausada (necesita reactivación)
   - ❌ **Error** = Hay un problema con la base de datos

#### Paso 2: Verificar Límites

1. En Neon Dashboard, ve a **"Settings"** o **"Billing"**
2. Verifica que no hayas alcanzado límites:
   - Límite de conexiones
   - Límite de almacenamiento
   - Límite de compute time

---

### Solución 6: Reintentar el Comando

A veces es solo un problema temporal de red:

```bash
# Esperar unos segundos y reintentar
cd backend
npx prisma migrate deploy
```

O con más tiempo de espera:

```bash
# Aumentar timeout de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npx prisma migrate deploy
```

---

## 🔍 Diagnóstico

### Verificar Conexión Manualmente

```bash
# Probar conexión con psql (si lo tienes instalado)
psql "postgresql://usuario:password@ep-royal-fog-adfbwf9n-pooler.c-2.us-east-1.aws.neon.tech:5432/dbname?sslmode=require"
```

Si esto funciona, el problema es con Prisma. Si no funciona, el problema es con Neon.

### Verificar desde Código

Crea un script de prueba (`backend/scripts/test-db-connection.ts`):

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Neon')
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    process.exit(1)
  }
}

testConnection()
```

Ejecuta:
```bash
cd backend
npx ts-node scripts/test-db-connection.ts
```

---

## 📋 Checklist de Solución

- [ ] Verifiqué que la base de datos esté activa en Neon Dashboard
- [ ] Reactivé la base de datos si estaba pausada
- [ ] Verifiqué que `DATABASE_URL` esté configurada correctamente
- [ ] Verifiqué el formato de la URL (incluye `?sslmode=require`)
- [ ] Intenté usar el connection pooler (`-pooler` en la URL)
- [ ] Reintenté el comando después de reactivar la base de datos
- [ ] Verifiqué que no haya alcanzado límites en Neon

---

## 🆘 Si Nada Funciona

### Contactar Soporte de Neon

1. Ve a: **https://console.neon.tech/support**
2. Crea un ticket explicando:
   - Error P1002
   - Tu proyecto ID
   - Qué estabas intentando hacer (migraciones)
   - Cuándo empezó el problema

### Alternativa: Usar Otra Base de Datos Temporalmente

Si necesitas continuar urgentemente:

1. Crea una nueva base de datos en Neon
2. Actualiza `DATABASE_URL` con la nueva URL
3. Ejecuta las migraciones en la nueva base de datos

---

## ✅ Resumen Rápido

**Lo más probable:**
1. La base de datos está **pausada** en Neon
2. Ve a Neon Dashboard → Resume Database
3. Espera unos segundos
4. Reintenta el comando

**Si sigue fallando:**
1. Verifica `DATABASE_URL` en Render
2. Usa el connection pooler (`-pooler` en la URL)
3. Verifica que no hayas alcanzado límites

---

**Última actualización**: Diciembre 2025  
**Error común**: Base de datos pausada en Neon (plan gratuito)

