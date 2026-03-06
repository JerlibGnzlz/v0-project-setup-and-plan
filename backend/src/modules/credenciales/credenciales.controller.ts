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
import { DataSyncGateway } from '../data-sync/data-sync.gateway'

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
  tipoPastor?: string
  tipoCapellan?: string
}

@Controller('credenciales')
export class CredencialesController {
  private readonly logger = new Logger(CredencialesController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly credencialesMinisterialesService: CredencialesMinisterialesService,
    private readonly credencialesCapellaniaService: CredencialesCapellaniaService,
    private readonly dataSyncGateway: DataSyncGateway
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
   * Endpoint unificado para obtener todas las credenciales del usuario autenticado.
   * Funciona tanto para pastores como para invitados.
   *
   * Flujo principal (invitados): credencial solicitada desde la app → admin crea la credencial con invitadoId → se devuelve aquí por invitadoId.
   * Flujos complementarios: búsqueda por email o por DNI para credenciales creadas en AMVA Digital sin solicitud desde la app.
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

        // Obtener información del pastor para nombre, apellido y foto
        const pastor = await this.prisma.pastor.findUnique({
          where: { id: pastorId },
          select: {
            nombre: true,
            apellido: true,
            fotoUrl: true,
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
            fotoUrl: pastor?.fotoUrl || null,
            activa: credencial.activa,
          })
        }
      } else if (isInvitado) {
        // Usuario es Invitado - traer CredencialMinisterial y CredencialCapellania
        // Flujo A: Credencial creada en AMVA Digital → si la persona hace login en la app con el MISMO correo, se muestra aquí (match por email).
        // Flujo B: Credencial solicitada desde la app móvil → se crea con invitadoId/email → ya vinculada, se muestra aquí.
        // El emparejamiento en la app es POR EMAIL (mismo correo), no por DNI.
        const invitadoId = req.user.id
        const emailDesdeReq = (req.user as { email?: string }).email?.trim() || undefined
        this.logger.log(
          `Obteniendo credenciales para invitado: id=${invitadoId}, email en req.user=${emailDesdeReq ?? '(no llega)'}`
        )

        // Siempre cargar email desde DB para la búsqueda por correo (así se vincula aunque req.user no traiga email)
        const invitadoDesdeDb = await this.prisma.invitado.findUnique({
          where: { id: invitadoId },
          select: { email: true },
        })
        const invitadoEmail: string | undefined =
          (invitadoDesdeDb?.email?.trim() || emailDesdeReq) || undefined
        if (invitadoEmail) {
          this.logger.log(`📧 Email para búsqueda por correo: ${invitadoEmail}`)
        } else {
          this.logger.warn(
            `⚠️ Invitado ${invitadoId} sin email en DB; no se puede vincular credencial por correo`
          )
        }

        // PRIMERO: Flujo principal — credenciales solicitadas desde la app y creadas por admin (ya vinculadas por invitadoId)
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

        // Agregar credenciales directas y hacer backfill de email si falta (para que luego matchee por email)
        for (const credencial of credencialesDirectasMinisteriales) {
          if (!credencial.email && invitadoEmail) {
            try {
              await this.prisma.credencialMinisterial.update({
                where: { id: credencial.id },
                data: { email: invitadoEmail.trim() },
              })
              this.logger.log(`Backfill email en credencial ministerial ${credencial.id} para invitado ${invitadoId}`)
            } catch (err: unknown) {
              this.logger.warn(
                `No se pudo backfill email en credencial ministerial ${credencial.id}: ${err instanceof Error ? err.message : String(err)}`
              )
            }
          }
          const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)
          credenciales.push({
            id: credencial.id,
            tipo: 'ministerial',
            documento: credencial.documento,
            nombre: credencial.nombre,
            apellido: credencial.apellido,
            fechaEmision: credencial.createdAt,
            fechaVencimiento: credencial.fechaVencimiento,
            estado,
            diasRestantes,
            fotoUrl: credencial.fotoUrl,
            activa: credencial.activa,
            tipoPastor: (credencial.tipoPastor?.trim() || 'PASTOR'),
          })
        }

        for (const credencial of credencialesDirectasCapellania) {
          if (!credencial.email && invitadoEmail) {
            try {
              await this.prisma.credencialCapellania.update({
                where: { id: credencial.id },
                data: { email: invitadoEmail.trim() },
              })
              this.logger.log(`Backfill email en credencial capellanía ${credencial.id} para invitado ${invitadoId}`)
            } catch (err: unknown) {
              this.logger.warn(
                `No se pudo backfill email en credencial capellanía ${credencial.id}: ${err instanceof Error ? err.message : String(err)}`
              )
            }
          }
          const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)
          credenciales.push({
            id: credencial.id,
            tipo: 'capellania',
            documento: credencial.documento,
            nombre: credencial.nombre,
            apellido: credencial.apellido,
            fechaEmision: credencial.createdAt,
            fechaVencimiento: credencial.fechaVencimiento,
            estado,
            diasRestantes,
            fotoUrl: credencial.fotoUrl,
            activa: credencial.activa,
            tipoCapellan: credencial.tipoCapellan ?? undefined,
          })
        }

        // SEGUNDO: Flujo complementario — credenciales creadas en AMVA Digital sin solicitud app: búsqueda por EMAIL
        if (invitadoEmail && typeof invitadoEmail === 'string') {
          const emailNorm = invitadoEmail.trim().toLowerCase()
          this.logger.log(
            `📧 Buscando credenciales por email (case-insensitive, con trim): ${emailNorm} (invitadoId: ${invitadoId})`
          )
          const idsYaAgregados = new Set(credenciales.map((c) => c.id))

          // Búsqueda: traer credenciales activas con email no vacío y comparar en código (trim + lowercase) por si hay espacios o mayúsculas en BD
          const todasConEmailMinisteriales = await this.prisma.credencialMinisterial.findMany({
            where: { activa: true, email: { not: null } },
          })
          const porEmailMinisteriales = todasConEmailMinisteriales.filter(
            (c) => (c.email?.trim() ?? '').toLowerCase() === emailNorm
          )
          if (porEmailMinisteriales.length === 0 && todasConEmailMinisteriales.length > 0) {
            const muestras = todasConEmailMinisteriales.slice(0, 3).map((c) => `"${c.email ?? ''}"`).join(', ')
            this.logger.debug(
              `Emails en BD (muestra): ${muestras}. Buscando: "${emailNorm}"`
            )
          }
          let totalMatchEmail = porEmailMinisteriales.length
          for (const cred of porEmailMinisteriales) {
            if (idsYaAgregados.has(cred.id)) continue
            const { estado, diasRestantes } = this.calcularEstado(cred.fechaVencimiento)
            credenciales.push({
              id: cred.id,
              tipo: 'ministerial',
              documento: cred.documento,
              nombre: cred.nombre,
              apellido: cred.apellido,
              fechaEmision: cred.createdAt,
              fechaVencimiento: cred.fechaVencimiento,
              estado,
              diasRestantes,
              fotoUrl: cred.fotoUrl,
              activa: cred.activa,
              tipoPastor: (cred.tipoPastor?.trim() || 'PASTOR'),
            })
            idsYaAgregados.add(cred.id)
            if (!cred.invitadoId) {
              try {
                await this.prisma.credencialMinisterial.update({
                  where: { id: cred.id },
                  data: { invitadoId },
                })
                this.logger.log(`Credencial ministerial ${cred.id} vinculada a invitado ${invitadoId} por email`)
              } catch (err: unknown) {
                this.logger.warn(`No se pudo vincular credencial ministerial ${cred.id}: ${err instanceof Error ? err.message : String(err)}`)
              }
            }
          }

          const todasConEmailCapellania = await this.prisma.credencialCapellania.findMany({
            where: { activa: true, email: { not: null } },
          })
          const porEmailCapellania = todasConEmailCapellania.filter(
            (c) => (c.email?.trim() ?? '').toLowerCase() === emailNorm
          )
          totalMatchEmail += porEmailCapellania.length
          for (const cred of porEmailCapellania) {
            if (idsYaAgregados.has(cred.id)) continue
            const { estado, diasRestantes } = this.calcularEstado(cred.fechaVencimiento)
            credenciales.push({
              id: cred.id,
              tipo: 'capellania',
              documento: cred.documento,
              nombre: cred.nombre,
              apellido: cred.apellido,
              fechaEmision: cred.createdAt,
              fechaVencimiento: cred.fechaVencimiento,
              estado,
              diasRestantes,
              fotoUrl: cred.fotoUrl,
              activa: cred.activa,
              tipoCapellan: cred.tipoCapellan ?? undefined,
            })
            idsYaAgregados.add(cred.id)
            if (!cred.invitadoId) {
              try {
                await this.prisma.credencialCapellania.update({
                  where: { id: cred.id },
                  data: { invitadoId },
                })
                this.logger.log(`Credencial capellanía ${cred.id} vinculada a invitado ${invitadoId} por email`)
              } catch (err: unknown) {
                this.logger.warn(`No se pudo vincular credencial capellanía ${cred.id}: ${err instanceof Error ? err.message : String(err)}`)
              }
            }
          }
          this.logger.log(
            `📧 Búsqueda por email "${emailNorm}": ${totalMatchEmail} credencial(es) encontrada(s)`
          )
          if (totalMatchEmail === 0 && credenciales.length === 0) {
            this.logger.warn(
              `⚠️ No se encontró ninguna credencial con email "${emailNorm}". Verifica en AMVA Digital que la credencial tenga ese email guardado (campo "Email para app móvil") y que hayas hecho clic en Actualizar.`
            )
          }
        }

        // TERCERO: Buscar credenciales por DNI de inscripciones (por invitadoId y también por email por si la inscripción no está vinculada)
        const inscripcionesPorInvitado = await this.prisma.inscripcion.findMany({
          where: {
            invitadoId,
            dni: { not: null },
          },
          select: { dni: true },
        })
        const inscripcionesPorEmail =
          invitadoEmail && typeof invitadoEmail === 'string'
            ? await this.prisma.inscripcion.findMany({
                where: {
                  email: { equals: invitadoEmail.trim(), mode: 'insensitive' },
                  dni: { not: null },
                },
                select: { dni: true },
              })
            : []

        const dniUnicos = Array.from(
          new Set(
            [...inscripcionesPorInvitado, ...inscripcionesPorEmail]
              .map((i) => i.dni)
              .filter((dni): dni is string => dni !== null && dni !== undefined && dni.trim() !== '')
          )
        )

        this.logger.log(
          `DNIs únicos (inscripciones invitadoId + email): ${dniUnicos.length} - ${dniUnicos.join(', ')}`
        )

        // Buscar credenciales ministeriales por DNI
        for (const dni of dniUnicos) {
          try {
            const dniNormalizado = dni.trim().replace(/[\s-]/g, '').toUpperCase()
            const credencialMinisterial = await this.credencialesMinisterialesService.obtenerEstadoPorDocumento(dniNormalizado)

            if (credencialMinisterial) {
              // Auto-vincular credencial creada en AMVA Digital (solo DNI): al abrir Credenciales en la app se vincula al invitado
              if (!credencialMinisterial.invitadoId && invitadoEmail) {
                try {
                  await this.prisma.credencialMinisterial.update({
                    where: { id: credencialMinisterial.id },
                    data: { invitadoId, email: invitadoEmail.trim() },
                  })
                  this.logger.log(
                    `Credencial ministerial ${credencialMinisterial.id} vinculada a invitado ${invitadoId} por DNI`
                  )
                } catch (err: unknown) {
                  this.logger.warn(
                    `No se pudo vincular credencial ministerial por DNI: ${err instanceof Error ? err.message : String(err)}`
                  )
                }
              }
              // El servicio ya calcula el estado, usar el que viene
              credenciales.push({
                id: credencialMinisterial.id,
                tipo: 'ministerial',
                documento: credencialMinisterial.documento,
                nombre: credencialMinisterial.nombre,
                apellido: credencialMinisterial.apellido,
                fechaEmision: credencialMinisterial.createdAt,
                fechaVencimiento: credencialMinisterial.fechaVencimiento,
                estado: credencialMinisterial.estado,
                diasRestantes: credencialMinisterial.diasRestantes,
                fotoUrl: credencialMinisterial.fotoUrl,
                activa: credencialMinisterial.activa,
                tipoPastor: (credencialMinisterial.tipoPastor?.trim() || 'PASTOR'),
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
              // Auto-vincular credencial creada en AMVA Digital (solo DNI): al abrir Credenciales en la app se vincula al invitado
              if (!credencialCapellania.invitadoId && invitadoEmail) {
                try {
                  await this.prisma.credencialCapellania.update({
                    where: { id: credencialCapellania.id },
                    data: { invitadoId, email: invitadoEmail.trim() },
                  })
                  this.logger.log(
                    `Credencial capellanía ${credencialCapellania.id} vinculada a invitado ${invitadoId} por DNI`
                  )
                } catch (err: unknown) {
                  this.logger.warn(
                    `No se pudo vincular credencial capellanía por DNI: ${err instanceof Error ? err.message : String(err)}`
                  )
                }
              }
              // El servicio ya calcula el estado, usar el que viene
              credenciales.push({
                id: credencialCapellania.id,
                tipo: 'capellania',
                documento: credencialCapellania.documento,
                nombre: credencialCapellania.nombre,
                apellido: credencialCapellania.apellido,
                fechaEmision: credencialCapellania.createdAt,
                fechaVencimiento: credencialCapellania.fechaVencimiento,
                estado: credencialCapellania.estado,
                diasRestantes: credencialCapellania.diasRestantes,
                fotoUrl: credencialCapellania.fotoUrl,
                activa: credencialCapellania.activa,
                tipoCapellan: credencialCapellania.tipoCapellan ?? undefined,
              })
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error buscando credencial de capellanía para DNI ${dni}: ${errorMessage}`)
          }
        }
      }

      // Eliminar duplicados por id (p. ej. misma credencial encontrada por invitadoId y por email o DNI)
      const credencialesUnicas = Array.from(
        new Map(credenciales.map((c) => [c.id, c])).values()
      )

      if (credencialesUnicas.length === 0) {
        this.logger.warn(`No se encontraron credenciales para el usuario`)
        return {
          tieneCredenciales: false,
          credenciales: [],
          mensaje: isPastor
            ? 'No tienes credenciales pastorales registradas'
            : 'No se encontraron credenciales con tu correo. En AMVA Digital la credencial debe tener el mismo email (campo "Email para app móvil") y guardar cambios. Luego cierra sesión en la app y vuelve a entrar con ese correo.',
        }
      }

      // Ordenar credenciales por fecha de vencimiento (más recientes primero)
      credencialesUnicas.sort((a, b) => {
        return b.fechaVencimiento.getTime() - a.fechaVencimiento.getTime()
      })

      this.logger.log(`✅ Total credenciales encontradas: ${credencialesUnicas.length}`)

      return {
        tieneCredenciales: true,
        credenciales: credencialesUnicas,
        resumen: {
          total: credencialesUnicas.length,
          vigentes: credencialesUnicas.filter((c) => c.estado === 'vigente').length,
          porVencer: credencialesUnicas.filter((c) => c.estado === 'por_vencer').length,
          vencidas: credencialesUnicas.filter((c) => c.estado === 'vencida').length,
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

