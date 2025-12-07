/**
 * Templates centralizados para emails
 * Cada template retorna un objeto con title y body (HTML)
 */

import { NotificationType } from '../types/notification.types'

export interface EmailTemplateData {
  [key: string]: unknown
}

export interface EmailTemplate {
  title: string
  body: string
  type: string
}

/**
 * Template base para emails
 */
function buildBaseTemplate(
  title: string,
  body: string,
  icon: string = '📬',
  color: string = '#10b981'
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #0a1628 0%, #0d1f35 100%); border-radius: 8px 8px 0 0;">
              <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">AMVA Digital</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Asociación Misionera Vida Abundante<br>
                <a href="https://vidaabundante.org" style="color: ${color}; text-decoration: none;">vidaabundante.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Template para pago validado
 */
export function getPagoValidadoTemplate(data: EmailTemplateData): EmailTemplate {
  const montoValue = data.monto
  const monto = typeof montoValue === 'number' ? montoValue : typeof montoValue === 'string' ? parseFloat(montoValue) || 0 : 0
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)

  // Obtener nombre completo: primero intentar inscripcionNombre, luego nombre + apellido, luego fallback
  const nombreCompleto = 
    data.inscripcionNombre || 
    (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : null) ||
    data.nombre || 
    'Estimado/a participante'
  const convencionTitulo = data.convencionTitulo || 'Convención'
  const numeroCuota = data.numeroCuota || 'N/A'
  const cuotasTotalesValue = data.cuotasTotales
  const cuotasTotales =
    typeof cuotasTotalesValue === 'number'
      ? cuotasTotalesValue
      : typeof cuotasTotalesValue === 'string'
      ? parseInt(cuotasTotalesValue) || 0
      : 0
  const cuotasPagadasValue = data.cuotasPagadas
  const cuotasPagadas =
    typeof cuotasPagadasValue === 'number'
      ? cuotasPagadasValue
      : typeof cuotasPagadasValue === 'string'
      ? parseInt(cuotasPagadasValue) || 0
      : 0
  const porcentajeProgreso = cuotasTotales > 0 ? Math.round((cuotasPagadas / cuotasTotales) * 100) : 0

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">✅ ¡Pago Validado Exitosamente!</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      Hola <strong>${nombreCompleto}</strong>,<br><br>
      Nos complace informarte que tu pago ha sido <strong style="color: #10b981;">validado exitosamente</strong>. 
      Gracias por tu contribución y compromiso con nuestra convención.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 2px solid #10b981; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.1);">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 50px; height: 50px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 24px;">✅</span>
        </div>
        <div>
          <h3 style="margin: 0; color: #065f46; font-size: 18px; font-weight: 700;">Detalles del Pago</h3>
          <p style="margin: 5px 0 0; color: #047857; font-size: 14px;">Validado y confirmado</p>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Convención:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${convencionTitulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Monto Pagado:</strong></td>
            <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${montoFormateado}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Cuota:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">Cuota ${numeroCuota} de ${cuotasTotales}</td>
          </tr>
          ${data.metodoPago ? `<tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><strong>Método de Pago:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; text-transform: capitalize;">${String(data.metodoPago)}</td>
          </tr>` : ''}
        </table>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Progreso de Pagos:</span>
          <span style="color: #10b981; font-size: 14px; font-weight: 700;">${cuotasPagadas} de ${cuotasTotales} cuotas</span>
        </div>
        <div style="width: 100%; height: 12px; background-color: #e5e7eb; border-radius: 6px; overflow: hidden;">
          <div style="width: ${porcentajeProgreso}%; height: 100%; background: linear-gradient(90deg, #10b981 0%, #34d399 100%); transition: width 0.3s ease;"></div>
        </div>
        <p style="margin: 10px 0 0; color: #059669; font-size: 13px; text-align: center; font-weight: 600;">${porcentajeProgreso}% completado</p>
      </div>
    </div>
    
    <p style="margin: 25px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>Próximos pasos:</strong> Continuaremos procesando tus pagos restantes. Te notificaremos cuando cada cuota sea validada.
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
      <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
        <strong>💡 Recordatorio:</strong> Si tienes más cuotas pendientes, puedes subir los comprobantes desde tu perfil o contactarnos si necesitas ayuda.
      </p>
    </div>
  `

  return {
    title: `✅ Pago Validado - ${convencionTitulo}`,
    body: buildBaseTemplate('Pago Validado', body, '✅', '#10b981'),
    type: 'pago_validado',
  }
}

/**
 * Template para pago rechazado
 */
export function getPagoRechazadoTemplate(data: EmailTemplateData): EmailTemplate {
  // Obtener nombre completo: primero intentar inscripcionNombre, luego nombre + apellido, luego fallback
  const nombreCompleto = 
    data.inscripcionNombre || 
    (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : null) ||
    data.nombre || 
    'Estimado/a participante'
  const convencionTitulo = data.convencionTitulo || 'Convención'
  const motivo = data.motivo ? String(data.motivo) : 'No se especificó un motivo'
  const montoValue = data.monto
  const monto = typeof montoValue === 'number' ? montoValue : typeof montoValue === 'string' ? parseFloat(montoValue) || 0 : 0
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">❌ Pago Requiere Revisión</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      Hola <strong>${nombreCompleto}</strong>,<br><br>
      Lamentamos informarte que tu pago no pudo ser validado en este momento. 
      Por favor, revisa los detalles a continuación y contáctanos si necesitas ayuda.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; border: 2px solid #ef4444; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 50px; height: 50px; background-color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 24px;">⚠️</span>
        </div>
        <div>
          <h3 style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">Información del Pago</h3>
          <p style="margin: 5px 0 0; color: #dc2626; font-size: 14px;">Requiere acción</p>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Convención:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${convencionTitulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Monto:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${montoFormateado}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;"><strong>Motivo del Rechazo:</strong></td>
            <td style="padding: 8px 0; color: #dc2626; font-size: 14px; text-align: right; font-weight: 600;">${motivo}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: 700;">📋 ¿Qué puedes hacer?</h3>
      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
        <li>Verifica que el comprobante sea legible y completo</li>
        <li>Confirma que el monto coincida con el pago realizado</li>
        <li>Revisa que el código de referencia (si aplica) sea correcto</li>
        <li>Vuelve a subir el comprobante desde tu perfil o el sitio web</li>
      </ul>
    </div>
    
    <p style="margin: 25px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>¿Necesitas ayuda?</strong> No dudes en contactarnos. Estamos aquí para ayudarte a resolver cualquier inconveniente con tu pago.
    </p>
  `

  return {
    title: `❌ Pago Requiere Revisión - ${convencionTitulo}`,
    body: buildBaseTemplate('Pago Rechazado', body, '❌', '#ef4444'),
    type: 'pago_rechazado',
  }
}

/**
 * Template para pago rehabilitado
 */
export function getPagoRehabilitadoTemplate(data: EmailTemplateData): EmailTemplate {
  // Obtener nombre completo: primero intentar inscripcionNombre, luego nombre + apellido, luego fallback
  const nombreCompleto = 
    data.inscripcionNombre || 
    (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : null) ||
    data.nombre || 
    'Estimado/a participante'
  const convencionTitulo = data.convencionTitulo || 'Convención'
  const montoValue = data.monto
  const monto = typeof montoValue === 'number' ? montoValue : typeof montoValue === 'string' ? parseFloat(montoValue) || 0 : 0
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">🔄 Pago Rehabilitado</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      Hola <strong>${nombreCompleto}</strong>,<br><br>
      ¡Buenas noticias! Tu pago ha sido <strong style="color: #f59e0b;">rehabilitado</strong>. 
      Ahora puedes volver a subir tu comprobante de pago para continuar con el proceso de validación.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 12px; border: 2px solid #f59e0b; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 50px; height: 50px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 24px;">🔄</span>
        </div>
        <div>
          <h3 style="margin: 0; color: #92400e; font-size: 18px; font-weight: 700;">Listo para Reintentar</h3>
          <p style="margin: 5px 0 0; color: #b45309; font-size: 14px;">Puedes subir tu comprobante nuevamente</p>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Convención:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${convencionTitulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><strong>Monto:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right;">${montoFormateado}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
      <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 16px; font-weight: 700;">📤 Próximos Pasos</h3>
      <ol style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
        <li>Accede a tu perfil o al sitio web de inscripciones</li>
        <li>Localiza el pago correspondiente</li>
        <li>Sube nuevamente tu comprobante de pago (asegúrate de que sea legible)</li>
        <li>Espera la validación por parte de nuestro equipo</li>
      </ol>
    </div>
    
    <p style="margin: 25px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>💡 Consejo:</strong> Asegúrate de que el comprobante esté completo, legible y que el monto coincida exactamente con el pago realizado.
    </p>
  `

  return {
    title: `🔄 Pago Rehabilitado - ${convencionTitulo}`,
    body: buildBaseTemplate('Pago Rehabilitado', body, '🔄', '#f59e0b'),
    type: 'pago_rehabilitado',
  }
}

/**
 * Template para recordatorio de pago
 */
export function getPagoRecordatorioTemplate(data: EmailTemplateData): EmailTemplate {
  // Obtener nombre completo: primero intentar inscripcionNombre, luego nombre + apellido, luego fallback
  const nombreCompleto = 
    data.inscripcionNombre || 
    (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : null) ||
    data.nombre || 
    'Estimado/a participante'
  const convencionTitulo = data.convencionTitulo || 'Convención'
  const montoPendienteValue = data.montoPendiente
  const montoPendiente =
    typeof montoPendienteValue === 'number'
      ? montoPendienteValue
      : typeof montoPendienteValue === 'string'
      ? parseFloat(montoPendienteValue) || 0
      : 0
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montoPendiente)
  const cuotasPendientes = data.cuotasPendientes || 0
  const fechaLimite = data.fechaLimite
    ? new Date(String(data.fechaLimite)).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">⏰ Tienes Pagos Pendientes</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      Hola <strong>${nombreCompleto}</strong>,<br><br>
      Te recordamos que tienes <strong style="color: #ef4444; font-size: 18px;">pagos pendientes</strong> para tu inscripción a la convención. 
      Para asegurar tu lugar, es importante que completes el proceso de pago lo antes posible.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; border: 2px solid #ef4444; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 50px; height: 50px; background-color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 24px;">⚠️</span>
        </div>
        <div>
          <h3 style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">Pagos Pendientes</h3>
          <p style="margin: 5px 0 0; color: #dc2626; font-size: 14px;">Requiere acción inmediata</p>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Convención:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${convencionTitulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Cuotas Pendientes:</strong></td>
            <td style="padding: 8px 0; color: #ef4444; font-size: 18px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${cuotasPendientes} ${cuotasPendientes === 1 ? 'cuota' : 'cuotas'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><strong>Monto Total Pendiente:</strong></td>
            <td style="padding: 8px 0; color: #dc2626; font-size: 20px; font-weight: 700; text-align: right;">${montoFormateado}</td>
          </tr>
        </table>
        ${fechaLimite ? `
        <div style="margin-top: 15px; padding: 12px; background-color: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">📅 Fecha límite: ${fechaLimite}</p>
        </div>
        ` : ''}
      </div>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: 700;">📋 ¿Qué debes hacer?</h3>
      <ol style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
        <li>Revisa los pagos pendientes en tu perfil o en el sitio web</li>
        <li>Realiza el pago correspondiente usando uno de los métodos disponibles</li>
        <li>Sube el comprobante de pago si es necesario</li>
        <li>Espera la confirmación de tu pago</li>
      </ol>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 15px; color: #065f46; font-size: 16px; font-weight: 700;">💳 Métodos de Pago Disponibles</h3>
      <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
        <li><strong>Transferencia Bancaria:</strong> Realiza la transferencia y sube el comprobante</li>
        <li><strong>MercadoPago:</strong> Pago online seguro y rápido</li>
        <li><strong>Efectivo:</strong> Si pagas en efectivo, usa tu código de referencia</li>
      </ul>
    </div>
    
    <p style="margin: 25px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>⚠️ Importante:</strong> Tu inscripción no estará completa hasta que todos los pagos pendientes sean realizados y validados. 
      Por favor, completa el proceso de pago para asegurar tu lugar en la convención.
    </p>
    
    <p style="margin: 20px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>¿Necesitas ayuda?</strong> No dudes en contactarnos. Estamos aquí para ayudarte a completar tu inscripción.
    </p>
  `

  return {
    title: `⏰ Tienes Pagos Pendientes - ${convencionTitulo}`,
    body: buildBaseTemplate('Tienes Pagos Pendientes', body, '⏰', '#ef4444'),
    type: 'pago_recordatorio',
  }
}

/**
 * Template para inscripción creada
 */
export function getInscripcionCreadaTemplate(data: EmailTemplateData): EmailTemplate {
  // Obtener nombre completo: primero intentar inscripcionNombre, luego nombre + apellido, luego fallback
  const nombreCompleto = 
    data.inscripcionNombre || 
    (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : null) ||
    data.nombre || 
    'Estimado/a participante'
  const convencionTitulo = data.convencionTitulo || 'Convención'
  const montoTotalValue = data.montoTotal
  const montoTotal =
    typeof montoTotalValue === 'number'
      ? montoTotalValue
      : typeof montoTotalValue === 'string'
      ? parseFloat(montoTotalValue) || 0
      : 0
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montoTotal)
  const numeroCuotasValue = data.numeroCuotas
  const numeroCuotas =
    typeof numeroCuotasValue === 'number'
      ? numeroCuotasValue
      : typeof numeroCuotasValue === 'string'
      ? parseInt(numeroCuotasValue) || 1
      : 1
  const montoPorCuota = numeroCuotas > 0 ? montoTotal / numeroCuotas : montoTotal
  const origenRegistro = data.origenRegistro || 'web'
  const origenLabel =
    origenRegistro === 'mobile'
      ? 'Aplicación Móvil'
      : origenRegistro === 'dashboard'
      ? 'Panel Administrativo'
      : 'Sitio Web'

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">📝 ¡Inscripción Recibida Exitosamente!</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      Hola <strong>${nombreCompleto}</strong>,<br><br>
      ¡Gracias por inscribirte! Tu inscripción ha sido <strong style="color: #3b82f6;">recibida exitosamente</strong>. 
      Te notificaremos cuando sea confirmada y podrás comenzar a realizar tus pagos.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%); border-radius: 12px; border: 2px solid #3b82f6; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 50px; height: 50px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 24px;">📝</span>
        </div>
        <div>
          <h3 style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 700;">Detalles de tu Inscripción</h3>
          <p style="margin: 5px 0 0; color: #1e3a8a; font-size: 14px;">Recibida y en proceso</p>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Convención:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${convencionTitulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Monto Total:</strong></td>
            <td style="padding: 8px 0; color: #3b82f6; font-size: 18px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${montoFormateado}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Número de Cuotas:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${numeroCuotas} ${numeroCuotas === 1 ? 'cuota' : 'cuotas'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Monto por Cuota:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montoPorCuota)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><strong>Origen de Registro:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right;">${origenLabel}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 15px; color: #065f46; font-size: 16px; font-weight: 700;">📋 Próximos Pasos</h3>
      <ol style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
        <li>Revisa los detalles de tu inscripción</li>
        <li>Realiza el pago de la primera cuota (si aplica)</li>
        <li>Sube el comprobante de pago cuando lo tengas</li>
        <li>Espera la confirmación de tu inscripción</li>
      </ol>
    </div>
    
    <p style="margin: 25px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>💡 Importante:</strong> Mantén este email como referencia. Te enviaremos actualizaciones sobre el estado de tu inscripción y pagos.
    </p>
  `

  return {
    title: `📝 Inscripción Recibida - ${convencionTitulo}`,
    body: buildBaseTemplate('Inscripción Recibida', body, '📝', '#3b82f6'),
    type: 'inscripcion_creada',
  }
}

/**
 * Template para inscripción confirmada
 */
export function getInscripcionConfirmadaTemplate(data: EmailTemplateData): EmailTemplate {
  // Obtener nombre completo: primero intentar inscripcionNombre, luego nombre + apellido, luego fallback
  const nombreCompleto = 
    data.inscripcionNombre || 
    (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : null) ||
    data.nombre || 
    'Estimado/a participante'
  const convencionTitulo = data.convencionTitulo || 'Convención'
  const ubicacion = data.ubicacion || 'Por confirmar'
  const fechaInicio = data.fechaInicio
    ? new Date(String(data.fechaInicio)).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Por confirmar'
  const fechaInicioObj = data.fechaInicio ? new Date(String(data.fechaInicio)) : null
  const fechaFin = data.fechaFin
    ? new Date(String(data.fechaFin)).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">🎉 ¡Inscripción Confirmada!</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      Hola <strong>${nombreCompleto}</strong>,<br><br>
      ¡<strong style="color: #f59e0b;">Felicidades</strong>! Tu inscripción ha sido <strong style="color: #f59e0b;">confirmada exitosamente</strong>. 
      Estamos emocionados de tenerte con nosotros en esta convención.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 12px; border: 2px solid #f59e0b; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 50px; height: 50px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 24px;">🎉</span>
        </div>
        <div>
          <h3 style="margin: 0; color: #92400e; font-size: 18px; font-weight: 700;">Información del Evento</h3>
          <p style="margin: 5px 0 0; color: #b45309; font-size: 14px;">Tu lugar está asegurado</p>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Convención:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${convencionTitulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Fecha de Inicio:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${fechaInicio}</td>
          </tr>
          ${fechaFin ? `<tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Fecha de Finalización:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${fechaFin}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><strong>Ubicación:</strong></td>
            <td style="padding: 8px 0; color: #4b5563; font-size: 14px; text-align: right;">${ubicacion}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 15px; color: #065f46; font-size: 16px; font-weight: 700;">📅 ¿Qué sigue?</h3>
      <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
        <li>Te enviaremos más información sobre el evento próximamente</li>
        <li>Revisa tu correo para actualizaciones importantes</li>
        <li>Prepara todo lo necesario para el evento</li>
        <li>¡Nos vemos en la convención!</li>
      </ul>
    </div>
    
    <p style="margin: 25px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <strong>💡 Importante:</strong> Guarda este email como referencia. Si tienes alguna pregunta, no dudes en contactarnos.
    </p>
  `

  return {
    title: `🎉 Inscripción Confirmada - ${convencionTitulo}`,
    body: buildBaseTemplate('Inscripción Confirmada', body, '🎉', '#f59e0b'),
    type: 'inscripcion_confirmada',
  }
}

/**
 * Template para inscripción cancelada
 */
export function getInscripcionCanceladaTemplate(data: EmailTemplateData): EmailTemplate {
  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">❌ Inscripción Cancelada</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Tu inscripción ha sido cancelada. Si tienes alguna pregunta, por favor contáctanos.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      ${data.motivo ? `<p style="margin: 10px 0 0; color: #991b1b; font-size: 14px;"><strong>Motivo:</strong> ${data.motivo}</p>` : ''}
    </div>
  `

  return {
    title: `❌ Inscripción Cancelada - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Inscripción Cancelada', body, '❌', '#ef4444'),
    type: 'inscripcion_cancelada',
  }
}

/**
 * Template para inscripción actualizada
 */
export function getInscripcionActualizadaTemplate(data: EmailTemplateData): EmailTemplate {
  const cambios = data.cambios || {}
  const cambiosList = Object.entries(cambios)
    .map(([key, value]) => `<li style="margin: 5px 0;"><strong>${key}:</strong> ${value}</li>`)
    .join('')

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">📝 Inscripción Actualizada</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Tu inscripción ha sido actualizada con los siguientes cambios:
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      ${cambiosList ? `<ul style="margin: 10px 0 0; padding-left: 20px; color: #1f2937; font-size: 14px;">${cambiosList}</ul>` : ''}
    </div>
  `

  return {
    title: `📝 Inscripción Actualizada - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Inscripción Actualizada', body, '📝', '#3b82f6'),
    type: 'inscripcion_actualizada',
  }
}

/**
 * Mapa de templates por tipo de evento
 */
export const emailTemplates = {
  pago_validado: getPagoValidadoTemplate,
  pago_rechazado: getPagoRechazadoTemplate,
  pago_rehabilitado: getPagoRehabilitadoTemplate,
  pago_recordatorio: getPagoRecordatorioTemplate,
  inscripcion_creada: getInscripcionCreadaTemplate,
  inscripcion_confirmada: getInscripcionConfirmadaTemplate,
  inscripcion_cancelada: getInscripcionCanceladaTemplate,
  inscripcion_actualizada: getInscripcionActualizadaTemplate,
}

/**
 * Obtiene el template apropiado según el tipo de evento
 */
export function getEmailTemplate(type: NotificationType | string, data: EmailTemplateData): EmailTemplate {
  const templateFn = emailTemplates[type as keyof typeof emailTemplates]

  if (!templateFn) {
    // Template genérico si no hay uno específico
    const title = typeof data.title === 'string' ? data.title : 'Notificación'
    const bodyText = typeof data.body === 'string' ? data.body : 'Tienes una nueva notificación.'
    return {
      title,
      body: buildBaseTemplate(
        title,
        `<h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">${title}</h2>
         <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">${bodyText}</p>`,
        '📬',
        '#10b981'
      ),
      type: 'general',
    }
  }

  return templateFn(data)
}
