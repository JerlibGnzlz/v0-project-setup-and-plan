import { Logger } from '@nestjs/common'

/**
 * Utilidad para exportar datos a CSV
 */
export class CsvExportUtil {
  private static readonly logger = new Logger(CsvExportUtil.name)

  /**
   * Convierte un array de objetos a formato CSV
   */
  static toCSV<T extends Record<string, unknown>>(
    data: T[],
    headers?: { key: keyof T; label: string }[],
    options?: {
      delimiter?: string
      includeHeaders?: boolean
    }
  ): string {
    if (!data || data.length === 0) {
      return ''
    }

    const delimiter = options?.delimiter || ','
    const includeHeaders = options?.includeHeaders !== false

    // Si no se proporcionan headers, generarlos desde las claves del primer objeto
    const csvHeaders =
      headers ||
      Object.keys(data[0] || {}).map(key => ({
        key: key as keyof T,
        label: String(key),
      }))

    const rows: string[] = []

    // Agregar headers
    if (includeHeaders) {
      const headerRow = csvHeaders.map(h => this.escapeCSVValue(h.label)).join(delimiter)
      rows.push(headerRow)
    }

    // Agregar datos
    for (const item of data) {
      const row = csvHeaders
        .map(header => {
          const value = item[header.key]
          return this.escapeCSVValue(this.formatValue(value))
        })
        .join(delimiter)
      rows.push(row)
    }

    return rows.join('\n')
  }

  /**
   * Escapa valores para CSV
   */
  private static escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)

    // Si contiene comillas, comas o saltos de línea, envolver en comillas y escapar comillas internas
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  /**
   * Formatea valores para CSV
   */
  private static formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }

    // Si es una fecha
    if (value instanceof Date) {
      return value.toISOString()
    }

    // Si es un objeto, convertirlo a JSON
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  /**
   * Genera nombre de archivo con timestamp
   */
  static generateFileName(prefix: string, extension: string = 'csv'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `${prefix}_${timestamp}.${extension}`
  }
}
