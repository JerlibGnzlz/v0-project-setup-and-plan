/**
 * Templates centralizados para emails
 * Cada template retorna un objeto con title y body (HTML)
 */

export interface EmailTemplateData {
  [key: string]: any
}

export interface EmailTemplate {
  title: string
  body: string
  type: string
}

/**
 * Template base para emails
 */
function buildBaseTemplate(title: string, body: string, icon: string = '📬', color: string = '#10b981'): string {
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
  const monto = typeof data.monto === 'number' ? data.monto : parseFloat(data.monto || 0)
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">✅ Pago Validado</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Tu pago ha sido validado exitosamente. Gracias por tu contribución.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Monto:</strong> ${montoFormateado}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Cuota:</strong> ${data.numeroCuota || 'N/A'} de ${data.cuotasTotales || 'N/A'}</p>
      ${data.metodoPago ? `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Método de pago:</strong> ${data.metodoPago}</p>` : ''}
      <p style="margin: 10px 0 0; color: #059669; font-size: 14px; font-weight: 600;">Progreso: ${data.cuotasPagadas || 0} de ${data.cuotasTotales || 0} cuotas pagadas</p>
    </div>
  `

  return {
    title: `✅ Pago Validado - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Pago Validado', body, '✅', '#10b981'),
    type: 'pago_validado',
  }
}

/**
 * Template para pago rechazado
 */
export function getPagoRechazadoTemplate(data: EmailTemplateData): EmailTemplate {
  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">❌ Pago Rechazado</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Lamentamos informarte que tu pago ha sido rechazado. Por favor, revisa los detalles y vuelve a intentar.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      ${data.motivo ? `<p style="margin: 10px 0; color: #991b1b; font-size: 14px;"><strong>Motivo del rechazo:</strong> ${data.motivo}</p>` : ''}
    </div>
    <p style="margin: 20px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
      Puedes volver a subir tu comprobante de pago desde la aplicación o el sitio web.
    </p>
  `

  return {
    title: `❌ Pago Rechazado - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Pago Rechazado', body, '❌', '#ef4444'),
    type: 'pago_rechazado',
  }
}

/**
 * Template para pago rehabilitado
 */
export function getPagoRehabilitadoTemplate(data: EmailTemplateData): EmailTemplate {
  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">🔄 Pago Rehabilitado</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Tu pago ha sido rehabilitado. Puedes volver a subir tu comprobante de pago.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      <p style="margin: 10px 0 0; color: #92400e; font-size: 14px;">Por favor, sube nuevamente tu comprobante de pago para continuar con el proceso.</p>
    </div>
  `

  return {
    title: `🔄 Pago Rehabilitado - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Pago Rehabilitado', body, '🔄', '#f59e0b'),
    type: 'pago_rehabilitado',
  }
}

/**
 * Template para recordatorio de pago
 */
export function getPagoRecordatorioTemplate(data: EmailTemplateData): EmailTemplate {
  const montoPendiente = typeof data.montoPendiente === 'number' ? data.montoPendiente : parseFloat(data.montoPendiente || 0)
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(montoPendiente)

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">⏰ Recordatorio de Pago</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Te recordamos que tienes pagos pendientes para tu inscripción.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Cuotas pendientes:</strong> ${data.cuotasPendientes || 0}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Monto pendiente:</strong> ${montoFormateado}</p>
      ${data.fechaLimite ? `<p style="margin: 10px 0 0; color: #1e40af; font-size: 14px;"><strong>Fecha límite:</strong> ${new Date(data.fechaLimite).toLocaleDateString('es-AR')}</p>` : ''}
    </div>
    <p style="margin: 20px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
      Por favor, realiza el pago correspondiente para completar tu inscripción.
    </p>
  `

  return {
    title: `⏰ Recordatorio de Pago - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Recordatorio de Pago', body, '⏰', '#3b82f6'),
    type: 'pago_recordatorio',
  }
}

/**
 * Template para inscripción creada
 */
export function getInscripcionCreadaTemplate(data: EmailTemplateData): EmailTemplate {
  const montoTotal = typeof data.montoTotal === 'number' ? data.montoTotal : parseFloat(data.montoTotal || 0)
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(montoTotal)

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">📝 Inscripción Recibida</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Tu inscripción ha sido recibida exitosamente. Te notificaremos cuando sea confirmada.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Monto total:</strong> ${montoFormateado}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Número de cuotas:</strong> ${data.numeroCuotas || 'N/A'}</p>
      <p style="margin: 10px 0 0; color: #1e40af; font-size: 14px;">Origen: ${data.origenRegistro || 'web'}</p>
    </div>
  `

  return {
    title: `📝 Inscripción Recibida - ${data.convencionTitulo || 'Convención'}`,
    body: buildBaseTemplate('Inscripción Recibida', body, '📝', '#3b82f6'),
    type: 'inscripcion_creada',
  }
}

/**
 * Template para inscripción confirmada
 */
export function getInscripcionConfirmadaTemplate(data: EmailTemplateData): EmailTemplate {
  const fechaInicio = data.fechaInicio ? new Date(data.fechaInicio).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const body = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">🎉 Inscripción Confirmada</h2>
    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      ¡Felicidades! Tu inscripción ha sido confirmada. Te esperamos en la convención.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo || 'N/A'}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Fecha de inicio:</strong> ${fechaInicio}</p>
      <p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Ubicación:</strong> ${data.ubicacion || 'N/A'}</p>
    </div>
    <p style="margin: 20px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
      Te enviaremos más información próximamente. ¡Nos vemos pronto!
    </p>
  `

  return {
    title: `🎉 Inscripción Confirmada - ${data.convencionTitulo || 'Convención'}`,
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
export function getEmailTemplate(type: string, data: EmailTemplateData): EmailTemplate {
  const templateFn = emailTemplates[type as keyof typeof emailTemplates]
  
  if (!templateFn) {
    // Template genérico si no hay uno específico
    return {
      title: data.title || 'Notificación',
      body: buildBaseTemplate(
        data.title || 'Notificación',
        `<h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">${data.title || 'Notificación'}</h2>
         <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">${data.body || 'Tienes una nueva notificación.'}</p>`,
        '📬',
        '#10b981'
      ),
      type: 'general',
    }
  }

  return templateFn(data)
}

