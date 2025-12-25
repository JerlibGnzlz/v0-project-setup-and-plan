/**
 * Declaración de tipos para el módulo streamifier
 * Este módulo convierte un buffer en un stream legible
 */
declare module 'streamifier' {
  import { Readable } from 'stream'

  /**
   * Crea un stream legible desde un buffer
   * @param buffer - El buffer a convertir en stream
   * @returns Un stream legible
   */
  export function createReadStream(buffer: Buffer): Readable
}





















