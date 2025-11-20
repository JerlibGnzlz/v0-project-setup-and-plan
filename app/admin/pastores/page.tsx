'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pastorSchema, type PastorFormData } from '@/lib/validations/pastor'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, Eye, Download, Plus, Edit, Trash2, User, Smartphone, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

const pastores = [
  {
    id: 1,
    nombre: 'Rev. Juan Pérez',
    iglesia: 'Iglesia Central Buenos Aires',
    ciudad: 'Buenos Aires',
    provincia: 'Buenos Aires',
    email: 'juan.perez@iglesia.com',
    telefono: '+54 11 1234-5678',
    estadoPago: 'confirmado',
    monto: 15000,
    cuotasPagadas: 3,
    fecha: '2025-01-15',
    registroOrigen: 'manual'
  },
  {
    id: 2,
    nombre: 'Ptra. María González',
    iglesia: 'Iglesia Nueva Vida',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    email: 'maria.gonzalez@iglesia.com',
    telefono: '+54 351 9876-5432',
    estadoPago: 'parcial',
    monto: 15000,
    cuotasPagadas: 2,
    fecha: '2025-01-16',
    registroOrigen: 'mobile'
  },
  {
    id: 3,
    nombre: 'Rev. Carlos Rodríguez',
    iglesia: 'Iglesia Monte Hermoso',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    email: 'carlos.rodriguez@iglesia.com',
    telefono: '+54 341 5555-4444',
    estadoPago: 'pendiente',
    monto: 15000,
    cuotasPagadas: 0,
    fecha: '2025-01-17',
    registroOrigen: 'mobile'
  },
  {
    id: 4,
    nombre: 'Ptra. Ana Martínez',
    iglesia: 'Iglesia El Buen Pastor',
    ciudad: 'Mendoza',
    provincia: 'Mendoza',
    email: 'ana.martinez@iglesia.com',
    telefono: '+54 261 7777-8888',
    estadoPago: 'pendiente',
    monto: 15000,
    cuotasPagadas: 0,
    fecha: '2025-01-18',
    registroOrigen: 'manual'
  },
  {
    id: 5,
    nombre: 'Rev. Luis Fernández',
    iglesia: 'Iglesia Roca Eterna',
    ciudad: 'La Plata',
    provincia: 'Buenos Aires',
    email: 'luis.fernandez@iglesia.com',
    telefono: '+54 221 3333-2222',
    estadoPago: 'parcial',
    monto: 15000,
    cuotasPagadas: 1,
    fecha: '2025-01-19',
    registroOrigen: 'mobile'
  },
]

export default function PastoresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [origenFilter, setOrigenFilter] = useState('todos')
  const [selectedPastor, setSelectedPastor] = useState<typeof pastores[0] | null>(null)
  const [isAddingPastor, setIsAddingPastor] = useState(false)
  const [isEditingPastor, setIsEditingPastor] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<PastorFormData>({
    resolver: zodResolver(pastorSchema),
  })

  const filteredPastores = pastores.filter((pastor) => {
    const matchSearch = pastor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pastor.iglesia.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = estadoFilter === 'todos' || pastor.estadoPago === estadoFilter
    const matchOrigen = origenFilter === 'todos' || pastor.registroOrigen === origenFilter
    return matchSearch && matchEstado && matchOrigen
  })

  const descargarReporte = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Generando reporte...',
        success: 'Reporte descargado exitosamente',
        error: 'Error al generar el reporte',
      }
    )
  }

  const onSubmit = async (data: PastorFormData) => {
    console.log('Pastor data:', data)
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Registrando pastor...',
        success: () => {
          reset()
          setIsAddingPastor(false)
          return `${data.nombre} registrado exitosamente`
        },
        error: 'Error al registrar el pastor',
      }
    )
  }

  const handleDelete = (pastor: typeof pastores[0]) => {
    if (confirm(`¿Está seguro de eliminar a ${pastor.nombre}?`)) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: 'Eliminando pastor...',
          success: `${pastor.nombre} eliminado correctamente`,
          error: 'Error al eliminar el pastor',
        }
      )
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Pastores</h1>
            <p className="text-muted-foreground mt-1">
              Registro manual y visualización de pastores inscritos
            </p>
          </div>
        </div>
        <Dialog open={isAddingPastor} onOpenChange={setIsAddingPastor}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="size-4 mr-2" />
              Registrar Pastor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registro Manual de Pastor</DialogTitle>
              <DialogDescription>
                Complete la información para inscribir un nuevo pastor a la convención
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Rev. Juan Pérez" 
                    {...register('nombre')}
                  />
                  {errors.nombre && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.nombre.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iglesia">Iglesia *</Label>
                  <Input 
                    id="iglesia" 
                    placeholder="Iglesia Central" 
                    {...register('iglesia')}
                  />
                  {errors.iglesia && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.iglesia.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia *</Label>
                  <Select onValueChange={(value) => setValue('provincia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
                      <SelectItem value="cordoba">Córdoba</SelectItem>
                      <SelectItem value="santa-fe">Santa Fe</SelectItem>
                      <SelectItem value="mendoza">Mendoza</SelectItem>
                      <SelectItem value="tucuman">Tucumán</SelectItem>
                      <SelectItem value="salta">Salta</SelectItem>
                      <SelectItem value="entre-rios">Entre Ríos</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.provincia && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.provincia.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Input 
                    id="ciudad" 
                    placeholder="Buenos Aires" 
                    {...register('ciudad')}
                  />
                  {errors.ciudad && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.ciudad.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="pastor@iglesia.com" 
                    {...register('email')}
                  />
                  {errors.email && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.email.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input 
                    id="telefono" 
                    placeholder="+54 11 1234-5678" 
                    {...register('telefono')}
                  />
                  {errors.telefono && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.telefono.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea 
                    id="observaciones" 
                    placeholder="Información adicional..." 
                    rows={3} 
                    {...register('observaciones')}
                  />
                  {errors.observaciones && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="size-3" />
                      <AlertDescription className="text-xs">{errors.observaciones.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="font-semibold mb-2">Información de Pago</h4>
                <p className="text-sm text-muted-foreground">
                  Monto total: <span className="font-bold">$15.000</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Disponible en 3 cuotas sin interés con MercadoPago
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingPastor(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Pastor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <ScrollReveal>
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o iglesia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="confirmado">Completo</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={origenFilter} onValueChange={setOrigenFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los orígenes</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="mobile">App Móvil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Pastores Table */}
      <ScrollReveal delay={100}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Listado de Pastores</CardTitle>
                <CardDescription>
                  {filteredPastores.length} pastor(es) encontrado(s)
                </CardDescription>
              </div>
              <Button onClick={descargarReporte} variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Descargar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 text-sm font-medium">Pastor</th>
                    <th className="p-3 text-sm font-medium">Iglesia</th>
                    <th className="p-3 text-sm font-medium">Ubicación</th>
                    <th className="p-3 text-sm font-medium">Origen</th>
                    <th className="p-3 text-sm font-medium">Progreso</th>
                    <th className="p-3 text-sm font-medium">Estado</th>
                    <th className="p-3 text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPastores.map((pastor) => (
                    <tr key={pastor.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">
                        <p className="font-medium text-sm">{pastor.nombre}</p>
                        <p className="text-xs text-muted-foreground">{pastor.email}</p>
                      </td>
                      <td className="p-3 text-sm">{pastor.iglesia}</td>
                      <td className="p-3 text-sm">
                        {pastor.ciudad}, {pastor.provincia}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="gap-1">
                          {pastor.registroOrigen === 'manual' ? (
                            <>
                              <User className="size-3" />
                              Manual
                            </>
                          ) : (
                            <>
                              <Smartphone className="size-3" />
                              Móvil
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {pastor.cuotasPagadas} de 3 cuotas
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(pastor.cuotasPagadas / 3) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            pastor.estadoPago === 'confirmado' 
                              ? 'default' 
                              : pastor.estadoPago === 'parcial'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {pastor.estadoPago === 'confirmado' 
                            ? 'Completo' 
                            : pastor.estadoPago === 'parcial'
                            ? 'Parcial'
                            : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPastor(pastor)}
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalles completos</p>
                                </TooltipContent>
                              </Tooltip>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Pastor</DialogTitle>
                                <DialogDescription>
                                  Información completa de inscripción
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPastor && (
                                <div className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                      <p className="text-sm">{selectedPastor.nombre}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Iglesia</p>
                                      <p className="text-sm">{selectedPastor.iglesia}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                                      <p className="text-sm">{selectedPastor.ciudad}, {selectedPastor.provincia}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                                      <p className="text-sm">{selectedPastor.email}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                      <p className="text-sm">{selectedPastor.telefono}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                                      <p className="text-sm">{new Date(selectedPastor.fecha).toLocaleDateString('es-ES')}</p>
                                    </div>
                                  </div>
                                  <div className="rounded-lg border p-4 bg-muted/20">
                                    <h4 className="font-semibold mb-2">Información de Pago</h4>
                                    <div className="space-y-1">
                                      <p className="text-sm">
                                        Monto total: <span className="font-bold">${selectedPastor.monto.toLocaleString('es-AR')}</span>
                                      </p>
                                      <p className="text-sm">
                                        Pagado: <span className="font-bold text-green-600">
                                          ${((selectedPastor.cuotasPagadas / 3) * selectedPastor.monto).toLocaleString('es-AR')}
                                        </span>
                                      </p>
                                      <p className="text-sm">
                                        Restante: <span className="font-bold text-red-600">
                                          ${(((3 - selectedPastor.cuotasPagadas) / 3) * selectedPastor.monto).toLocaleString('es-AR')}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditingPastor(true)}>
                                      <Edit className="size-4 mr-2" />
                                      Editar
                                    </Button>
                                    {selectedPastor.estadoPago !== 'confirmado' && (
                                      <Link href="/admin/pagos">
                                        <Button>
                                          <CheckCircle className="size-4 mr-2" />
                                          Registrar Pago
                                        </Button>
                                      </Link>
                                    )}
                                  </DialogFooter>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar información del pastor</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(pastor)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar pastor</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
    </TooltipProvider>
  )
}
