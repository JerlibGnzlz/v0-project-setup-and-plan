'use client'

import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Pencil, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface EditarInscripcionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inscripcion: any
  onUpdate: (id: string, data: any) => Promise<any>
  isUpdating?: boolean
}

export function EditarInscripcionDialog({
  open,
  onOpenChange,
  inscripcion,
  onUpdate,
  isUpdating = false,
}: EditarInscripcionDialogProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    sede: '',
    pais: 'Argentina',
    provincia: '',
    tipoInscripcion: 'invitado',
    notas: '',
  })

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open && inscripcion) {
      setFormData({
        nombre: inscripcion.nombre || '',
        apellido: inscripcion.apellido || '',
        email: inscripcion.email || '',
        telefono: inscripcion.telefono || '',
        sede: inscripcion.sede || '',
        pais: inscripcion.pais || 'Argentina',
        provincia: inscripcion.provincia || '',
        tipoInscripcion: inscripcion.tipoInscripcion || 'invitado',
        notas: inscripcion.notas || '',
      })
    }
  }, [open, inscripcion])

  const handleSubmit = async () => {
    if (!inscripcion?.id) return

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    try {
      await onUpdate(inscripcion.id, {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || undefined,
        sede: formData.sede.trim() || undefined,
        pais: formData.pais || undefined,
        provincia: formData.provincia || undefined,
        tipoInscripcion: formData.tipoInscripcion,
        notas: formData.notas.trim() || undefined,
      })
      toast.success('Inscripción actualizada exitosamente')
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Error al actualizar inscripción', {
        description: error?.response?.data?.error?.message || error.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Pencil className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Editar Información de Inscripción</span>
          </DialogTitle>
          <DialogDescription>
            Actualiza los datos del participante. Los pagos se gestionan por separado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nombre"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Apellido"
                value={formData.apellido}
                onChange={e => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>
              Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              placeholder="+54 11 1234-5678"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>

          {/* País */}
          <div className="space-y-2">
            <Label>
              País <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.pais}
              onValueChange={value => {
                setFormData({
                  ...formData,
                  pais: value,
                  provincia: value !== 'Argentina' ? '' : formData.provincia,
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Bolivia">Bolivia</SelectItem>
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="Colombia">Colombia</SelectItem>
                <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                <SelectItem value="Cuba">Cuba</SelectItem>
                <SelectItem value="Ecuador">Ecuador</SelectItem>
                <SelectItem value="El Salvador">El Salvador</SelectItem>
                <SelectItem value="España">España</SelectItem>
                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem value="Guatemala">Guatemala</SelectItem>
                <SelectItem value="Honduras">Honduras</SelectItem>
                <SelectItem value="México">México</SelectItem>
                <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                <SelectItem value="Panamá">Panamá</SelectItem>
                <SelectItem value="Paraguay">Paraguay</SelectItem>
                <SelectItem value="Perú">Perú</SelectItem>
                <SelectItem value="República Dominicana">República Dominicana</SelectItem>
                <SelectItem value="Uruguay">Uruguay</SelectItem>
                <SelectItem value="Venezuela">Venezuela</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provincia (solo para Argentina) */}
          {formData.pais === 'Argentina' && (
            <div className="space-y-2">
              <Label>
                Provincia <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.provincia}
                onValueChange={value => setFormData({ ...formData, provincia: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                  <SelectItem value="Catamarca">Catamarca</SelectItem>
                  <SelectItem value="Chaco">Chaco</SelectItem>
                  <SelectItem value="Chubut">Chubut</SelectItem>
                  <SelectItem value="Córdoba">Córdoba</SelectItem>
                  <SelectItem value="Corrientes">Corrientes</SelectItem>
                  <SelectItem value="Entre Ríos">Entre Ríos</SelectItem>
                  <SelectItem value="Formosa">Formosa</SelectItem>
                  <SelectItem value="Jujuy">Jujuy</SelectItem>
                  <SelectItem value="La Pampa">La Pampa</SelectItem>
                  <SelectItem value="La Rioja">La Rioja</SelectItem>
                  <SelectItem value="Mendoza">Mendoza</SelectItem>
                  <SelectItem value="Misiones">Misiones</SelectItem>
                  <SelectItem value="Neuquén">Neuquén</SelectItem>
                  <SelectItem value="Río Negro">Río Negro</SelectItem>
                  <SelectItem value="Salta">Salta</SelectItem>
                  <SelectItem value="San Juan">San Juan</SelectItem>
                  <SelectItem value="San Luis">San Luis</SelectItem>
                  <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                  <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                  <SelectItem value="Santiago del Estero">Santiago del Estero</SelectItem>
                  <SelectItem value="Tierra del Fuego">Tierra del Fuego</SelectItem>
                  <SelectItem value="Tucumán">Tucumán</SelectItem>
                  <SelectItem value="Ciudad Autónoma de Buenos Aires">
                    Ciudad Autónoma de Buenos Aires
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sede / Iglesia */}
          <div className="space-y-2">
            <Label>Sede / Iglesia</Label>
            <Input
              placeholder="Nombre de la sede"
              value={formData.sede}
              onChange={e => setFormData({ ...formData, sede: e.target.value })}
            />
          </div>

          {/* Tipo de Inscripción */}
          <div className="space-y-2">
            <Label>Tipo de Inscripción</Label>
            <Select
              value={formData.tipoInscripcion}
              onValueChange={value => setFormData({ ...formData, tipoInscripcion: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invitado">Invitado</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
                <SelectItem value="visitante">Visitante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Notas (Opcional)</Label>
            <Textarea
              placeholder="Notas adicionales sobre esta inscripción..."
              value={formData.notas}
              onChange={e => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {isUpdating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
