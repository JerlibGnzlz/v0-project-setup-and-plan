/**
 * Escapa caracteres HTML para prevenir XSS al insertar datos en HTML.
 * Usar cuando se construye HTML con template literals y datos de usuario.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str == null || str === '') return ''
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return String(str).replace(/[&<>"']/g, (m) => map[m] ?? m)
}
