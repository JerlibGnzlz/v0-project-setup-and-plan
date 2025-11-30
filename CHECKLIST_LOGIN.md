# ✅ CHECKLIST PARA VERIFICAR EL LOGIN

## Antes de probar el login

- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 3000
- [ ] Archivo `.env.local` existe en la raíz del proyecto
- [ ] Variable `NEXT_PUBLIC_API_URL=http://localhost:4000/api` (sin espacios)
- [ ] Usuario admin existe en la base de datos

## Verificar backend

```bash
cd backend
pnpm start:dev
```

**Deberías ver:**
- ✅ Database connected successfully
- 🚀 Backend running on http://localhost:4000/api

## Verificar frontend

```bash
pnpm dev
```

**Deberías ver:**
- ✅ Ready in XXXms
- Local: http://localhost:3000

## Probar login

1. Abre: http://localhost:3000/admin/login
2. Abre consola del navegador (F12)
3. Ingresa:
   - Email: `admin@ministerio-amva.org`
   - Password: `admin123`
4. Revisa consolas (navegador y backend)
5. Deberías ser redirigido a `/admin`

## Si no funciona

### Verificar archivo .env.local
```bash
cat .env.local
# Debe mostrar: NEXT_PUBLIC_API_URL=http://localhost:4000/api
# SIN espacios al inicio
```

### Verificar usuario admin
```bash
cd backend
pnpm ts-node scripts/create-admin-user.ts
```

### Verificar que backend responde
```bash
curl http://localhost:4000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ministerio-amva.org","password":"admin123"}'
```

### Limpiar cache del navegador
- Presiona Ctrl+Shift+R (hard refresh)
- O limpia localStorage: `localStorage.clear()` en consola

