import {
  Controller,
  Get,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common'
import { PastorOrInvitadoJwtAuthGuard } from '../auth/guards/pastor-or-invitado-jwt-auth.guard'
import {
  AuthenticatedPastorRequest,
  AuthenticatedInvitadoRequest,
} from '../auth/types/request.types'
import { PrismaService } from '../../prisma/prisma.service'
import { CredencialesMinisterialesService } from '../credenciales-ministeriales/credenciales-ministeriales.service'
import { CredencialesCapellaniaService } from '../credenciales-capellania/credenciales-capellania.service'

interface CredencialUnificada {
  id: string
  tipo: 'pastoral' | 'ministerial' | 'capellania'
  numero?: string
  documento?: string
  nombre: string
  apellido: string
  fechaEmision?: Date
  fechaVencimiento: Date
  estado: 'vigente' | 'por_vencer' | 'vencida' | 'sin_credencial'
  diasRestantes: number
  fotoUrl?: string | null
  activa: boolean
}

@Controller('credenciales')
export class CredencialesController {
  private readonly logger = new Logger(CredencialesController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly credencialesMinisterialesService: CredencialesMinisterialesService,
    private readonly credencialesCapellaniaService: CredencialesCapellaniaService
  ) {}

  /**
   * Calcula el estado de una credencial basado en la fecha de vencimiento
   */
  private calcularEstado(fechaVencimiento: Date): {
    estado: 'vigente' | 'por_vencer' | 'vencida'
    diasRestantes: number
  } {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const vencimiento = new Date(fechaVencimiento)
    vencimiento.setHours(0, 0, 0, 0)
    const diasRestantes = Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasRestantes < 0) {
      return { estado: 'vencida', diasRestantes: Math.abs(diasRestantes) }
    } else if (diasRestantes <= 30) {
      return { estado: 'por_vencer', diasRestantes }
    } else {
      return { estado: 'vigente', diasRestantes }
    }
  }

  /**
   * Endpoint unificado para obtener todas las credenciales del usuario autenticado
   * Funciona tanto para pastores como para invitados
   * Retorna credenciales pastorales si es pastor, o credenciales ministeriales/capellanía si es invitado
   */
  @Get('mis-credenciales')
  @UseGuards(PastorOrInvitadoJwtAuthGuard)
  async obtenerMisCredenciales(
    @Request() req: AuthenticatedPastorRequest | AuthenticatedInvitadoRequest
  ) {
    try {
      const credenciales: CredencialUnificada[] = []

      // Detectar tipo de usuario desde el request
      const isPastor = 'tipo' in req.user && req.user.tipo !== undefined
      const isInvitado = !isPastor && 'email' in req.user

      if (isPastor) {
        // Usuario es Pastor - traer CredencialPastoral
        const pastorId = req.user.id
        this.logger.log(`Obteniendo credenciales pastorales para pastor: ${pastorId}`)

        const credencialesPastorales = await this.prisma.credencialPastoral.findMany({
          where: {
            pastorId,
            activa: true,
          },
          orderBy: {
            fechaVencimiento: 'desc',
          },
        })

        if (credencialesPastorales.length === 0) {
          this.logger.log(`No se encontraron credenciales pastorales para pastor ${pastorId}`)
          return {
            tieneCredenciales: false,
            credenciales: [],
            mensaje: 'No tienes credenciales pastorales registradas',
          }
        }

        // Obtener información del pastor para nombre y apellido
        const pastor = await this.prisma.pastor.findUnique({
          where: { id: pastorId },
          select: {
            nombre: true,
            apellido: true,
          },
        })

        for (const credencial of credencialesPastorales) {
          const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)

          credenciales.push({
            id: credencial.id,
            tipo: 'pastoral',
            numero: credencial.numeroCredencial,
            nombre: pastor?.nombre || '',
            apellido: pastor?.apellido || '',
            fechaEmision: credencial.fechaEmision,
            fechaVencimiento: credencial.fechaVencimiento,
            estado,
            diasRestantes,
            activa: credencial.activa,
          })
        }
      } else if (isInvitado) {
        // Usuario es Invitado - traer CredencialMinisterial y CredencialCapellania
        const invitadoId = req.user.id
        this.logger.log(`Obteniendo credenciales para invitado: ${invitadoId}`)

        // PRIMERO: Buscar credenciales directamente relacionadas con el invitado (por invitadoId)
        const credencialesDirectasMinisteriales = await this.prisma.credencialMinisterial.findMany({
          where: {
            invitadoId,
            activa: true,
          },
        })

        const credencialesDirectasCapellania = await this.prisma.credencialCapellania.findMany({
          where: {
            invitadoId,
            activa: true,
          },
        })

        // Agregar credenciales directas a la lista
        for (const credencial of credencialesDirectasMinisteriales) {
          const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)
          credenciales.push({
            id: credencial.id,
            tipo: 'ministerial',
            documento: credencial.documento,
            nombre: credencial.nombre,
            apellido: credencial.apellido,
            fechaVencimiento: credencial.fechaVencimiento,
            estado,
            diasRestantes,
            fotoUrl: credencial.fotoUrl,
            activa: credencial.activa,
          })
        }

        for (const credencial of credencialesDirectasCapellania) {
          const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)
          credenciales.push({
            id: credencial.id,
            tipo: 'capellania',
            documento: credencial.documento,
            nombre: credencial.nombre,
            apellido: credencial.apellido,
            fechaVencimiento: credencial.fechaVencimiento,
            estado,
            diasRestantes,
            fotoUrl: credencial.fotoUrl,
            activa: credencial.activa,
          })
        }

        // SEGUNDO: Buscar credenciales por DNI de inscripciones (para compatibilidad con datos antiguos)
        const inscripciones = await this.prisma.inscripcion.findMany({
          where: {
            invitadoId,
            dni: { not: null },
          },
          select: {
            dni: true,
          },
        })

        // Obtener DNIs únicos de las inscripciones
        const dniUnicos = Array.from(
          new Set(
            inscripciones
              .map((i) => i.dni)
              .filter((dni): dni is string => dni !== null && dni !== undefined && dni.trim() !== '')
          )
        )

        this.logger.log(`DNIs únicos encontrados en inscripciones: ${dniUnicos.length} - ${dniUnicos.join(', ')}`)

        // Buscar credenciales ministeriales
        for (const dni of dniUnicos) {
          try {
            const dniNormalizado = dni.trim().replace(/[\s-]/g, '').toUpperCase()
            const credencialMinisterial = await this.credencialesMinisterialesService.obtenerEstadoPorDocumento(dniNormalizado)

            if (credencialMinisterial) {
              // El servicio ya calcula el estado, usar el que viene
              credenciales.push({
                id: credencialMinisterial.id,
                tipo: 'ministerial',
                documento: credencialMinisterial.documento,
                nombre: credencialMinisterial.nombre,
                apellido: credencialMinisterial.apellido,
                fechaVencimiento: credencialMinisterial.fechaVencimiento,
                estado: credencialMinisterial.estado,
                diasRestantes: credencialMinisterial.diasRestantes,
                fotoUrl: credencialMinisterial.fotoUrl,
                activa: credencialMinisterial.activa,
              })
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error buscando credencial ministerial para DNI ${dni}: ${errorMessage}`)
          }
        }

        // Buscar credenciales de capellanía
        for (const dni of dniUnicos) {
          try {
            const dniNormalizado = dni.trim().replace(/[\s-]/g, '').toUpperCase()
            const credencialCapellania = await this.credencialesCapellaniaService.obtenerEstadoPorDocumento(dniNormalizado)

            if (credencialCapellania) {
              // El servicio ya calcula el estado, usar el que viene
              credenciales.push({
                id: credencialCapellania.id,
                tipo: 'capellania',
                documento: credencialCapellania.documento,
                nombre: credencialCapellania.nombre,
                apellido: credencialCapellania.apellido,
                fechaVencimiento: credencialCapellania.fechaVencimiento,
                estado: credencialCapellania.estado,
                diasRestantes: credencialCapellania.diasRestantes,
                fotoUrl: credencialCapellania.fotoUrl,
                activa: credencialCapellania.activa,
              })
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error buscando credencial de capellanía para DNI ${dni}: ${errorMessage}`)
          }
        }
      }

      if (credenciales.length === 0) {
        this.logger.warn(`No se encontraron credenciales para el usuario`)
        return {
          tieneCredenciales: false,
          credenciales: [],
          mensaje: isPastor
            ? 'No tienes credenciales pastorales registradas'
            : 'No se encontraron credenciales para tu DNI. Verifica que tus credenciales estén registradas en el sistema.',
        }
      }

      // Ordenar credenciales por fecha de vencimiento (más recientes primero)
      credenciales.sort((a, b) => {
        return b.fechaVencimiento.getTime() - a.fechaVencimiento.getTime()
      })

      this.logger.log(`✅ Total credenciales encontradas: ${credenciales.length}`)

      return {
        tieneCredenciales: true,
        credenciales,
        resumen: {
          total: credenciales.length,
          vigentes: credenciales.filter((c) => c.estado === 'vigente').length,
          porVencer: credenciales.filter((c) => c.estado === 'por_vencer').length,
          vencidas: credenciales.filter((c) => c.estado === 'vencida').length,
        },
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en obtenerMisCredenciales: ${errorMessage}`)
      if (error instanceof Error) {
        this.logger.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }
}

