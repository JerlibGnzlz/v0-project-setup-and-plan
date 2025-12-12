'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  useCreateCredencialPastoral,
  useUpdateCredencialPastoral,
} from '@/lib/hooks/use-credenciales-pastorales'
import { CredencialPastoral } from '@/lib/api/credenciales-pastorales'
import { usePastores } from '@/lib/hooks/use-pastores'

const credencialSchema = z.object({
  pastorId: z.string().min(1, 'Debe seleccionar un pastor'),
  numeroCredencial: z.string().min(1, 'El número de credencial es requerido'),
  fechaEmision: z.string().min(1, 'La fecha de emisión es requerida'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  estado: z.enum(['SIN_CREDENCIAL', 'VIGENTE', 'POR_VENCER', 'VENCIDA']).optional(),
  activa: z.boolean().default(true),
  notas: z.string().optional(),
})

type CredencialFormData = z.infer<typeof credencialSchema>

interface CredencialPastoralDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credencial?: CredencialPastoral | null
}

export function CredencialPastoralDialog({
  open,
  onOpenChange,
  credencial,
}: CredencialPastoralDialogProps) {
  const { data: pastoresResponse } = usePastores(1, 1000) // Obtener todos los pastores
  const pastores = Array.isArray(pastoresResponse)
    ? pastoresResponse
    : pastoresResponse?.data || []

  const createMutation = useCreateCredencialPastoral()
  const updateMutation = useUpdateCredencialPastoral()

  const form = useForm<CredencialFormData>({
    resolver: zodResolver(credencialSchema),
    defaultValues: {
      pastorId: '',
      numeroCredencial: '',
      fechaEmision: '',
      fechaVencimiento: '',
      estado: 'VIGENTE',
      activa: true,
      notas: '',
    },
  })

  useEffect(() => {
    if (credencial) {
      form.reset({
        pastorId: credencial.pastorId,
        numeroCredencial: credencial.numeroCredencial,
        fechaEmision: credencial.fechaEmision.split('T')[0],
        fechaVencimiento: credencial.fechaVencimiento.split('T')[0],
        estado: credencial.estado,
        activa: credencial.activa,
        notas: credencial.notas || '',
      })
    } else {
      form.reset({
        pastorId: '',
        numeroCredencial: '',
        fechaEmision: '',
        fechaVencimiento: '',
        estado: 'VIGENTE',
        activa: true,
        notas: '',
      })
    }
  }, [credencial, form])

  const onSubmit = async (data: CredencialFormData) => {
    try {
      if (credencial) {
        await updateMutation.mutateAsync({
          id: credencial.id,
          dto: data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {credencial ? 'Editar Credencial' : 'Nueva Credencial Pastoral'}
          </DialogTitle>
          <DialogDescription>
            {credencial
              ? 'Actualiza la información de la credencial pastoral'
              : 'Crea una nueva credencial ministerial para un pastor'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pastorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pastor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!credencial}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un pastor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pastores.map((pastor) => (
                        <SelectItem key={pastor.id} value={pastor.id}>
                          {pastor.nombre} {pastor.apellido}
                          {pastor.email && ` (${pastor.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numeroCredencial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Credencial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: AMVA-2025-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Número único de identificación de la credencial
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fechaEmision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Emisión</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaVencimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VIGENTE">Vigente</SelectItem>
                      <SelectItem value="POR_VENCER">Por Vencer</SelectItem>
                      <SelectItem value="VENCIDA">Vencida</SelectItem>
                      <SelectItem value="SIN_CREDENCIAL">Sin Credencial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El estado se actualiza automáticamente según la fecha de vencimiento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Credencial Activa</FormLabel>
                    <FormDescription>
                      Desactiva la credencial si ya no está en uso
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre la credencial..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Guardando...'
                  : credencial
                    ? 'Actualizar'
                    : 'Crear Credencial'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

