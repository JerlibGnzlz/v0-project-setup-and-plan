# 📱 Ejemplo de Uso de Credenciales en App Móvil

## 🎯 Hook Creado

```typescript
import { useMisCredenciales } from '../hooks/use-credenciales'
```

---

## 📋 Uso Básico

### Componente Simple

```typescript
import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useMisCredenciales } from '../hooks/use-credenciales'

export function CredencialesScreen() {
  const { data, isLoading, error } = useMisCredenciales()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Cargando credenciales...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  if (!data?.tieneCredenciales) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{data?.mensaje || 'No tienes credenciales'}</Text>
      </View>
    )
  }

  return (
    <View>
      {/* Resumen */}
      {data.resumen && (
        <View>
          <Text>Total: {data.resumen.total}</Text>
          <Text>Vigentes: {data.resumen.vigentes}</Text>
          <Text>Por Vencer: {data.resumen.porVencer}</Text>
          <Text>Vencidas: {data.resumen.vencidas}</Text>
        </View>
      )}

      {/* Lista de credenciales */}
      {data.credenciales.map((credencial) => (
        <View key={credencial.id}>
          <Text>{credencial.nombre} {credencial.apellido}</Text>
          <Text>Tipo: {credencial.tipo}</Text>
          <Text>Estado: {credencial.estado}</Text>
          <Text>Días restantes: {credencial.diasRestantes}</Text>
        </View>
      ))}
    </View>
  )
}
```

---

## 🎨 Helpers Disponibles

### Colores por Estado

```typescript
import { getEstadoColor } from '../hooks/use-credenciales'

const color = getEstadoColor('vigente') // '#22c55e' (verde)
const color = getEstadoColor('por_vencer') // '#f59e0b' (amarillo)
const color = getEstadoColor('vencida') // '#ef4444' (rojo)
```

### Mensajes por Estado

```typescript
import { getEstadoMensaje } from '../hooks/use-credenciales'

const mensaje = getEstadoMensaje('vigente', 150)
// "Vigente - 150 días restantes"

const mensaje = getEstadoMensaje('por_vencer', 15)
// "Por vencer - 15 días restantes"

const mensaje = getEstadoMensaje('vencida', 5)
// "Vencida hace 5 días"
```

### Tipo Legible

```typescript
import { getCredencialTipoLegible } from '../hooks/use-credenciales'

const tipo = getCredencialTipoLegible('pastoral')
// "Credencial Pastoral"

const tipo = getCredencialTipoLegible('ministerial')
// "Credencial Ministerial"

const tipo = getCredencialTipoLegible('capellania')
// "Credencial de Capellanía"
```

### Identificador

```typescript
import { getCredencialIdentificador } from '../hooks/use-credenciales'

const id = getCredencialIdentificador(credencial)
// Para pastoral: retorna credencial.numero
// Para ministerial/capellanía: retorna credencial.documento
```

---

## 📊 Estructura de Datos

### Respuesta del Hook

```typescript
{
  data: {
    tieneCredenciales: boolean
    credenciales: [
      {
        id: string
        tipo: 'pastoral' | 'ministerial' | 'capellania'
        numero?: string // Solo pastoral
        documento?: string // Solo ministerial/capellanía
        nombre: string
        apellido: string
        fechaEmision?: string // Solo pastoral
        fechaVencimiento: string
        estado: 'vigente' | 'por_vencer' | 'vencida'
        diasRestantes: number
        fotoUrl?: string | null
        activa: boolean
      }
    ]
    resumen?: {
      total: number
      vigentes: number
      porVencer: number
      vencidas: number
    }
    mensaje?: string // Solo si tieneCredenciales = false
  }
  isLoading: boolean
  error: Error | null
}
```

---

## ✅ Ejemplo Completo

He creado un componente de ejemplo completo en:
`amva-mobile/src/components/CredencialesList.tsx`

Este componente muestra:
- ✅ Loading state
- ✅ Error state
- ✅ Empty state
- ✅ Resumen de credenciales
- ✅ Lista de credenciales con estados visuales
- ✅ Badges de estado con colores
- ✅ Información completa de cada credencial

---

## 🚀 Listo para Usar

Todo está implementado y listo para usar en tu app móvil:

1. ✅ Endpoint unificado creado (`/api/credenciales/mis-credenciales`)
2. ✅ Cliente API creado (`credencialesApi.obtenerMisCredencialesUnificado()`)
3. ✅ Hook React Query creado (`useMisCredenciales()`)
4. ✅ Helpers creados (colores, mensajes, tipos)
5. ✅ Componente de ejemplo creado (`CredencialesList.tsx`)

**Solo necesitas importar y usar el hook en tu pantalla de credenciales.**

