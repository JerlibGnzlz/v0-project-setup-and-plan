'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useEducacionProgramas,
  useUpdateEducacionProgramas,
} from '@/lib/hooks/use-educacion-programas'
import type { UpdateProgramaEducacionItemDto } from '@/lib/api/educacion-programas'
import { BookOpen, Save, GraduationCap, Users, Globe, RefreshCw, Mail } from 'lucide-react'
import { toast } from 'sonner'

const CLAVE_LABELS: Record<string, string> = {
  instituto_biblico: 'Instituto Bíblico',
  escuela_capellania: 'Escuela de Capellanía',
  misiones: 'Misiones',
}

const CLAVE_ICONS: Record<string, typeof GraduationCap> = {
  instituto_biblico: GraduationCap,
  escuela_capellania: Users,
  misiones: Globe,
}

export default function EducacionAmvaPage() {
  const { data, isLoading, isError, refetch } = useEducacionProgramas()
  const updateMutation = useUpdateEducacionProgramas()
  const [formProgramas, setFormProgramas] = useState<UpdateProgramaEducacionItemDto[]>([])
  const [contactEmail, setContactEmail] = useState('')
  const [contactTelefono, setContactTelefono] = useState('')
  const [isRefetching, setIsRefetching] = useState(false)

  const programas = data?.programas ?? []

  useEffect(() => {
    if (data) {
      if (data.programas.length > 0) {
        setFormProgramas(
          data.programas.map((p) => ({
            clave: p.clave,
            titulo: p.titulo,
            duracion: p.duracion,
            modalidad: p.modalidad,
            inscripcion: p.inscripcion,
            cuotaMensual: p.cuotaMensual,
            requisitos: p.requisitos,
            orden: p.orden,
          }))
        )
      }
      setContactEmail(data.contactEmail ?? '')
      setContactTelefono(data.contactTelefono ?? '')
    }
  }, [data])

  const handleChange = (
    index: number,
    field: keyof UpdateProgramaEducacionItemDto,
    value: string | number
  ) => {
    setFormProgramas((prev) => {
      const next = [...prev]
      if (next[index]) next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hasProgramas = formProgramas.length > 0
    const hasContact = contactEmail.trim() !== '' || contactTelefono.trim() !== ''
    if (!hasProgramas && !hasContact) {
      toast.error('No hay programas ni datos de contacto para guardar')
      return
    }
    updateMutation.mutate({
      programas: formProgramas,
      contactEmail: contactEmail.trim() || undefined,
      contactTelefono: contactTelefono.trim() || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Educación AMVA Digital</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona duración, requisitos, modalidad, inscripción y cuota mensual de los tres
          programas, y el correo y teléfono de contacto que se muestran en la sección Educación
          de la landing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Información e Inscripciones
            </CardTitle>
            <CardDescription>
              Correo y teléfono que aparecen en la landing (copiables por el usuario). Se muestran
              en el bloque de contacto de la sección Educación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Correo de contacto</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="educacion@vidaabundante.org"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono de contacto</Label>
              <Input
                type="tel"
                value={contactTelefono}
                onChange={(e) => setContactTelefono(e.target.value)}
                placeholder="+54 11 xxxx-xxxx"
              />
            </div>
          </CardContent>
        </Card>
        {formProgramas.map((prog, index) => {
          const Icon = CLAVE_ICONS[prog.clave] ?? BookOpen
          const label = CLAVE_LABELS[prog.clave] ?? prog.clave
          return (
            <Card key={prog.clave}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {label}
                </CardTitle>
                <CardDescription>
                  Campos editables para la tarjeta en la landing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={prog.titulo ?? ''}
                    onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                    placeholder="Ej. Instituto Bíblico"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Input
                    value={prog.duracion ?? ''}
                    onChange={(e) => handleChange(index, 'duracion', e.target.value)}
                    placeholder="Ej. 2 años."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <Textarea
                    value={prog.modalidad ?? ''}
                    onChange={(e) => handleChange(index, 'modalidad', e.target.value)}
                    rows={2}
                    placeholder="Ej. Clases virtuales en vivo vía Google Meet..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Inscripción</Label>
                    <Input
                      value={prog.inscripcion ?? ''}
                      onChange={(e) => handleChange(index, 'inscripcion', e.target.value)}
                      placeholder="Ej. $25.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cuota mensual</Label>
                    <Input
                      value={prog.cuotaMensual ?? ''}
                      onChange={(e) => handleChange(index, 'cuotaMensual', e.target.value)}
                      placeholder="Ej. $35.000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Requisitos</Label>
                  <Textarea
                    value={prog.requisitos ?? ''}
                    onChange={(e) => handleChange(index, 'requisitos', e.target.value)}
                    rows={2}
                    placeholder="Ej. Internet, dispositivo electrónico y compromiso..."
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}

        {formProgramas.length === 0 && !isLoading && data && (
          <Card>
            <CardContent className="py-8 px-6 text-center space-y-4">
              <p className="text-muted-foreground">
                No hay programas cargados. Los logos en la landing son fijos; desde aquí solo se
                editan título, modalidad, inscripción y cuota mensual.
              </p>
              <p className="text-sm text-muted-foreground">
                Si ya ejecutaste la migración de base de datos (
                <code className="bg-muted px-1 rounded">programas_educacion</code>), haz clic en
                &quot;Cargar programas&quot; para crear los tres por defecto (Instituto Bíblico,
                Escuela de Capellanía, Misiones).
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  setIsRefetching(true)
                  try {
                    await refetch()
                    toast.success('Datos cargados. Si la tabla estaba vacía, se crearon los 3 programas.')
                  } catch {
                    toast.error(
                      'No se pudieron cargar los programas. ¿Ejecutaste la migración? (prisma migrate deploy)'
                    )
                  } finally {
                    setIsRefetching(false)
                  }
                }}
                disabled={isRefetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Cargar programas
              </Button>
              {isError && (
                <p className="text-sm text-destructive">
                  Error al conectar con el backend. Revisa que el backend esté en marcha y que la
                  tabla programas_educacion exista.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {(formProgramas.length > 0 || contactEmail || contactTelefono) && (
          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending} className="min-w-[140px]">
              {updateMutation.isPending ? (
                <>Guardando...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
