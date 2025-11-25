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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// AlertDialog se usa para el botón de desactivar
import { Search, Eye, Plus, Edit, AlertCircle, UserX, UserCheck } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { usePastores, useCreatePastor, useUpdatePastor } from "@/lib/hooks/use-pastores"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageUpload } from "@/components/ui/image-upload"
import { uploadApi } from "@/lib/api/upload"
import type { Pastor } from "@/lib/api/pastores"

export default function PastoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">("todos")
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null)
  const [isAddingPastor, setIsAddingPastor] = useState(false)
  const [isEditingPastor, setIsEditingPastor] = useState(false)

  const { data: pastores = [], isLoading } = usePastores()
  const createPastorMutation = useCreatePastor()
  const updatePastorMutation = useUpdatePastor()

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
    
    // Normalizar el valor de activo (puede venir como boolean, string, o undefined)
    const isActivo = pastor.activo === true || pastor.activo === "true"
    
    const matchStatus = 
      statusFilter === "todos" ||
      (statusFilter === "activos" && isActivo) ||
      (statusFilter === "inactivos" && !isActivo)
    
    return matchSearch && matchStatus
  })

  // Contadores para los badges del filtro
  const counts = {
    todos: pastores.length,
    activos: pastores.filter((p: any) => p.activo === true || p.activo === "true").length,
    inactivos: pastores.filter((p: any) => p.activo === false || p.activo === "false" || p.activo === undefined).length,
  }

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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pastores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={statusFilter === "todos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("todos")}
                  >
                    Todos
                    <Badge variant="secondary" className="ml-2">{counts.todos}</Badge>
                  </Button>
                  <Button
                    variant={statusFilter === "activos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("activos")}
                  >
                    Activos
                    <Badge variant="secondary" className="ml-2">{counts.activos}</Badge>
                  </Button>
                  <Button
                    variant={statusFilter === "inactivos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("inactivos")}
                  >
                    Inactivos
                    <Badge variant="secondary" className="ml-2">{counts.inactivos}</Badge>
                  </Button>
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
                            {pastor.activo ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Badge variant="default" className="gap-1">
                                      <UserCheck className="size-3" />
                                      Activo
                                    </Badge>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Desactivar pastor?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Estás a punto de desactivar a <strong>{pastor.nombre} {pastor.apellido}</strong>.
                                      <br /><br />
                                      El pastor no será eliminado, solo quedará inactivo y podrás reactivarlo en cualquier momento desde la pestaña "Inactivos".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={async () => {
                                        try {
                                          await updatePastorMutation.mutateAsync({
                                            id: pastor.id,
                                            data: { activo: false },
                                          })
                                          toast.success('Pastor desactivado', {
                                            description: `${pastor.nombre} ${pastor.apellido} ha sido desactivado`,
                                          })
                                        } catch (error: any) {
                                          toast.error('Error', {
                                            description: error.response?.data?.message || 'No se pudo desactivar el pastor',
                                          })
                                        }
                                      }}
                                    >
                                      Sí, desactivar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={async () => {
                                  try {
                                    await updatePastorMutation.mutateAsync({
                                      id: pastor.id,
                                      data: { activo: true },
                                    })
                                    toast.success('Pastor activado', {
                                      description: `${pastor.nombre} ${pastor.apellido} ha sido reactivado`,
                                    })
                                  } catch (error: any) {
                                    toast.error('Error', {
                                      description: error.response?.data?.message || 'No se pudo activar el pastor',
                                    })
                                  }
                                }}
                              >
                                <Badge variant="secondary" className="gap-1">
                                  <UserX className="size-3" />
                                  Inactivo
                                </Badge>
                                <span className="text-xs text-primary">Reactivar</span>
                              </Button>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Eye className="size-4" />
                                      </Button>
                                    </DialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver detalles</p>
                                  </TooltipContent>
                                </Tooltip>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalles del Pastor</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {pastor.fotoUrl ? (
                                      <img
                                        src={pastor.fotoUrl}
                                        alt={`${pastor.nombre} ${pastor.apellido}`}
                                        className="size-32 rounded-full object-cover mx-auto"
                                      />
                                    ) : (
                                      <div className="size-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-2xl font-medium mx-auto">
                                        {pastor.nombre?.[0]}
                                        {pastor.apellido?.[0]}
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <h3 className="text-xl font-semibold">{pastor.nombre} {pastor.apellido}</h3>
                                      {pastor.cargo && <p className="text-muted-foreground">{pastor.cargo}</p>}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                                        <p className="font-medium">{pastor.email || "-"}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</p>
                                        <p className="font-medium">{pastor.telefono || "-"}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Sede</p>
                                        <p className="font-medium">{pastor.sede || "-"}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Estado</p>
                                        <Badge variant={pastor.activo ? "default" : "secondary"}>
                                          {pastor.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                      </div>
                                    </div>
                                    {pastor.biografia && (
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Biografía</p>
                                        <p className="text-sm">{pastor.biografia}</p>
                                      </div>
                                    )}
                                  </div>
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
