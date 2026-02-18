'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfiguracionLanding, useUpdateConfiguracionLanding } from '@/lib/hooks/use-configuracion-landing'
import { Settings, Save, Users, Globe, Calendar, BookOpen, Target, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { UpdateConfiguracionLandingDto } from '@/lib/api/configuracion-landing'

export default function ConfiguracionLandingPage() {
  const { data: configuracion, isLoading } = useConfiguracionLanding()
  const updateMutation = useUpdateConfiguracionLanding()

  const JUSTIFICACION_OPTIONS = [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
    { value: 'justify', label: 'Justificado' },
  ] as const

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<UpdateConfiguracionLandingDto>({
    defaultValues: {
      pastoresFormados: 500,
      pastoresFormadosSuffix: '+',
      anosMinisterio: 15,
      anosMinisterioSuffix: '+',
      convenciones: 50,
      convencionesSuffix: '+',
      titulo: 'Quiénes Somos',
      subtitulo:
        'Una organización misionera comprometida con la formación integral de líderes pastorales para el servicio del Reino',
      subtituloJustificacion: 'left',
      misionTitulo: 'Nuestra Misión',
      misionContenido:
        'Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.',
      misionJustificacion: 'left',
      visionTitulo: 'Nuestra Visión',
      visionContenido:
        'Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.',
      visionJustificacion: 'left',
    },
  })

  // Resetear formulario cuando carga la configuración
  useEffect(() => {
    if (configuracion) {
      reset({
        pastoresFormados: configuracion.pastoresFormados,
        pastoresFormadosSuffix: configuracion.pastoresFormadosSuffix,
        anosMinisterio: configuracion.anosMinisterio,
        anosMinisterioSuffix: configuracion.anosMinisterioSuffix,
        convenciones: configuracion.convenciones,
        convencionesSuffix: configuracion.convencionesSuffix,
        paisesOverride: configuracion.paisesOverride,
        titulo: configuracion.titulo,
        subtitulo: configuracion.subtitulo,
        subtituloJustificacion: configuracion.subtituloJustificacion ?? 'left',
        misionTitulo: configuracion.misionTitulo,
        misionContenido: configuracion.misionContenido,
        misionJustificacion: configuracion.misionJustificacion ?? 'left',
        visionTitulo: configuracion.visionTitulo,
        visionContenido: configuracion.visionContenido,
        visionJustificacion: configuracion.visionJustificacion ?? 'left',
      })
    }
  }, [configuracion, reset])

  const onSubmit = (data: UpdateConfiguracionLandingDto) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Configuración de Landing Page</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona las estadísticas y contenido de la sección "Quiénes Somos"
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Estadísticas
            </CardTitle>
            <CardDescription>
              Configura los números que se muestran en las tarjetas de estadísticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pastoresFormados">Pastores Formados</Label>
                <div className="flex gap-2">
                  <Input
                    id="pastoresFormados"
                    type="number"
                    {...register('pastoresFormados', { valueAsNumber: true })}
                  />
                  <Input
                    placeholder="+"
                    className="w-20"
                    {...register('pastoresFormadosSuffix')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anosMinisterio">Años de Ministerio</Label>
                <div className="flex gap-2">
                  <Input
                    id="anosMinisterio"
                    type="number"
                    {...register('anosMinisterio', { valueAsNumber: true })}
                  />
                  <Input
                    placeholder="+"
                    className="w-20"
                    {...register('anosMinisterioSuffix')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="convenciones">Convenciones</Label>
                <div className="flex gap-2">
                  <Input
                    id="convenciones"
                    type="number"
                    {...register('convenciones', { valueAsNumber: true })}
                  />
                  <Input
                    placeholder="+"
                    className="w-20"
                    {...register('convencionesSuffix')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paisesOverride">
                  Países (Override)
                  <span className="text-xs text-muted-foreground ml-2">
                    (Opcional: deja vacío para usar conteo automático de sedes)
                  </span>
                </Label>
                <Input
                  id="paisesOverride"
                  type="number"
                  {...register('paisesOverride', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' ? null : Number(v)),
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Contenido Principal
            </CardTitle>
            <CardDescription>Título y subtítulo de la sección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" {...register('titulo')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Textarea
                id="subtitulo"
                rows={3}
                {...register('subtitulo')}
              />
            </div>

            <div className="space-y-2">
              <Label>Justificación del texto (Subtítulo)</Label>
              <Select
                value={watch('subtituloJustificacion') ?? 'left'}
                onValueChange={(value) =>
                  setValue('subtituloJustificacion', value as 'left' | 'center' | 'right' | 'justify', {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {JUSTIFICACION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Misión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Misión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="misionTitulo">Título de Misión</Label>
              <Input id="misionTitulo" {...register('misionTitulo')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="misionContenido">Contenido de Misión</Label>
              <Textarea
                id="misionContenido"
                rows={5}
                {...register('misionContenido')}
              />
            </div>

            <div className="space-y-2">
              <Label>Justificación del texto (Misión)</Label>
              <Select
                value={watch('misionJustificacion') ?? 'left'}
                onValueChange={(value) =>
                  setValue('misionJustificacion', value as 'left' | 'center' | 'right' | 'justify', {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {JUSTIFICACION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Visión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visionTitulo">Título de Visión</Label>
              <Input id="visionTitulo" {...register('visionTitulo')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visionContenido">Contenido de Visión</Label>
              <Textarea
                id="visionContenido"
                rows={5}
                {...register('visionContenido')}
              />
            </div>

            <div className="space-y-2">
              <Label>Justificación del texto (Visión)</Label>
              <Select
                value={watch('visionJustificacion') ?? 'left'}
                onValueChange={(value) =>
                  setValue('visionJustificacion', value as 'left' | 'center' | 'right' | 'justify', {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {JUSTIFICACION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Botón de guardar */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="min-w-[120px]"
          >
            {updateMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

