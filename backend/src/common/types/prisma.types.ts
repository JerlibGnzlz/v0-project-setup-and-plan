/**
 * Tipos genéricos para Prisma
 * Ayuda a mantener el tipado estricto cuando se trabaja con Prisma
 */

/**
 * Tipo para modelos de Prisma (delegates)
 * Usa tipos genéricos para mantener type safety mientras permitimos flexibilidad
 */
export type PrismaModelDelegate<T> = {
  findMany: (args?: {
    where?: PrismaWhereInput
    orderBy?: PrismaOrderByInput
    include?: PrismaIncludeInput
    skip?: number
    take?: number
  }) => Promise<T[]>
  findUnique: (args: {
    where: { id: string }
    include?: PrismaIncludeInput
  }) => Promise<T | null>
  findFirst: (args?: {
    where?: PrismaWhereInput
    orderBy?: PrismaOrderByInput
    include?: PrismaIncludeInput
  }) => Promise<T | null>
  create: (args: {
    data: unknown
    include?: PrismaIncludeInput
  }) => Promise<T>
  update: (args: {
    where: { id: string }
    data: unknown
    include?: PrismaIncludeInput
  }) => Promise<T>
  updateMany: (args: {
    where?: PrismaWhereInput
    data: unknown
  }) => Promise<{ count: number }>
  delete: (args: { where: { id: string } }) => Promise<T>
  deleteMany: (args?: { where?: PrismaWhereInput }) => Promise<{ count: number }>
  count: (args?: { where?: PrismaWhereInput }) => Promise<number>
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

