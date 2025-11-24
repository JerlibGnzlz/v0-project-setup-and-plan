"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { pastorSchema, type PastorFormData } from "@/lib/validations/pastor"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Eye, Download, Plus, Edit, Trash2, ChevronLeft, AlertCircle } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { usePastores, useCreatePastor, useUpdatePastor, useDeletePastor } from "@/lib/hooks/use-pastores"
import { Skeleton } from "@/components/ui/skeleton"
import type { Pastor } from "@/lib/api/pastores"

export default function PastoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null)
  const [isAddingPastor, setIsAddingPastor] = useState(false)
  const [isEditingPastor, setIsEditingPastor] = useState(false)

  const { data: pastores = [], isLoading } = usePastores()
  const createPastorMutation = useCreatePastor()
  const updatePastorMutation = useUpdatePastor()
  const deletePastorMutation = useDeletePastor()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(pastorSchema),
    defaultValues: {
      activo: true,
    },
  })

  const filteredPastores = pastores.filter((pastor: any) => {
    const matchSearch =
      pastor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pastor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pastor.sede && pastor.sede.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pastor.email && pastor.email.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchSearch
  })

  const onSubmit = async (data: PastorFormData) => {
    try {
      console.log("[v0] Submitting pastor form with data:", data)
      if (isEditingPastor && selectedPastor) {
        await updatePastorMutation.mutateAsync({ id: selectedPastor.id, data })
        setIsEditingPastor(false)
        setSelectedPastor(null)
      } else {
        await createPastorMutation.mutateAsync(data)
        toast.success("Pastor creado", {
          description: "El pastor se ha agregado exitosamente.",
        })
        setIsAddingPastor(false)
      }
      reset()
    } catch (error: any) {
      console.error("[v0] Error submitting pastor:", error)
      toast.error("Error", {
        description: error.response?.data?.message || "No se pudo guardar el pastor. Verifica que estés autenticado.",
      })
    }
  }

  const handleEdit = (pastor: Pastor) => {
    setSelectedPastor(pastor)
    setIsEditingPastor(true)
    setValue("nombre", pastor.nombre)
    setValue("apellido", pastor.apellido)
    setValue("email", pastor.email || "")
    setValue("telefono", pastor.telefono || "")
    setValue("sede", pastor.sede || "")
    setValue("cargo", pastor.cargo || "")
    setValue("fotoUrl", pastor.fotoUrl || "")
    setValue("biografia", pastor.biografia || "")
    setValue("activo", pastor.activo)
  }

  const handleDelete = async (pastor: Pastor) => {
    if (confirm(`¿Está seguro de eliminar a ${pastor.nombre} ${pastor.apellido}?`)) {
      try {
        await deletePastorMutation.mutateAsync(pastor.id)
      } catch (error) {
        console.error("[v0] Error deleting pastor:", error)
      }
    }
  }

  const descargarReporte = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Generando reporte...",
      success: "Reporte descargado exitosamente",
      error: "Error al generar el reporte",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
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
              <p className="text-muted-foreground mt-1">Registro y administración de pastores</p>
            </div>
          </div>
          <Dialog
            open={isAddingPastor || isEditingPastor}
            onOpenChange={(open) => {
              setIsAddingPastor(open)
              setIsEditingPastor(false)
              if (!open) {
                reset()
                setSelectedPastor(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="lg" onClick={() => setIsAddingPastor(true)}>
                <Plus className="size-4 mr-2" />
                Agregar Pastor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditingPastor ? "Editar Pastor" : "Agregar Nuevo Pastor"}</DialogTitle>
                <DialogDescription>Complete la información del pastor</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" placeholder="Juan" {...register("nombre")} />
                    {errors.nombre && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.nombre.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input id="apellido" placeholder="Pérez" {...register("apellido")} />
                    {errors.apellido && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.apellido.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="pastor@iglesia.com" {...register("email")} />
                    {errors.email && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.email.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" placeholder="+54 11 1234-5678" {...register("telefono")} />
                    {errors.telefono && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.telefono.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sede">Sede</Label>
                    <Input id="sede" placeholder="Buenos Aires" {...register("sede")} />
                    {errors.sede && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.sede.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input id="cargo" placeholder="Pastor Principal" {...register("cargo")} />
                    {errors.cargo && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.cargo.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fotoUrl">URL de Foto</Label>
                    <Input id="fotoUrl" type="url" placeholder="https://..." {...register("fotoUrl")} />
                    {errors.fotoUrl && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.fotoUrl.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="biografia">Biografía</Label>
                    <Textarea
                      id="biografia"
                      placeholder="Breve biografía del pastor..."
                      rows={3}
                      {...register("biografia")}
                    />
                    {errors.biografia && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="size-3" />
                        <AlertDescription className="text-xs">{errors.biografia.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Switch
                      id="activo"
                      checked={watch("activo")}
                      onCheckedChange={(checked) => setValue("activo", checked)}
                    />
                    <Label htmlFor="activo">Pastor activo</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingPastor(false)
                      setIsEditingPastor(false)
                      reset()
                      setSelectedPastor(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : isEditingPastor ? "Actualizar" : "Crear Pastor"}
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
              <CardTitle>Búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido, sede o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
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
                  <CardDescription>{filteredPastores.length} pastor(es) encontrado(s)</CardDescription>
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
                      <th className="p-3 text-sm font-medium">Sede</th>
                      <th className="p-3 text-sm font-medium">Cargo</th>
                      <th className="p-3 text-sm font-medium">Contacto</th>
                      <th className="p-3 text-sm font-medium">Estado</th>
                      <th className="p-3 text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPastores.map((pastor: any) => (
                      <tr key={pastor.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {pastor.fotoUrl && (
                              <img
                                src={pastor.fotoUrl || "/placeholder.svg"}
                                alt={`${pastor.nombre} ${pastor.apellido}`}
                                className="size-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {pastor.nombre} {pastor.apellido}
                              </p>
                              {pastor.email && <p className="text-xs text-muted-foreground">{pastor.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{pastor.sede || "-"}</td>
                        <td className="p-3 text-sm">{pastor.cargo || "-"}</td>
                        <td className="p-3 text-sm">{pastor.telefono || "-"}</td>
                        <td className="p-3">
                          <Badge variant={pastor.activo ? "default" : "secondary"}>
                            {pastor.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedPastor(pastor)}>
                                      <Eye className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver detalles</p>
                                  </TooltipContent>
                                </Tooltip>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Pastor</DialogTitle>
                                </DialogHeader>
                                {selectedPastor && (
                                  <div className="space-y-4">
                                    {selectedPastor.fotoUrl && (
                                      <img
                                        src={selectedPastor.fotoUrl || "/placeholder.svg"}
                                        alt={`${selectedPastor.nombre} ${selectedPastor.apellido}`}
                                        className="size-32 rounded-full object-cover mx-auto"
                                      />
                                    )}
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Nombre completo</p>
                                        <p className="text-sm">
                                          {selectedPastor.nombre} {selectedPastor.apellido}
                                        </p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{selectedPastor.email || "-"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                        <p className="text-sm">{selectedPastor.telefono || "-"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Sede</p>
                                        <p className="text-sm">{selectedPastor.sede || "-"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                                        <p className="text-sm">{selectedPastor.cargo || "-"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                        <Badge variant={selectedPastor.activo ? "default" : "secondary"}>
                                          {selectedPastor.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                      </div>
                                      {selectedPastor.biografia && (
                                        <div className="space-y-2 md:col-span-2">
                                          <p className="text-sm font-medium text-muted-foreground">Biografía</p>
                                          <p className="text-sm">{selectedPastor.biografia}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(pastor)}>
                                  <Edit className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar pastor</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(pastor)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="size-4" />
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
                    {filteredPastores.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No se encontraron pastores
                        </td>
                      </tr>
                    )}
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
