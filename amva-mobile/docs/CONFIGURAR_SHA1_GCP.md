# Cómo Configurar SHA-1 en Google Cloud Console

## 🔍 Paso 1: Encontrar o Crear Cliente OAuth de Tipo Android

### Opción A: Si ya existe un cliente Android

1. En la página actual de Google Cloud Console, ve a la **barra lateral izquierda**
2. Haz clic en **"Clientes"** (Clients) - deberías estar ahí
3. En la lista de clientes, busca uno que diga **"ID de cliente para Android"** o **"Android"**
4. Si lo encuentras, haz clic en él

### Opción B: Si NO existe, crear uno nuevo

1. En la página de **"Clientes"**, haz clic en el botón **"+ CREAR CREDENCIALES"** (arriba a la derecha)
2. Selecciona **"ID de cliente de OAuth 2.0"**
3. En **"Tipo de aplicación"**, selecciona **"Android"**
4. Completa los campos:
   - **Nombre**: `AMVA Android Client` (o el nombre que prefieras)
   - **Nombre del paquete**: `org.vidaabundante.app` (debe coincidir con el de tu app)
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Haz clic en **"CREAR"**

## 📍 Paso 2: Agregar SHA-1 en el Cliente Android

Una vez que estés en la página del cliente Android:

1. Busca la sección **"SHA-1 certificate fingerprint"** o **"Huella digital del certificado SHA-1"**
2. Verás un campo de texto donde puedes agregar SHA-1
3. Pega el siguiente SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
4. Haz clic en **"Guardar"** (botón azul en la parte inferior)

## ⚠️ Importante

- **NO uses el cliente de "Aplicación web"** para el SHA-1
- El SHA-1 **SOLO** se configura en clientes de tipo **"Android"**
- Puedes tener **múltiples SHA-1** en el mismo cliente Android (uno para debug, otro para producción)
- Los cambios pueden tardar **5-15 minutos** en aplicarse

## 🔄 Si Necesitas Agregar Más SHA-1

Si más adelante necesitas agregar el SHA-1 de producción:

1. Ve al mismo cliente Android
2. En la sección de SHA-1, haz clic en **"+ Agregar huella digital"** o similar
3. Agrega el nuevo SHA-1
4. Guarda los cambios

## 📝 Resumen del SHA-1

**SHA-1 de Debug (Actual)**:
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Ubicación**: Cliente OAuth de tipo **"Android"** (NO "Aplicación web")

## 🎯 Verificación

Después de guardar:
1. Espera 5-15 minutos
2. Prueba Google Sign-In en tu app
3. Si funciona, ¡listo! ✅
4. Si no funciona, verifica que:
   - El SHA-1 esté correctamente copiado (sin espacios extra)
   - Estés usando el cliente Android correcto
   - El nombre del paquete coincida: `org.vidaabundante.app`

