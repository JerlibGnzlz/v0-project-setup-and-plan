# Estrategia Simple para Actualizaciones en Producción

## 🎯 Solución Más Sencilla (Recomendada para Empezar)

### Concepto: **Dos Entornos + Deploy Manual Controlado**

```
┌─────────────────┐     ┌─────────────────┐
│   DESARROLLO    │ --> │   PRODUCCIÓN    │
│  (Local/Dev)    │     │   (Vercel Live) │
└─────────────────┘     └─────────────────┘
```

## ✅ Lo Mínimo Necesario

### 1. **Dos Ramas en Git**

```bash
main      → Producción (siempre estable)
develop   → Desarrollo (cambios nuevos)
```

### 2. **Proceso Simple**

```bash
# PASO 1: Desarrollar en rama develop
git checkout develop
# ... hacer cambios ...
git commit -m "feat: Nueva funcionalidad"
git push origin develop

# PASO 2: Probar localmente
npm run dev
# Verificar que todo funciona

# PASO 3: Cuando esté listo, merge a main
git checkout main
git merge develop
git push origin main
# → Vercel despliega automáticamente
```

## 🛡️ Protecciones Simples

### 1. **Backup Antes de Deploy**

```bash
# Script simple de backup
#!/bin/bash
# backup.sh

echo "📦 Creando backup de base de datos..."
# Exportar datos importantes
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

echo "✅ Backup creado"
```

### 2. **Verificar Antes de Deploy**

```bash
# Script de verificación
#!/bin/bash
# verify.sh

echo "🔍 Verificando antes de deploy..."

# 1. Tests pasan
npm run test || exit 1

# 2. Build funciona
npm run build || exit 1

# 3. Linting OK
npm run lint || exit 1

echo "✅ Todo listo para deploy"
```

### 3. **Deploy Manual con Confirmación**

```bash
# deploy.sh
#!/bin/bash

echo "⚠️  ¿Estás seguro de desplegar a producción? (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Deploy cancelado"
  exit 1
fi

echo "🚀 Desplegando a producción..."
git checkout main
git merge develop
git push origin main

echo "✅ Deploy iniciado. Revisa Vercel dashboard"
```

## 📋 Checklist Simple (5 Minutos)

Antes de cada deploy a producción:

- [ ] ✅ Probar localmente (`npm run dev`)
- [ ] ✅ Verificar que no hay errores en consola
- [ ] ✅ Probar funcionalidades críticas manualmente
- [ ] ✅ Backup de base de datos (si hay cambios de BD)
- [ ] ✅ Merge a `main` y push
- [ ] ✅ Monitorear Vercel dashboard por 5 minutos
- [ ] ✅ Verificar que el sitio carga correctamente

## 🔄 Rollback Simple (30 Segundos)

Si algo sale mal:

### Opción 1: Rollback en Vercel (Más Fácil)

1. Ir a Vercel Dashboard
2. Seleccionar proyecto
3. Ir a "Deployments"
4. Encontrar versión anterior que funcionaba
5. Click en "..." → "Promote to Production"

### Opción 2: Rollback con Git

```bash
# Revertir último commit en main
git checkout main
git revert HEAD
git push origin main
# → Vercel despliega automáticamente la versión anterior
```

## 🎛️ Feature Flags Simples (Sin Librerías)

Para activar/desactivar funcionalidades sin deploy:

```typescript
// lib/config.ts
export const FEATURES = {
  NUEVA_INTERFAZ_PAGOS: process.env.NEXT_PUBLIC_FEATURE_NUEVA_PAGOS === 'true',
  NUEVA_GALERIA: process.env.NEXT_PUBLIC_FEATURE_NUEVA_GALERIA === 'true',
} as const

// Uso en código
import { FEATURES } from '@/lib/config'

if (FEATURES.NUEVA_INTERFAZ_PAGOS) {
  return <NuevaInterfazPagos />
}
return <InterfazActual />
```

**Activar/Desactivar**:
- Ir a Vercel → Settings → Environment Variables
- Agregar: `NEXT_PUBLIC_FEATURE_NUEVA_PAGOS=true`
- Redeploy automático

## 📊 Monitoreo Simple

### 1. **Vercel Analytics** (Ya incluido)

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. **Health Check Simple**

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
```

Verificar: `https://tu-dominio.com/api/health`

## 🚨 Alertas Simples

### Email cuando hay errores (Vercel)

1. Ir a Vercel → Settings → Notifications
2. Activar "Email notifications for deployments"
3. Recibirás email si el deploy falla

## 📝 Flujo de Trabajo Diario

### Desarrollo Normal

```bash
# 1. Trabajar en develop
git checkout develop
# ... código ...

# 2. Commit y push
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin develop

# 3. Probar localmente
npm run dev
# Verificar que funciona

# 4. Cuando esté listo → Deploy
git checkout main
git merge develop
git push origin main
```

### Hotfix Urgente

```bash
# 1. Crear hotfix desde main
git checkout main
git checkout -b hotfix/correccion-urgente

# 2. Hacer corrección
# ... código ...

# 3. Commit y merge directo a main
git add .
git commit -m "fix: Corrección urgente"
git checkout main
git merge hotfix/correccion-urgente
git push origin main

# 4. También merge a develop para mantener sincronizado
git checkout develop
git merge hotfix/correccion-urgente
git push origin develop
```

## ✅ Ventajas de Esta Estrategia Simple

1. ✅ **Fácil de entender**: Solo dos ramas
2. ✅ **Control total**: Tú decides cuándo deployar
3. ✅ **Sin complejidad**: No necesitas configurar CI/CD complejo
4. ✅ **Rollback rápido**: Un clic en Vercel
5. ✅ **Bajo costo**: Usa servicios gratuitos de Vercel

## 🎯 Cuándo Necesitar Más Complejidad

Esta estrategia simple es suficiente si:
- ✅ Tienes menos de 10 deploys por semana
- ✅ Puedes probar manualmente antes de deployar
- ✅ No necesitas múltiples entornos de staging
- ✅ El equipo es pequeño (1-3 desarrolladores)

**Considera estrategias más complejas si**:
- ❌ Necesitas deploys múltiples veces al día
- ❌ Tienes un equipo grande
- ❌ Necesitas pruebas automatizadas extensas
- ❌ Requieres múltiples entornos de staging

## 📚 Scripts Útiles

### `scripts/deploy.sh`

```bash
#!/bin/bash

echo "🔍 Verificando antes de deploy..."
npm run build || exit 1

echo "⚠️  ¿Desplegar a producción? (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Cancelado"
  exit 1
fi

echo "🚀 Desplegando..."
git checkout main
git merge develop
git push origin main

echo "✅ Deploy iniciado. Revisa: https://vercel.com/dashboard"
```

### `scripts/rollback.sh`

```bash
#!/bin/bash

echo "⚠️  ¿Hacer rollback? Esto revertirá el último commit. (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Cancelado"
  exit 1
fi

git checkout main
git revert HEAD --no-edit
git push origin main

echo "✅ Rollback iniciado"
```

## 🎓 Resumen en 3 Pasos

1. **Desarrollar** → Trabajar en rama `develop`
2. **Probar** → Verificar localmente que funciona
3. **Deployar** → Merge a `main` → Vercel despliega automáticamente

**Si algo sale mal**:
- Rollback en Vercel dashboard (30 segundos)

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0 - Estrategia Simple

