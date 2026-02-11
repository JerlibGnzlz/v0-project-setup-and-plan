/**
 * Script para comprobar fechaInicio de la convención activa en la BD.
 * Verifica que el día guardado sea el correcto para la cuenta regresiva.
 * Uso: npm run check:convencion-activa
 */
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** Día en YYYY-MM-DD usando componentes UTC (igual que el controller para la API). */
function toDateOnlyUTC(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function main() {
  const convencion = await prisma.convencion.findFirst({
    where: { activa: true },
    orderBy: { fechaInicio: 'desc' },
    select: {
      id: true,
      titulo: true,
      fechaInicio: true,
      fechaFin: true,
      activa: true,
    },
  })

  if (!convencion) {
    console.log('📭 No hay convención activa en la BD.')
    return
  }

  const inicio = convencion.fechaInicio
  const iso = inicio.toISOString()
  const dateOnly = toDateOnlyUTC(inicio)
  const utcY = inicio.getUTCFullYear()
  const utcM = inicio.getUTCMonth()
  const utcD = inicio.getUTCDate()

  console.log('--- Convención activa en la BD ---\n')
  console.log('ID:', convencion.id)
  console.log('Título:', convencion.titulo)
  console.log('Activa:', convencion.activa)
  console.log('\n--- fecha_inicio (para la cuenta regresiva) ---')
  console.log('Valor en BD (ISO):     ', iso)
  console.log('Día UTC (YYYY-MM-DD):  ', dateOnly, '  ← esto es lo que usa la API y el countdown')
  console.log('Interpretado como:     ', `${utcD} de ${MESES[utcM]} de ${utcY}`)
  console.log('\n--- fecha_fin ---')
  console.log('Valor en BD (ISO):     ', convencion.fechaFin.toISOString())
  console.log('')

  if (utcM < 0 || utcM > 11 || utcD < 1 || utcD > 31) {
    console.log('❌ Fecha inválida en la BD (mes o día fuera de rango).')
    console.log('   Corrige desde Admin → Editar Convención → guardar de nuevo con fecha correcta.')
    return
  }

  console.log('✅ La BD tiene un día válido para la cuenta regresiva.')
  console.log('   Si en la landing ves otro día o “15 días” en vez de los correctos, recarga la página')
  console.log('   o vuelve a guardar la convención en el Admin para refrescar caché.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
