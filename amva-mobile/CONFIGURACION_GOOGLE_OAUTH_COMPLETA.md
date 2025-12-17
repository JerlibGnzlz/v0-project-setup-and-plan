# Configuración Completa de Google OAuth para AMVA Mobile

## ✅ Estado Actual

- ✅ **Estado de publicación**: "En producción"
- ✅ **Client ID configurado**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`
- ✅ **Dominio autorizado**: `ministerio-backend-wdbj.onrender.com`
- ✅ **Email de contacto**: `jerlibgnzlz@gmail.com`
- ⚠️ **Campos faltantes en "Información de la marca"**:
  - Página principal de la aplicación
  - **Política de Privacidad** (OBLIGATORIO)
  - Condiciones del Servicio (Recomendado)

## 🔴 Campos Obligatorios que Faltan

### 1. Política de Privacidad (OBLIGATORIO)

Google **requiere** una URL de Política de Privacidad para apps en producción. Sin esto, Google puede bloquear el login.

**Opciones:**

#### Opción A: Crear página en tu sitio web
Si tienes un sitio web (ej: `vidaabundante.org`), crea una página `/privacidad` o `/privacy-policy` y usa esa URL.

#### Opción B: Usar un servicio gratuito
Puedes usar servicios como:
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Termly](https://termly.io/)
- [FreePrivacyPolicy](https://www.freeprivacypolicy.com/)

Luego, aloja el contenido en tu sitio web o en GitHub Pages.

#### Opción C: Crear página en el backend (Recomendado)
Crear un endpoint en el backend que sirva la política de privacidad.

**URL sugerida**: `https://ministerio-backend-wdbj.onrender.com/privacy-policy`

### 2. Página Principal de la Aplicación (Recomendado)

URL donde los usuarios pueden encontrar información sobre tu app.

**Sugerencias:**
- `https://vidaabundante.org` (si tienes sitio web)
- `https://ministerio-backend-wdbj.onrender.com` (backend)
- `https://github.com/JerlibGnzlz/v0-project-setup-and-plan` (repositorio)

### 3. Condiciones del Servicio (Opcional pero Recomendado)

Similar a la Política de Privacidad, pero para términos de uso.

**URL sugerida**: `https://ministerio-backend-wdbj.onrender.com/terms-of-service`

## 📝 Pasos para Completar la Configuración

### Paso 1: Crear Política de Privacidad

Crea un archivo HTML o una página en tu backend con el siguiente contenido mínimo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - AMVA Go</title>
</head>
<body>
    <h1>Política de Privacidad</h1>
    <p><strong>Última actualización:</strong> [Fecha]</p>
    
    <h2>1. Información que Recopilamos</h2>
    <p>AMVA Go recopila la siguiente información cuando usas Google Sign-In:</p>
    <ul>
        <li>Nombre y apellido</li>
        <li>Dirección de correo electrónico</li>
        <li>Foto de perfil (opcional)</li>
    </ul>
    
    <h2>2. Uso de la Información</h2>
    <p>Utilizamos esta información para:</p>
    <ul>
        <li>Crear y gestionar tu cuenta de usuario</li>
        <li>Proporcionar acceso a las funcionalidades de la aplicación</li>
        <li>Enviar notificaciones relacionadas con tu cuenta</li>
    </ul>
    
    <h2>3. Protección de Datos</h2>
    <p>Protegemos tu información utilizando medidas de seguridad estándar de la industria.</p>
    
    <h2>4. Contacto</h2>
    <p>Para preguntas sobre esta política, contacta: jerlibgnzlz@gmail.com</p>
</body>
</html>
```

### Paso 2: Agregar Endpoints en el Backend (Recomendado)

Agrega endpoints en tu backend NestJS para servir estas páginas:

```typescript
// backend/src/modules/public/public.controller.ts
@Controller()
export class PublicController {
  @Get('privacy-policy')
  getPrivacyPolicy(@Res() res: Response) {
    res.sendFile('privacy-policy.html', { root: './public' })
  }
  
  @Get('terms-of-service')
  getTermsOfService(@Res() res: Response) {
    res.sendFile('terms-of-service.html', { root: './public' })
  }
}
```

### Paso 3: Configurar en Google Cloud Console

1. Ve a **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. Haz clic en **"Información de la marca"**
3. Completa los siguientes campos:

   **Página principal de la aplicación:**
   ```
   https://ministerio-backend-wdbj.onrender.com
   ```
   o
   ```
   https://vidaabundante.org
   ```

   **Vínculo a la Política de Privacidad:**
   ```
   https://ministerio-backend-wdbj.onrender.com/privacy-policy
   ```
   (o la URL donde hayas alojado tu política)

   **Vínculo a las Condiciones del Servicio:**
   ```
   https://ministerio-backend-wdbj.onrender.com/terms-of-service
   ```
   (opcional pero recomendado)

4. Haz clic en **"Guardar"**

### Paso 4: Verificar Dominios Autorizados

Asegúrate de que el dominio donde alojas las políticas esté en "Dominios autorizados":
- Si usas `ministerio-backend-wdbj.onrender.com`, ya está autorizado ✅
- Si usas otro dominio (ej: `vidaabundante.org`), agrégalo en "Dominios autorizados"

### Paso 5: Verificar la Marca (Opcional)

1. Ve a **"Centro de verificación"**
2. Haz clic en **"Verificar la marca"** (si quieres eliminar la advertencia)
3. Google revisará tu información (puede tardar varios días)

**Nota**: La verificación de marca es opcional. La app funcionará sin ella, pero los usuarios pueden ver una advertencia.

## ✅ Verificación Final

Después de completar los campos:

1. **Cierra completamente la app móvil**
2. **Reinicia la app**
3. **Prueba el login con Google**

Debería funcionar correctamente.

## 🔍 Troubleshooting

### Si aún aparece "Access blocked":

1. **Espera 5-15 minutos** después de guardar los cambios
2. **Verifica que las URLs sean accesibles** (abre las URLs en un navegador)
3. **Verifica que los dominios estén autorizados**
4. **Revisa los logs de la app** para ver errores específicos

### Si las URLs no son accesibles:

- Asegúrate de que el backend esté corriendo
- Verifica que los endpoints estén configurados correctamente
- Usa `curl` o un navegador para probar las URLs

## 📚 Recursos Adicionales

- [Google OAuth Consent Screen Documentation](https://developers.google.com/identity/protocols/oauth2/policies)
- [Privacy Policy Requirements](https://support.google.com/cloud/answer/9110914)

