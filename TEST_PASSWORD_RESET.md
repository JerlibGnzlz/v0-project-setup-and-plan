# Guía para Probar Recuperación de Contraseña

## Pasos para verificar que funciona:

### 1. Verificar que el backend esté corriendo
\`\`\`bash
cd backend
npm run start:dev
\`\`\`

El backend debe estar en `http://localhost:4000/api`

### 2. Verificar que la tabla existe
\`\`\`bash
cd backend
npx prisma studio
\`\`\`

Abre Prisma Studio y verifica que existe la tabla `password_reset_tokens`

### 3. Probar el endpoint manualmente
\`\`\`bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ministerio-amva.org"}'
\`\`\`

### 4. Verificar en el frontend
1. Ve a `http://localhost:3000/admin/forgot-password`
2. Ingresa un email que exista en la base de datos
3. Revisa la consola del backend - deberías ver el link de recuperación
4. En desarrollo, el link también aparecerá en un toast en el frontend

### 5. Probar el reset
1. Copia el token del link generado
2. Ve a `http://localhost:3000/admin/reset-password?token=TU_TOKEN_AQUI`
3. Ingresa la nueva contraseña

## Posibles problemas:

1. **Backend no está corriendo**: Asegúrate de que `npm run start:dev` esté ejecutándose
2. **Tabla no existe**: Ejecuta `npx prisma migrate deploy` o `npx prisma db push`
3. **Email no existe**: Usa un email que esté registrado en la tabla `users`
4. **CORS**: Verifica que `FRONTEND_URL` esté configurado en el `.env` del backend

## Logs a revisar:

- **Backend console**: Deberías ver `🔐 Password Reset Link for...`
- **Frontend console**: Deberías ver el `resetUrl` en el toast
- **Network tab**: Verifica que la petición a `/auth/forgot-password` sea exitosa (200)
