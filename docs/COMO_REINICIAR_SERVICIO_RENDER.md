# 🔄 Cómo Reiniciar el Servicio en Render

## 📋 Métodos para Reiniciar

Hay **3 formas** de reiniciar el servicio en Render:

### Método 1: Manual Deploy (Recomendado)

**Cuándo usar:** Cuando cambias variables de entorno o quieres forzar un rebuild completo.

**Pasos:**
1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend (ej: `ministerio-backend`)
3. En el menú superior, haz clic en **"Manual Deploy"**
4. Selecciona **"Clear build cache & deploy"**
5. Espera a que termine el deploy (puede tardar 2-5 minutos)

**Ventajas:**
- ✅ Limpia la caché de build
- ✅ Reconstruye todo desde cero
- ✅ Asegura que los cambios se apliquen

---

### Método 2: Restart (Rápido)

**Cuándo usar:** Cuando solo quieres reiniciar el servicio sin rebuild.

**Pasos:**
1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend
3. En el menú superior, haz clic en **"..."** (tres puntos)
4. Selecciona **"Restart"**
5. Espera unos segundos a que se reinicie

**Ventajas:**
- ✅ Muy rápido (segundos)
- ✅ No reconstruye, solo reinicia

**Desventajas:**
- ⚠️ No limpia caché
- ⚠️ No aplica cambios de código (solo reinicia)

---

### Método 3: Push a Git (Automático)

**Cuándo usar:** Cuando haces push de cambios al repositorio.

**Pasos:**
1. Haz cambios en tu código
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```
3. Render detectará automáticamente el push
4. Iniciará un deploy automático

**Ventajas:**
- ✅ Automático
- ✅ Siempre actualizado con el código

**Desventajas:**
- ⚠️ Puede tardar más (build completo)

---

## 🎯 Cuándo Usar Cada Método

### Usar "Manual Deploy" cuando:
- ✅ Cambias variables de entorno
- ✅ Quieres limpiar caché
- ✅ Quieres forzar un rebuild completo
- ✅ Después de configurar SMTP o SendGrid

### Usar "Restart" cuando:
- ✅ Solo quieres reiniciar el servicio
- ✅ No has cambiado código
- ✅ Quieres verificar que el servicio esté corriendo

### Usar "Push a Git" cuando:
- ✅ Haces cambios en el código
- ✅ Quieres deployar nueva funcionalidad
- ✅ Es tu flujo normal de trabajo

---

## 📋 Pasos Detallados: Manual Deploy

### Paso 1: Ir al Dashboard

1. Abre https://dashboard.render.com
2. Inicia sesión si es necesario

### Paso 2: Seleccionar el Servicio

1. En la lista de servicios, busca tu servicio backend
2. El nombre suele ser algo como:
   - `ministerio-backend`
   - `backend`
   - O el nombre que le diste

### Paso 3: Manual Deploy

1. Haz clic en el servicio para abrirlo
2. En la parte superior, verás varios botones
3. Haz clic en **"Manual Deploy"**
4. Se abrirá un menú desplegable

### Paso 4: Clear Build Cache

1. En el menú desplegable, selecciona:
   - **"Clear build cache & deploy"** (recomendado)
   - O **"Deploy latest commit"** (si no quieres limpiar caché)

### Paso 5: Esperar

1. Verás un mensaje: "Deploying..."
2. Puedes ver los logs en tiempo real
3. Espera a que termine (2-5 minutos normalmente)
4. Cuando termine, verás: "Live" en verde

---

## 📊 Verificar que Funcionó

### 1. Revisar Estado

Después del deploy, verifica:
- ✅ Estado: **"Live"** (verde)
- ✅ Último deploy: Fecha/hora reciente
- ✅ Build: "Succeeded" (verde)

### 2. Revisar Logs

1. Haz clic en la pestaña **"Logs"**
2. Busca mensajes como:
   ```
   ✅ Servicio de email configurado (Gmail SMTP)
   ```
   O
   ```
   ✅ Servicio de email configurado (SendGrid)
   ```

### 3. Probar el Servicio

1. Ve a la URL de tu servicio (ej: `https://ministerio-backend.onrender.com`)
2. O prueba un endpoint (ej: `/api/health` o `/api/convenciones`)

---

## 🔍 Troubleshooting

### Problema: "Deploy failed"

**Causa:** Error en el build o configuración

**Solución:**
1. Revisa los logs del deploy
2. Busca errores en rojo
3. Corrige el problema
4. Intenta nuevamente

### Problema: "Service unavailable"

**Causa:** El servicio no se inició correctamente

**Solución:**
1. Revisa los logs
2. Busca errores al iniciar
3. Verifica variables de entorno
4. Reinicia nuevamente

### Problema: Los cambios no se aplican

**Causa:** Caché o variables de entorno no actualizadas

**Solución:**
1. Usa "Clear build cache & deploy"
2. Verifica que las variables de entorno estén correctas
3. Espera a que termine completamente el deploy

---

## ⚡ Atajos Rápidos

### Desde el Dashboard Principal

1. Ve a https://dashboard.render.com
2. En la lista de servicios, verás botones de acción rápida
3. Puedes hacer clic en **"..."** → **"Restart"** directamente

### Desde la Página del Servicio

1. Abre el servicio
2. Botón **"Manual Deploy"** está en la parte superior
3. Un clic y seleccionas la opción

---

## 📝 Notas Importantes

1. **Tiempo de Deploy:**
   - Restart: 10-30 segundos
   - Manual Deploy: 2-5 minutos
   - Auto Deploy (Git): 3-7 minutos

2. **Variables de Entorno:**
   - Los cambios en variables de entorno requieren reinicio
   - Usa "Manual Deploy" después de cambiar variables

3. **Logs:**
   - Siempre revisa los logs después de reiniciar
   - Los logs muestran si el servicio inició correctamente

4. **Estado del Servicio:**
   - **"Live"** (verde) = Funcionando
   - **"Deploying"** (amarillo) = En proceso
   - **"Failed"** (rojo) = Error, revisa logs

---

## ✅ Checklist de Reinicio

Antes de reiniciar:
- [ ] Verificaste que las variables de entorno estén correctas
- [ ] Guardaste todos los cambios en Git (si aplica)
- [ ] Tienes acceso a los logs para verificar

Después de reiniciar:
- [ ] Estado muestra "Live" (verde)
- [ ] Logs muestran que el servicio inició correctamente
- [ ] Logs muestran configuración de email correcta
- [ ] Puedes acceder al servicio

---

**Última actualización:** Diciembre 2025

