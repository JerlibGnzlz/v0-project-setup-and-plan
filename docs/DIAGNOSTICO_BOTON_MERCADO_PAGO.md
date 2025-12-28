# 🔍 DIAGNÓSTICO: ¿Por qué no veo el botón de Mercado Pago?

## 📍 Dónde debería estar el botón

El botón aparece en: **`http://localhost:3000/convencion/inscripcion`**

Específicamente:
- En la tarjeta **"Inscripción Existente"**
- En la sección **"Estado de Pagos"**
- Junto a cada cuota **PENDIENTE** (no pagada)
- Solo si Mercado Pago está configurado

---

## ❓ Posibles razones por las que no lo ves

### 1. ❌ Mercado Pago NO está configurado

**Verificar:**
```bash
curl http://localhost:4000/api/mercado-pago/status
```

**Debe retornar:**
```json
{
  "configured": true,
  "testMode": true
}
```

**Si retorna `"configured": false`:**
- Verifica que tengas `MERCADO_PAGO_ACCESS_TOKEN` en tu `.env` del backend
- Reinicia el servidor backend después de agregar la variable

---

### 2. ❌ No tienes una inscripción existente

**Pasos:**
1. Ve a: `http://localhost:3000/convencion/inscripcion`
2. Completa el formulario de inscripción
3. Haz clic en "Inscribirse"
4. Después de crear la inscripción, deberías ver la tarjeta "Inscripción Existente"

**Si no ves la tarjeta:**
- Verifica que la inscripción se haya creado correctamente
- Abre la consola del navegador (F12) y busca errores
- Verifica que el backend esté corriendo

---

### 3. ❌ Todas las cuotas están pagadas

**El botón solo aparece en cuotas PENDIENTES**

**Verificar:**
- En la sección "Estado de Pagos", verifica el estado de cada cuota
- Si todas dicen "Pagada" o "Completado", no verás el botón
- El botón solo aparece en cuotas que dicen "Pendiente"

---

### 4. ❌ No hay pagos creados

**Al crear la inscripción, deben crearse 3 pagos automáticamente**

**Verificar:**
1. Ve al panel admin: `http://localhost:3000/admin/pagos`
2. Busca pagos con el email que usaste para la inscripción
3. Deberías ver 3 pagos con estado "PENDIENTE"

**Si no hay pagos:**
- Verifica los logs del backend
- Verifica que la convención tenga un costo configurado
- Verifica que el proceso de creación de inscripción se completó

---

### 5. ❌ Estás en la página incorrecta

**El botón NO aparece en:**
- `/admin/pagos` (panel admin)
- `/admin` (dashboard)
- Cualquier otra página

**El botón SÍ aparece en:**
- `/convencion/inscripcion` (web pública)
- Solo cuando ya tienes una inscripción existente

---

## 🔧 Pasos para diagnosticar

### Paso 1: Verificar configuración de Mercado Pago

```bash
# En una terminal
curl http://localhost:4000/api/mercado-pago/status
```

**Si retorna `"configured": false`:**
1. Abre el archivo `.env` del backend
2. Agrega:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
   MERCADO_PAGO_TEST_MODE=true
   ```
3. Reinicia el servidor backend

---

### Paso 2: Crear una inscripción de prueba

1. Ve a: `http://localhost:3000/convencion/inscripcion`
2. Completa el formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: `test@example.com`
   - Teléfono: +54 9 11 1234-5678
   - Sede: Cualquiera
   - País: Argentina
   - Provincia: Buenos Aires
3. Haz clic en "Inscribirse"

**Resultado esperado:**
- Se crea la inscripción
- Aparece la tarjeta "Inscripción Existente"
- En "Estado de Pagos" aparecen 3 cuotas

---

### Paso 3: Verificar que los pagos se crearon

1. Ve al panel admin: `http://localhost:3000/admin/pagos`
2. Busca pagos con el email `test@example.com`
3. Deberías ver 3 pagos con estado "PENDIENTE"

**Si no hay pagos:**
- Verifica los logs del backend
- Verifica que la convención tenga un costo configurado
- Verifica que el proceso de creación se completó

---

### Paso 4: Buscar el botón

1. Vuelve a: `http://localhost:3000/convencion/inscripcion`
2. Ingresa el mismo email que usaste (`test@example.com`)
3. Deberías ver la tarjeta "Inscripción Existente"
4. En la sección "Estado de Pagos", busca:
   - Cada cuota PENDIENTE
   - Junto a cada cuota, debería aparecer el botón: **"Pagar $X con Mercado Pago"**

**Si no ves el botón:**
- Abre la consola del navegador (F12)
- Ve a la pestaña "Console"
- Busca errores relacionados con Mercado Pago
- Ve a la pestaña "Network"
- Filtra por "mercado-pago"
- Verifica que la request a `/api/mercado-pago/status` retorne `configured: true`

---

## 🐛 Debugging en el navegador

### Abrir DevTools (F12)

1. **Pestaña Console:**
   - Busca errores relacionados con Mercado Pago
   - Busca mensajes como "Mercado Pago no configurado"

2. **Pestaña Network:**
   - Filtra por "mercado-pago"
   - Verifica que la request a `/api/mercado-pago/status` retorne `{ configured: true }`
   - Si retorna `{ configured: false }`, el botón no aparecerá

3. **Pestaña Elements:**
   - Busca el elemento con clase "Estado de Pagos"
   - Verifica que haya elementos de cuotas pendientes
   - Verifica que el componente `MercadoPagoButton` esté renderizado

---

## ✅ Checklist de verificación

- [ ] Backend corriendo en `http://localhost:4000`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] Mercado Pago configurado (`/api/mercado-pago/status` retorna `configured: true`)
- [ ] Tienes una inscripción creada
- [ ] Los pagos se crearon automáticamente (3 pagos PENDIENTES)
- [ ] Estás en la página `/convencion/inscripcion`
- [ ] Ves la tarjeta "Inscripción Existente"
- [ ] Ves la sección "Estado de Pagos" con 3 cuotas
- [ ] Al menos una cuota está en estado "Pendiente"
- [ ] No hay errores en la consola del navegador

---

## 🔧 Solución rápida

Si después de verificar todo lo anterior aún no ves el botón:

1. **Verifica que Mercado Pago esté configurado:**
   ```bash
   curl http://localhost:4000/api/mercado-pago/status
   ```

2. **Crea una nueva inscripción de prueba:**
   - Usa un email nuevo
   - Completa todos los campos
   - Verifica que se creen los pagos

3. **Abre la consola del navegador (F12):**
   - Busca errores
   - Verifica las requests a `/api/mercado-pago/status`

4. **Verifica los logs del backend:**
   - Deberías ver: `✅ Mercado Pago inicializado (modo: TEST)`

---

## 📞 Si aún no funciona

Si después de seguir todos los pasos anteriores aún no ves el botón:

1. **Comparte esta información:**
   - Resultado de `curl http://localhost:4000/api/mercado-pago/status`
   - Captura de pantalla de la página `/convencion/inscripcion`
   - Errores de la consola del navegador (F12)
   - Logs del backend

2. **Verifica que:**
   - El backend esté corriendo
   - El frontend esté corriendo
   - Las variables de entorno estén configuradas
   - No haya errores en los logs

---

**¿Necesitas ayuda?** Revisa los logs del backend y la consola del navegador para identificar el problema específico.
























