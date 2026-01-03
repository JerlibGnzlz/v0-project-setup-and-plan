# Estrategia Profesional de Despliegue en Producción

## 📋 Contexto

Cuando la aplicación AMVA Digital esté en producción, necesitas:
- ✅ Hacer actualizaciones sin afectar usuarios activos
- ✅ Probar cambios antes de publicarlos
- ✅ Tener capacidad de rollback rápido
- ✅ Monitorear el estado del sistema
- ✅ Mantener múltiples entornos (desarrollo, staging, producción)

## 🏗️ Arquitectura de Entornos Recomendada

### 1. Tres Entornos Principales

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DESARROLLO    │ --> │    STAGING      │ --> │   PRODUCCIÓN    │
│   (Development) │     │   (Pre-Prod)    │     │   (Production)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### **DESARROLLO (Development)**
- **Propósito**: Desarrollo activo y pruebas locales
- **Base de Datos**: Local o compartida de desarrollo
- **URL**: `dev.amva-digital.com` o `localhost:3000`
- **Características**:
  - Código de la rama `develop` o `dev`
  - Hot reload activo
  - Logs detallados
  - Sin optimizaciones de producción

#### **STAGING (Pre-Producción)**
- **Propósito**: Pruebas finales antes de producción
- **Base de Datos**: Copia de producción (datos anonimizados)
- **URL**: `staging.amva-digital.com`
- **Características**:
  - Código idéntico a producción
  - Mismas configuraciones que producción
  - Pruebas de carga y rendimiento
  - Acceso restringido (solo equipo técnico)

#### **PRODUCCIÓN (Production)**
- **Propósito**: Aplicación activa para usuarios finales
- **Base de Datos**: Base de datos real
- **URL**: `www.amva-digital.com` o dominio principal
- **Características**:
  - Código estable y probado
  - Optimizaciones activas
  - Monitoreo 24/7
  - Backups automáticos

## 🚀 Estrategias de Despliegue Profesionales

### 1. Blue-Green Deployment (Recomendado)

**Concepto**: Mantener dos instancias idénticas (Blue y Green). Solo una está activa.

```
ANTES DEL DESPLIEGUE:
┌─────────────┐
│   BLUE      │ ← Activo (Producción)
│  (v1.0.0)   │
└─────────────┘
┌─────────────┐
│   GREEN     │ ← Inactivo
│  (v1.0.0)   │
└─────────────┘

DURANTE EL DESPLIEGUE:
┌─────────────┐
│   BLUE      │ ← Activo (Producción)
│  (v1.0.0)   │
└─────────────┘
┌─────────────┐
│   GREEN     │ ← Desplegando nueva versión (v1.1.0)
│  (v1.1.0)   │
└─────────────┘

DESPUÉS DEL DESPLIEGUE:
┌─────────────┐
│   BLUE      │ ← Inactivo (rollback disponible)
│  (v1.0.0)   │
└─────────────┘
┌─────────────┐
│   GREEN     │ ← Activo (Nueva versión)
│  (v1.1.0)   │
└─────────────┘
```

**Ventajas**:
- ✅ Rollback instantáneo (cambiar tráfico de vuelta)
- ✅ Cero downtime
- ✅ Pruebas en producción antes de activar
- ✅ Sin impacto en usuarios

**Implementación con Vercel/Netlify**:
```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production (Blue-Green)

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy-green:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Green
        run: |
          # Desplegar a instancia Green (preview)
          vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Health Check Green
        run: |
          # Verificar que Green funciona correctamente
          curl -f https://green.amva-digital.com/health || exit 1
      
      - name: Switch Traffic to Green
        run: |
          # Cambiar DNS/load balancer a Green
          # Solo si health check pasa
```

### 2. Canary Deployment

**Concepto**: Desplegar nueva versión a un pequeño porcentaje de usuarios primero.

```
100% Usuarios → v1.0.0 (Producción)
                    ↓
        5% Usuarios → v1.1.0 (Canary)
        95% Usuarios → v1.0.0 (Producción)
                    ↓
        Si todo OK, aumentar gradualmente:
        25% → v1.1.0
        50% → v1.1.0
        100% → v1.1.0
```

**Ventajas**:
- ✅ Detección temprana de problemas
- ✅ Impacto limitado si hay errores
- ✅ Pruebas con usuarios reales

**Implementación**:
```typescript
// middleware.ts (Next.js)
export function middleware(request: NextRequest) {
  const canaryPercentage = 10 // 10% de usuarios
  
  // Determinar si usuario va a versión canary
  const isCanary = Math.random() * 100 < canaryPercentage
  
  if (isCanary && request.headers.get('x-canary-enabled') === 'true') {
    // Redirigir a versión canary
    return NextResponse.rewrite(new URL('/canary', request.url))
  }
  
  return NextResponse.next()
}
```

### 3. Rolling Deployment

**Concepto**: Actualizar instancias una por una, gradualmente.

```
Instancia 1: v1.0.0 → v1.1.0 ✅
Instancia 2: v1.0.0 → v1.1.0 ✅
Instancia 3: v1.0.0 → v1.1.0 ✅
```

**Ventajas**:
- ✅ Sin downtime
- ✅ Distribución gradual del riesgo

## 🔧 Implementación Práctica para AMVA Digital

### Opción 1: Vercel (Recomendado para Next.js)

Vercel tiene soporte nativo para:
- ✅ Preview Deployments (automático en cada PR)
- ✅ Production Deployments (solo en `main`)
- ✅ Rollback con un clic
- ✅ Edge Functions para feature flags

#### Configuración en Vercel

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  },
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
```

#### Flujo de Trabajo

```bash
# 1. Desarrollo en rama feature
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git push origin feature/nueva-funcionalidad

# 2. Vercel crea automáticamente preview deployment
# URL: https://feature-nueva-funcionalidad.vercel.app

# 3. Probar en preview
# 4. Merge a develop → Staging deployment
# 5. Merge a main → Production deployment
```

### Opción 2: Docker + Kubernetes (Para más control)

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amva-digital-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: amva-digital
      version: blue
  template:
    metadata:
      labels:
        app: amva-digital
        version: blue
    spec:
      containers:
      - name: app
        image: amva-digital:v1.0.0
        ports:
        - containerPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amva-digital-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: amva-digital
      version: green
  template:
    metadata:
      labels:
        app: amva-digital
        version: green
    spec:
      containers:
      - name: app
        image: amva-digital:v1.1.0
        ports:
        - containerPort: 3000
```

## 🎛️ Feature Flags (Recomendado)

Permite activar/desactivar funcionalidades sin redeployar.

### Implementación con Unleash o Flagsmith

```typescript
// lib/feature-flags.ts
import { Flagsmith } from 'flagsmith'

const flagsmith = new Flagsmith({
  environmentID: process.env.FLAGSMITH_ENV_ID || 'development',
  apiKey: process.env.FLAGSMITH_API_KEY,
})

export async function isFeatureEnabled(featureName: string): Promise<boolean> {
  const flags = await flagsmith.getFlags()
  return flags.isFeatureEnabled(featureName)
}

// Uso en código
const showNewFeature = await isFeatureEnabled('nueva-funcionalidad')

if (showNewFeature) {
  // Renderizar nueva funcionalidad
} else {
  // Renderizar versión anterior
}
```

### Ejemplo Práctico

```typescript
// app/admin/pagos/page.tsx
import { isFeatureEnabled } from '@/lib/feature-flags'

export default async function PagosPage() {
  const nuevaInterfaz = await isFeatureEnabled('nueva-interfaz-pagos')
  
  if (nuevaInterfaz) {
    return <NuevaInterfazPagos />
  }
  
  return <InterfazPagosActual />
}
```

**Ventajas**:
- ✅ Activar/desactivar sin deploy
- ✅ Pruebas A/B
- ✅ Rollback instantáneo de funcionalidades
- ✅ Control granular por usuario/rol

## 📊 CI/CD Pipeline Recomendado

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Health Check
        run: |
          sleep 30
          curl -f https://www.amva-digital.com/api/health || exit 1
      
      - name: Notify Team
        if: success()
        run: |
          # Enviar notificación a Slack/Discord
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"✅ Despliegue a producción exitoso"}'
```

## 🔄 Estrategia de Branching (Git Flow)

```
main (producción)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/nueva-funcionalidad
  │     ├── feature/mejora-pagos
  │     └── bugfix/correccion-critica
  │
  └── hotfix/correccion-urgente (desde main)
```

### Flujo de Trabajo

```bash
# 1. Nueva funcionalidad
git checkout develop
git checkout -b feature/nueva-funcionalidad
# ... desarrollo ...
git commit -m "feat: Nueva funcionalidad"
git push origin feature/nueva-funcionalidad
# Crear PR → develop

# 2. Merge a develop → Auto-deploy a staging
# Probar en staging.amva-digital.com

# 3. Merge develop → main → Auto-deploy a producción
git checkout main
git merge develop
git push origin main
# Auto-deploy a producción

# 4. Hotfix urgente (desde main)
git checkout main
git checkout -b hotfix/correccion-critica
# ... corrección ...
git commit -m "fix: Corrección crítica"
git push origin hotfix/correccion-critica
# Crear PR → main
# Merge → Auto-deploy a producción
# Luego merge a develop
```

## 🛡️ Protecciones y Seguridad

### 1. Environment Variables Separadas

```bash
# .env.development
DATABASE_URL=postgresql://dev:dev@localhost:5432/amva_dev
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development

# .env.staging
DATABASE_URL=postgresql://staging:staging@staging-db:5432/amva_staging
NEXT_PUBLIC_API_URL=https://api-staging.amva-digital.com
NODE_ENV=production

# .env.production
DATABASE_URL=postgresql://prod:prod@prod-db:5432/amva_prod
NEXT_PUBLIC_API_URL=https://api.amva-digital.com
NODE_ENV=production
```

### 2. Database Migrations Seguras

```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  // 1. Backup antes de migrar
  await backupDatabase()
  
  // 2. Migrar en transacción
  await prisma.$transaction(async (tx) => {
    // Migraciones aquí
  })
  
  // 3. Verificar integridad
  await verifyDataIntegrity()
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### 3. Health Checks y Monitoreo

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verificar base de datos
    await prisma.$queryRaw`SELECT 1`
    
    // Verificar servicios externos
    const cloudinaryHealth = await checkCloudinary()
    const emailHealth = await checkEmailService()
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        cloudinary: cloudinaryHealth ? 'ok' : 'degraded',
        email: emailHealth ? 'ok' : 'degraded',
      },
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    )
  }
}
```

## 🔙 Estrategia de Rollback

### Rollback Automático

```yaml
# .github/workflows/rollback.yml
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Versión a la que hacer rollback'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to version
        run: |
          # Vercel: Rollback a versión anterior
          vercel rollback ${{ github.event.inputs.version }}
          
          # O Kubernetes: Cambiar imagen
          kubectl set image deployment/amva-digital \
            app=amva-digital:${{ github.event.inputs.version }}
```

### Rollback Manual (Vercel)

1. Ir a Dashboard de Vercel
2. Seleccionar proyecto
3. Ir a "Deployments"
4. Encontrar versión estable anterior
5. Click en "..." → "Promote to Production"

## 📈 Monitoreo y Alertas

### 1. Uptime Monitoring

```typescript
// Usar servicios como:
// - UptimeRobot (gratis)
// - Pingdom
// - StatusCake
// - Vercel Analytics (incluido)
```

### 2. Error Tracking

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filtrar errores en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### 3. Performance Monitoring

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## ✅ Checklist de Despliegue

### Antes de Desplegar a Producción

- [ ] ✅ Todos los tests pasan
- [ ] ✅ Code review aprobado
- [ ] ✅ Pruebas en staging exitosas
- [ ] ✅ Migraciones de BD probadas
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Backup de base de datos realizado
- [ ] ✅ Documentación actualizada
- [ ] ✅ Plan de rollback preparado
- [ ] ✅ Equipo notificado

### Durante el Despliegue

- [ ] ✅ Monitorear logs en tiempo real
- [ ] ✅ Verificar health checks
- [ ] ✅ Probar funcionalidades críticas
- [ ] ✅ Monitorear métricas (CPU, memoria, errores)

### Después del Despliegue

- [ ] ✅ Verificar que todo funciona correctamente
- [ ] ✅ Monitorear por 30 minutos
- [ ] ✅ Revisar logs de errores
- [ ] ✅ Confirmar con equipo que todo está bien
- [ ] ✅ Documentar versión desplegada

## 🎯 Recomendación Final para AMVA Digital

### Stack Recomendado

1. **Hosting**: Vercel (Next.js) + Railway/Render (Backend NestJS)
2. **Base de Datos**: Neon PostgreSQL (con backups automáticos)
3. **CI/CD**: GitHub Actions
4. **Feature Flags**: Flagsmith (gratis hasta 10k flags)
5. **Monitoreo**: Vercel Analytics + Sentry
6. **CDN**: Cloudinary (ya implementado)

### Flujo de Trabajo Recomendado

```
1. Desarrollo → feature/nueva-funcionalidad
2. PR → develop → Auto-deploy a staging
3. Pruebas en staging
4. PR → main → Auto-deploy a producción
5. Monitoreo y verificación
6. Si hay problemas → Rollback inmediato
```

## 📚 Recursos Adicionales

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Feature Flags Best Practices](https://www.flagsmith.com/feature-flags-best-practices)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0

