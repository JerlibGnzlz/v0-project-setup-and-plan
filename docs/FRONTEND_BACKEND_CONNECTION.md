# Conexión Frontend-Backend

## Configuración completada

### 1. Cliente API (lib/api/client.ts)
- Cliente Axios configurado con baseURL
- Interceptores para agregar token JWT automáticamente
- Manejo de errores 401 (redirige a login)

### 2. Servicios API creados
- **auth.ts**: Login, registro, obtener perfil
- **convenciones.ts**: CRUD completo de convenciones
- **pastores.ts**: CRUD completo de pastores

### 3. Hooks personalizados con React Query
- **use-auth.ts**: Manejo de autenticación con Zustand
- **use-convencion.ts**: Queries y mutations para convenciones
- **use-pastores.ts**: Queries y mutations para pastores

## Cómo usar

### Autenticación
\`\`\`tsx
import { useAuth } from '@/lib/hooks/use-auth'

function LoginForm() {
  const { login } = useAuth()
  
  const handleSubmit = async (data) => {
    await login({ email: data.email, password: data.password })
  }
}
\`\`\`

### Convenciones
\`\`\`tsx
import { useConvenciones, useCreateConvencion } from '@/lib/hooks/use-convencion'

function ConvencionesPage() {
  const { data: convenciones, isLoading } = useConvenciones()
  const createMutation = useCreateConvencion()
  
  const handleCreate = (data) => {
    createMutation.mutate(data)
  }
}
\`\`\`

### Pastores
\`\`\`tsx
import { usePastores, useUpdatePastor } from '@/lib/hooks/use-pastores'

function PastoresPage() {
  const { data: pastores } = usePastores()
  const updateMutation = useUpdatePastor()
  
  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data })
  }
}
\`\`\`

## Variables de entorno necesarias

Agregar en `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:4000/api
\`\`\`

En producción, cambiar a la URL del backend deployado.

## Próximos pasos

1. Ejecutar los scripts SQL en Neon para crear las tablas
2. Iniciar el backend NestJS localmente (puerto 4000)
3. Actualizar las páginas del admin para usar los nuevos hooks
4. Deploy del backend a Railway/Render para producción
