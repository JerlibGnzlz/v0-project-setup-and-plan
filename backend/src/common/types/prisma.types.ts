/**
 * Tipos genéricos para Prisma
 * Ayuda a mantener el tipado estricto cuando se trabaja con Prisma
 */

import { Prisma } from '@prisma/client'

/**
 * Tipo para modelos de Prisma (delegates)
 */
export type PrismaModelDelegate<T> = {
  findMany: (args?: any) => Promise<T[]>
  findUnique: (args: { where: { id: string }; include?: any }) => Promise<T | null>
  findFirst: (args?: any) => Promise<T | null>
  create: (args: { data: any; include?: any }) => Promise<T>
  update: (args: { where: { id: string }; data: any; include?: any }) => Promise<T>
  updateMany: (args: { where: any; data: any }) => Promise<{ count: number }>
  delete: (args: { where: { id: string } }) => Promise<T>
  deleteMany: (args: { where: any }) => Promise<{ count: number }>
  count: (args?: { where?: any }) => Promise<number>
}

/**
 * Tipo para opciones de where de Prisma
 * Usa unknown ya que los tipos específicos de Prisma varían por modelo
 */
export type PrismaWhereInput = unknown

/**
 * Tipo para opciones de orderBy de Prisma
 * Usa unknown ya que los tipos específicos de Prisma varían por modelo
 */
export type PrismaOrderByInput = unknown

/**
 * Tipo para opciones de include de Prisma
 * Usa unknown ya que los tipos específicos de Prisma varían por modelo
 */
export type PrismaIncludeInput = unknown

