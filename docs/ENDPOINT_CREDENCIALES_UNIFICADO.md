# 🔐 Endpoint Unificado de Credenciales para App Móvil

## 📋 Descripción

Endpoint unificado que trae **todas las credenciales** del usuario autenticado (pastor o invitado) con su estado calculado automáticamente (vigente, vencida, por vencer).

---

## 🎯 Endpoint

```
GET /api/credenciales/mis-credenciales
```

**Autenticación**: Requerida (Pastor o Invitado)
**Guard**: `PastorOrInvitadoJwtAuthGuard`

---

## 🔄 Funcionamiento

### Para Pastores

Si el usuario es un **Pastor**:
- ✅ Trae sus **Credenciales Pastorales** (`CredencialPastoral`)
- ✅ Calcula estado basado en `fechaVencimiento`
- ✅ Retorna solo credenciales activas

### Para Invitados

Si el usuario es un **Invitado**:
- ✅ Busca DNI en sus inscripciones
- ✅ Trae **Credenciales Ministeriales** (`CredencialMinisterial`) si existen
- ✅ Trae **Credenciales de Capellanía** (`CredencialCapellania`) si existen
- ✅ Calcula estado basado en `fechaVencimiento`
- ✅ Retorna solo credenciales activas

---

## 📤 Respuesta

### Formato de Respuesta

```typescript
{
  tieneCredenciales: boolean
  credenciales: CredencialUnificada[]
  resumen?: {
    total: number
    vigentes: number
    porVencer: number
    vencidas: number
  }
  mensaje?: string // Solo si tieneCredenciales = false
}
```

### Tipo de Credencial Unificada

```typescript
interface CredencialUnificada {
  id: string
  tipo: 'pastoral' | 'ministerial' | 'capellania'
  numero?: string // Solo para credenciales pastorales
  documento?: string // Solo para credenciales ministeriales/capellanía
  nombre: string
  apellido: string
  fechaEmision?: Date // Solo para credenciales pastorales
  fechaVencimiento: Date
  estado: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes: number
  fotoUrl?: string | null
  activa: boolean
}
```

---

## 📊 Estados de Credenciales

### Cálculo de Estado

El estado se calcula automáticamente basado en `fechaVencimiento`:

- **VIGENTE**: Más de 30 días hasta el vencimiento
- **POR_VENCER**: Entre 0 y 30 días hasta el vencimiento
- **VENCIDA**: Ya pasó la fecha de vencimiento

### Ejemplo de Cálculo

```typescript
// Si hoy es 2025-01-15 y la credencial vence el 2025-02-20
// Estado: VIGENTE (36 días restantes)

// Si hoy es 2025-01-15 y la credencial vence el 2025-02-10
// Estado: POR_VENCER (26 días restantes)

// Si hoy es 2025-01-15 y la credencial venció el 2025-01-10
// Estado: VENCIDA (5 días vencida)
```

---

## ✅ Ejemplos de Respuesta

### Caso 1: Pastor con Credenciales Pastorales

```json
{
  "tieneCredenciales": true,
  "credenciales": [
    {
      "id": "uuid-1",
      "tipo": "pastoral",
      "numero": "PA-2024-001",
      "nombre": "Juan",
      "apellido": "Pérez",
      "fechaEmision": "2024-01-15T00:00:00.000Z",
      "fechaVencimiento": "2025-01-15T00:00:00.000Z",
      "estado": "vigente",
      "diasRestantes": 365,
      "activa": true
    }
  ],
  "resumen": {
    "total": 1,
    "vigentes": 1,
    "porVencer": 0,
    "vencidas": 0
  }
}
```

### Caso 2: Invitado con Credenciales Ministeriales y Capellanía

```json
{
  "tieneCredenciales": true,
  "credenciales": [
    {
      "id": "uuid-2",
      "tipo": "ministerial",
      "documento": "12345678",
      "nombre": "María",
      "apellido": "González",
      "fechaVencimiento": "2025-06-15T00:00:00.000Z",
      "estado": "vigente",
      "diasRestantes": 150,
      "fotoUrl": "https://cloudinary.com/...",
      "activa": true
    },
    {
      "id": "uuid-3",
      "tipo": "capellania",
      "documento": "12345678",
      "nombre": "María",
      "apellido": "González",
      "fechaVencimiento": "2025-03-20T00:00:00.000Z",
      "estado": "por_vencer",
      "diasRestantes": 25,
      "fotoUrl": "https://cloudinary.com/...",
      "activa": true
    }
  ],
  "resumen": {
    "total": 2,
    "vigentes": 1,
    "porVencer": 1,
    "vencidas": 0
  }
}
```

### Caso 3: Usuario sin Credenciales

```json
{
  "tieneCredenciales": false,
  "credenciales": [],
  "mensaje": "No tienes credenciales pastorales registradas"
}
```

---

## 🔧 Uso en la App Móvil

### Cliente API

```typescript
// amva-mobile/src/api/credenciales.ts
import { apiClient } from './client'

export interface CredencialUnificada {
  id: string
  tipo: 'pastoral' | 'ministerial' | 'capellania'
  numero?: string
  documento?: string
  nombre: string
  apellido: string
  fechaEmision?: string
  fechaVencimiento: string
  estado: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes: number
  fotoUrl?: string | null
  activa: boolean
}

export interface CredencialesResponse {
  tieneCredenciales: boolean
  credenciales: CredencialUnificada[]
  resumen?: {
    total: number
    vigentes: number
    porVencer: number
    vencidas: number
  }
  mensaje?: string
}

export const credencialesApi = {
  getMisCredenciales: async (): Promise<CredencialesResponse> => {
    const response = await apiClient.get<CredencialesResponse>('/api/credenciales/mis-credenciales')
    return response.data
  },
}
```

### Hook React Query

```typescript
// amva-mobile/src/hooks/use-credenciales.ts
import { useQuery } from '@tanstack/react-query'
import { credencialesApi, CredencialesResponse } from '../api/credenciales'

export function useMisCredenciales() {
  return useQuery<CredencialesResponse>({
    queryKey: ['credenciales', 'mis-credenciales'],
    queryFn: () => credencialesApi.getMisCredenciales(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
```

### Componente de Ejemplo

```typescript
// amva-mobile/src/screens/CredencialesScreen.tsx
import { useMisCredenciales } from '../hooks/use-credenciales'

export function CredencialesScreen() {
  const { data, isLoading, error } = useMisCredenciales()

  if (isLoading) return <Loading />
  if (error) return <Error message="Error al cargar credenciales" />

  if (!data?.tieneCredenciales) {
    return <EmptyState message={data?.mensaje || 'No tienes credenciales'} />
  }

  return (
    <View>
      {/* Resumen */}
      {data.resumen && (
        <ResumenCard
          total={data.resumen.total}
          vigentes={data.resumen.vigentes}
          porVencer={data.resumen.porVencer}
          vencidas={data.resumen.vencidas}
        />
      )}

      {/* Lista de credenciales */}
      {data.credenciales.map((credencial) => (
        <CredencialCard
          key={credencial.id}
          tipo={credencial.tipo}
          numero={credencial.numero || credencial.documento}
          nombre={`${credencial.nombre} ${credencial.apellido}`}
          fechaVencimiento={credencial.fechaVencimiento}
          estado={credencial.estado}
          diasRestantes={credencial.diasRestantes}
          fotoUrl={credencial.fotoUrl}
        />
      ))}
    </View>
  )
}
```

---

## 🎨 Manejo de Estados en la UI

### Badges de Estado

```typescript
// Colores según estado
const estadoColors = {
  vigente: '#22c55e', // Verde
  por_vencer: '#f59e0b', // Amarillo/Naranja
  vencida: '#ef4444', // Rojo
}

// Iconos según estado
const estadoIcons = {
  vigente: 'check-circle',
  por_vencer: 'alert-circle',
  vencida: 'x-circle',
}
```

### Mensajes de Estado

```typescript
const getEstadoMensaje = (estado: string, diasRestantes: number): string => {
  switch (estado) {
    case 'vigente':
      return `Vigente - ${diasRestantes} días restantes`
    case 'por_vencer':
      return `Por vencer - ${diasRestantes} días restantes`
    case 'vencida':
      return `Vencida hace ${diasRestantes} días`
    default:
      return 'Estado desconocido'
  }
}
```

---

## ⚠️ Casos Especiales

### Pastor sin Credenciales

```json
{
  "tieneCredenciales": false,
  "credenciales": [],
  "mensaje": "No tienes credenciales pastorales registradas"
}
```

### Invitado sin DNI en Inscripciones

```json
{
  "tieneCredenciales": false,
  "credenciales": [],
  "mensaje": "No se encontró DNI en tus inscripciones. Asegúrate de haber ingresado tu DNI al inscribirte a una convención."
}
```

### Invitado con DNI pero sin Credenciales

```json
{
  "tieneCredenciales": false,
  "credenciales": [],
  "mensaje": "No se encontraron credenciales para tu DNI. Verifica que tus credenciales estén registradas en el sistema."
}
```

---

## 🔒 Seguridad

- ✅ Requiere autenticación (token JWT)
- ✅ Solo retorna credenciales del usuario autenticado
- ✅ No expone información de otros usuarios
- ✅ Valida que el usuario tenga acceso a las credenciales

---

## 📝 Notas Importantes

1. **Ordenamiento**: Las credenciales se ordenan por fecha de vencimiento (más recientes primero)

2. **Filtrado**: Solo se retornan credenciales activas (`activa: true`)

3. **Cálculo de Estado**: Se calcula automáticamente en el backend, no requiere cálculo en el frontend

4. **DNI Normalización**: Para invitados, el DNI se normaliza (sin espacios, guiones, mayúsculas) antes de buscar

5. **Múltiples Credenciales**: Un invitado puede tener múltiples credenciales (ministerial y capellanía) con el mismo DNI

---

## ✅ Ventajas de este Enfoque

- ✅ **Un solo endpoint** para todos los tipos de usuarios
- ✅ **Estado calculado automáticamente** (vigente, vencida, por vencer)
- ✅ **Formato unificado** fácil de usar en la app móvil
- ✅ **Resumen incluido** para mostrar estadísticas rápidas
- ✅ **Mensajes claros** cuando no hay credenciales

---

**¿Necesitas ayuda implementando esto en la app móvil?** Puedo ayudarte a crear los componentes y hooks necesarios.

