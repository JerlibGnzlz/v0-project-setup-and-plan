import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller()
export class PublicController {
  @Get('privacy-policy')
  getPrivacyPolicy(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - AMVA Go</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #22c55e; }
        h2 { color: #16a34a; margin-top: 30px; }
        ul { margin: 10px 0; }
        .last-updated { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>Política de Privacidad</h1>
    <p class="last-updated"><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <h2>1. Información que Recopilamos</h2>
    <p>AMVA Go (Asociación Misionera Vida Abundante) recopila la siguiente información cuando usas Google Sign-In:</p>
    <ul>
        <li>Nombre y apellido</li>
        <li>Dirección de correo electrónico</li>
        <li>Foto de perfil (opcional)</li>
        <li>ID único de Google</li>
    </ul>
    
    <h2>2. Uso de la Información</h2>
    <p>Utilizamos esta información para:</p>
    <ul>
        <li>Crear y gestionar tu cuenta de usuario</li>
        <li>Proporcionar acceso a las funcionalidades de la aplicación</li>
        <li>Enviar notificaciones relacionadas con tu cuenta y actividades</li>
        <li>Mejorar nuestros servicios</li>
    </ul>
    
    <h2>3. Protección de Datos</h2>
    <p>Protegemos tu información utilizando medidas de seguridad estándar de la industria, incluyendo:</p>
    <ul>
        <li>Cifrado de datos en tránsito (HTTPS)</li>
        <li>Almacenamiento seguro de credenciales</li>
        <li>Acceso restringido a información personal</li>
    </ul>
    
    <h2>4. Compartir Información</h2>
    <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto cuando sea necesario para proporcionar nuestros servicios o cuando la ley lo requiera.</p>
    
    <h2>5. Tus Derechos</h2>
    <p>Tienes derecho a:</p>
    <ul>
        <li>Acceder a tu información personal</li>
        <li>Corregir información incorrecta</li>
        <li>Solicitar la eliminación de tu cuenta</li>
        <li>Retirar tu consentimiento en cualquier momento</li>
    </ul>
    
    <h2>6. Contacto</h2>
    <p>Para preguntas sobre esta política de privacidad o para ejercer tus derechos, contacta:</p>
    <p><strong>Email:</strong> jerlibgnzlz@gmail.com</p>
    <p><strong>Organización:</strong> Asociación Misionera Vida Abundante (AMVA)</p>
</body>
</html>
    `
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  }

  @Get('terms-of-service')
  getTermsOfService(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Términos de Servicio - AMVA Go</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #22c55e; }
        h2 { color: #16a34a; margin-top: 30px; }
        ul { margin: 10px 0; }
        .last-updated { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>Términos de Servicio</h1>
    <p class="last-updated"><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <h2>1. Aceptación de los Términos</h2>
    <p>Al acceder y usar AMVA Go, aceptas estos términos de servicio. Si no estás de acuerdo con alguno de estos términos, no debes usar la aplicación.</p>
    
    <h2>2. Uso de la Aplicación</h2>
    <p>AMVA Go es una aplicación móvil desarrollada para la Asociación Misionera Vida Abundante. La aplicación permite:</p>
    <ul>
        <li>Registro e inscripción a convenciones</li>
        <li>Consulta de credenciales ministeriales</li>
        <li>Acceso a noticias y actualizaciones</li>
        <li>Gestión de perfil de usuario</li>
    </ul>
    
    <h2>3. Cuenta de Usuario</h2>
    <p>Para usar ciertas funcionalidades, necesitas crear una cuenta. Eres responsable de:</p>
    <ul>
        <li>Mantener la confidencialidad de tus credenciales</li>
        <li>Toda la actividad que ocurra bajo tu cuenta</li>
        <li>Proporcionar información precisa y actualizada</li>
    </ul>
    
    <h2>4. Conducta del Usuario</h2>
    <p>No debes:</p>
    <ul>
        <li>Usar la aplicación para fines ilegales</li>
        <li>Intentar acceder a áreas restringidas</li>
        <li>Interferir con el funcionamiento de la aplicación</li>
        <li>Compartir información falsa o engañosa</li>
    </ul>
    
    <h2>5. Propiedad Intelectual</h2>
    <p>Todo el contenido de AMVA Go, incluyendo texto, gráficos, logos y software, es propiedad de la Asociación Misionera Vida Abundante y está protegido por leyes de propiedad intelectual.</p>
    
    <h2>6. Limitación de Responsabilidad</h2>
    <p>AMVA Go se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables por daños directos, indirectos o consecuentes derivados del uso de la aplicación.</p>
    
    <h2>7. Modificaciones</h2>
    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al publicarse en esta página.</p>
    
    <h2>8. Contacto</h2>
    <p>Para preguntas sobre estos términos de servicio, contacta:</p>
    <p><strong>Email:</strong> jerlibgnzlz@gmail.com</p>
    <p><strong>Organización:</strong> Asociación Misionera Vida Abundante (AMVA)</p>
</body>
</html>
    `
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  }
}

