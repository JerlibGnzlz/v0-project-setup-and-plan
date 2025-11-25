"use client"

import { useState } from "react"
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
import { Search, Eye, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { usePastores, useCreatePastor, useUpdatePastor, useDeletePastor } from "@/lib/hooks/use-pastores"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageUpload } from "@/components/ui/image-upload"
import { uploadApi } from "@/lib/api/upload"
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

  const fotoUrl = watch("fotoUrl")

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadPastorImage(file)
    return result.url
  }

  const filteredPastores = pastores.filter((pastor: any) => {
    const matchSearch =
      pastor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pastor.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pastor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pastor.sede?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  const onSubmit = async (data: PastorFormData) => {
    try {
      if (isEditingPastor && selectedPastor) {
        await updatePastorMutation.mutateAsync({
          id: selectedPastor.id,
          data,
        })
        toast.success("Pastor actualizado", {
          description: "El pastor ha sido actualizado correctamente.",
        })
      } else {
        await createPastorMutation.mutateAsync(data)
        toast.success("Pastor creado", {
          description: "El pastor ha sido creado correctamente.",
        })
      }
      setIsAddingPastor(false)
      setIsEditingPastor(false)
      reset()
      setSelectedPastor(null)
    } catch (error: any) {
      console.error("[v0] Error saving pastor:", error)
      toast.error("Error al guardar", {
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
        toast.success("Pastor eliminado", {
          description: "El pastor ha sido eliminado correctamente.",
        })
      } catch (error: any) {
        toast.error("Error al eliminar", {
          description: error.response?.data?.message || "No se pudo eliminar el pastor.",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <ScrollReveal>
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Pastores</CardTitle>
                <CardDescription>Registro y administración de pastores</CardDescription>
              </div>
              <Dialog
                open={isAddingPastor || isEditingPastor}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingPastor(false)
                    setIsEditingPastor(false)
                    reset()
                    setSelectedPastor(null)
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAddingPastor(true)}>
                    <Plus className="size-4 mr-2" />
                    Nuevo Pastor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditingPastor ? "Editar Pastor" : "Nuevo Pastor"}</DialogTitle>
                    <DialogDescription>
                      {isEditingPastor
                        ? "Modifica los datos del pastor"
                        : "Completa los datos para registrar un nuevo pastor"}
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex justify-center">
                      <div className="space-y-2">
                        <Label>Foto del Pastor</Label>
                        <ImageUpload
                          value={fotoUrl}
                          onChange={(url) => setValue("fotoUrl", url)}
                          onUpload={handleImageUpload}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

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
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pastores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Pastor</th>
                      <th className="p-3 text-left text-sm font-medium">Sede</th>
                      <th className="p-3 text-left text-sm font-medium">Cargo</th>
                      <th className="p-3 text-left text-sm font-medium">Teléfono</th>
                      <th className="p-3 text-left text-sm font-medium">Estado</th>
                      <th className="p-3 text-left text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPastores.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No se encontraron pastores
                        </td>
                      </tr>
                    ) : (
                      filteredPastores.map((pastor: Pastor) => (
                        <tr key={pastor.id} className="border-t hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {pastor.fotoUrl ? (
                                <img
                                  src={pastor.fotoUrl || "/placeholder.svg"}
                                  alt={`${pastor.nombre} ${pastor.apellido}`}
                                  className="size-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                                  {pastor.nombre?.[0]}
                                  {pastor.apellido?.[0]}
                                </div>
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
                                      {selectedPastor.fotoUrl ? (
                                        <img
                                          src={selectedPastor.fotoUrl || "/placeholder.svg"}
                                          alt={`${selectedPastor.nombre} ${selectedPastor.apellido}`}
                                          className="size-32 rounded-full object-cover mx-auto"
                                        />
                                      ) : (
                                        <div className="size-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-2xl font-medium mx-auto">
                                          {selectedPastor.nombre?.[0]}
                                          {selectedPastor.apellido?.[0]}
                                        </div>
                                      )}
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Nombre completo</p>
                                          <p className="font-medium">
                                            {selectedPastor.nombre} {selectedPastor.apellido}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Email</p>
                                          <p className="font-medium">{selectedPastor.email || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Teléfono</p>
                                          <p className="font-medium">{selectedPastor.telefono || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Sede</p>
                                          <p className="font-medium">{selectedPastor.sede || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Cargo</p>
                                          <p className="font-medium">{selectedPastor.cargo || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Estado</p>
                                          <Badge variant={selectedPastor.activo ? "default" : "secondary"}>
                                            {selectedPastor.activo ? "Activo" : "Inactivo"}
                                          </Badge>
                                        </div>
                                      </div>
                                      {selectedPastor.biografia && (
                                        <div>
                                          <p className="text-sm text-muted-foreground">Biografía</p>
                                          <p className="text-sm">{selectedPastor.biografia}</p>
                                        </div>
                                      )}
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
                                  <p>Editar</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pastor)}>
                                    <Trash2 className="size-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>
    </TooltipProvider>
  )
}
