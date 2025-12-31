'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { pastoresApi, type Pastor, type TipoPastor } from '@/lib/api/pastores'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Crown,
  Globe,
  MapPin,
  ChevronLeft,
  Briefcase,
  Eye,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Sparkles,
  Quote,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { QueryProvider } from '@/lib/providers/query-provider'
import { getReturnUrl } from '@/lib/utils/scroll-restore'

// Configuración de tipos
const tipoConfig: Record<
  TipoPastor,
  {
    icon: any
    label: string
    gradient: string
    bgColor: string
  }
> = {
  DIRECTIVA: {
    icon: Crown,
    label: 'Directiva Pastoral',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/10',
  },
  PRESIDENTE: {
    icon: Globe,
    label: 'Presidentes de País',
    gradient: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  SUPERVISOR: {
    icon: MapPin,
    label: 'Supervisores Regionales',
    gradient: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-500/10',
  },
  PASTOR: {
    icon: Users,
    label: 'Pastores',
    gradient: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-500/10',
  },
}

// Gradientes para cards (rotación)
const cardGradients = [
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-pink-500',
  'from-rose-400 to-red-500',
  'from-cyan-400 to-teal-500',
]

function EquipoContent() {
  const [selectedTipo, setSelectedTipo] = useState<TipoPastor | 'todos'>('todos')
  const [selectedPais, setSelectedPais] = useState<string>('todos')
  const [selectedRegion, setSelectedRegion] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch todos los pastores activos
  const { data: pastores = [], isLoading } = useQuery({
    queryKey: ['pastores', 'active'],
    queryFn: pastoresApi.getActive,
    staleTime: 1000 * 60 * 5,
  })

  // Extraer países y regiones únicos
  const paises = useMemo(() => {
    const set = new Set<string>()
    pastores.forEach((p: Pastor) => {
      if (p.pais) set.add(p.pais)
    })
    return Array.from(set).sort()
  }, [pastores])

  const regiones = useMemo(() => {
    const set = new Set<string>()
    pastores.forEach((p: Pastor) => {
      if (p.region) set.add(p.region)
    })
    return Array.from(set).sort()
  }, [pastores])

  // Filtrar pastores (excluir tipo PASTOR)
  const filteredPastores = useMemo(() => {
    return pastores.filter((pastor: Pastor) => {
      // Excluir pastores de tipo PASTOR
      if (pastor.tipo === 'PASTOR') return false

      const matchTipo = selectedTipo === 'todos' || pastor.tipo === selectedTipo
      const matchPais = selectedPais === 'todos' || pastor.pais === selectedPais
      const matchRegion = selectedRegion === 'todos' || pastor.region === selectedRegion
      const matchSearch =
        searchTerm === '' ||
        `${pastor.nombre} ${pastor.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pastor.sede?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchTipo && matchPais && matchRegion && matchSearch
    })
  }, [pastores, selectedTipo, selectedPais, selectedRegion, searchTerm])

  // Agrupar por tipo para mostrar secciones
  const groupedPastores = useMemo(() => {
    const groups: Record<TipoPastor, Pastor[]> = {
      DIRECTIVA: [],
      PRESIDENTE: [],
      SUPERVISOR: [],
      PASTOR: [],
    }

    filteredPastores.forEach((pastor: Pastor) => {
      if (groups[pastor.tipo]) {
        groups[pastor.tipo].push(pastor)
      }
    })

    return groups
  }, [filteredPastores])

  // Contar por tipo
  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: pastores.length }
    pastores.forEach((p: Pastor) => {
      c[p.tipo] = (c[p.tipo] || 0) + 1
    })
    return c
  }, [pastores])

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[200px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={typeof window !== 'undefined' ? getReturnUrl() : '/#directiva'}>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <ChevronLeft className="size-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                    Nuestro Equipo
                  </h1>
                  <p className="text-sm text-white/50">
                    {filteredPastores.length} de {pastores.filter(p => p.tipo !== 'PASTOR').length}{' '}
                    miembros
                  </p>
                </div>
              </div>
              <Link href="/">
                <Image
                  src="/mundo.png"
                  alt="AMVA"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="sticky top-[73px] z-40 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-4 py-4">
            {/* Type badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTipo === 'todos' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${selectedTipo === 'todos' ? 'bg-white/20 text-white' : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'}`}
                onClick={() => setSelectedTipo('todos')}
              >
                Todos
              </Badge>
              {(Object.keys(tipoConfig) as TipoPastor[])
                .filter(tipo => tipo !== 'PASTOR')
                .map(tipo => {
                  const config = tipoConfig[tipo]
                  const Icon = config.icon
                  const isActive = selectedTipo === tipo
                  return (
                    <Badge
                      key={tipo}
                      variant={isActive ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all gap-1 ${isActive ? `bg-gradient-to-r ${config.gradient} text-white border-0` : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'}`}
                      onClick={() => setSelectedTipo(tipo)}
                    >
                      <Icon className="size-3" />
                      {config.label.split(' ')[0]}
                    </Badge>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          ) : filteredPastores.length === 0 ? (
            <div className="text-center py-20">
              <Users className="size-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/60">No se encontraron resultados</h3>
              <p className="text-white/40 mt-2">Intenta ajustar los filtros</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Render by type sections */}
              {(Object.keys(tipoConfig) as TipoPastor[])
                .filter(tipo => tipo !== 'PASTOR')
                .map(tipo => {
                  const pastoresDelTipo = groupedPastores[tipo]
                  if (pastoresDelTipo.length === 0) return null

                  const config = tipoConfig[tipo]
                  const Icon = config.icon

                  return (
                    <section key={tipo}>
                      {/* Section header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-r ${config.gradient}`}>
                          <Icon className="size-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{config.label}</h2>
                          <p className="text-sm text-white/50">{pastoresDelTipo.length} miembros</p>
                        </div>
                        <div
                          className={`flex-1 h-px bg-gradient-to-r ${config.gradient} opacity-30 ml-4`}
                        />
                      </div>

                      {/* Cards grid - Tamaño uniforme y compacto */}
                      <div
                        className={`grid gap-4 ${
                          pastoresDelTipo.length === 1
                            ? 'grid-cols-1 max-w-sm'
                            : pastoresDelTipo.length === 2
                              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                              : pastoresDelTipo.length === 3
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}
                      >
                        {pastoresDelTipo.map((pastor: Pastor, index: number) => (
                          <PastorCard
                            key={pastor.id}
                            pastor={pastor}
                            gradient={cardGradients[index % cardGradients.length]}
                          />
                        ))}
                      </div>
                    </section>
                  )
                })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Asociación Misionera Vida Abundante
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Componente de tarjeta de pastor - Estilo compacto como página principal
function PastorCard({ pastor, gradient }: { pastor: Pastor; gradient: string }) {
  const fullName = `${pastor.nombre} ${pastor.apellido}`
  const location = [pastor.sede, pastor.region, pastor.pais].filter(Boolean).join(', ')
  const initials = `${pastor.nombre?.[0] || ''}${pastor.apellido?.[0] || ''}`
  const config = tipoConfig[pastor.tipo]

  return (
    <div className="group relative h-full" style={{ animationDelay: '0ms' }}>
      {/* Animated border gradient */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[0.5px]" />

      {/* Glow effect on hover */}
      <div
        className={`absolute -inset-3 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-all duration-500`}
      />

      {/* Card - Estilo compacto como página principal */}
      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-500 h-full flex flex-col">
        {/* Top accent line */}
        <div
          className={`h-[2px] bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity`}
        />

        {/* Content - Layout compacto horizontal */}
        <div className="p-4 flex flex-col h-full">
          {/* Header with avatar */}
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {/* Avatar glow */}
              <div
                className={`absolute -inset-1 bg-gradient-to-br ${gradient} rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity`}
              />

              <div
                className={`relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 ring-offset-2 ring-offset-[#0a1628]`}
              >
                {pastor.fotoUrl ? (
                  <>
                    {/* Fondo según tipo */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
                    <Image
                      src={pastor.fotoUrl}
                      alt={fullName}
                      fill
                      sizes="48px"
                      className="object-cover relative z-10"
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  >
                    <span className="text-sm font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>

              {/* Type badge pequeño en esquina */}
              <div className="absolute -top-1 -right-1">
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#0a1628] flex items-center justify-center`}
                >
                  {config?.icon && (
                    <config.icon className="w-2 h-2 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white mb-0.5 truncate group-hover:text-white/90">
                {fullName}
              </h3>
              <p
                className={`text-xs font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent truncate mb-1`}
              >
                {pastor.cargo || pastor.ministerio || 'Pastor'}
              </p>
              {location && (
                <div className="flex items-center gap-1 text-white/40 text-[10px]">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio preview if exists */}
          {pastor.biografia && (
            <div className="relative mb-3 flex-1 min-h-[32px]">
              <div
                className={`absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b ${gradient} rounded-full opacity-40`}
              />
              <p className="text-white/50 text-[10px] leading-relaxed pl-2.5 line-clamp-2 italic">
                "{pastor.biografia}"
              </p>
            </div>
          )}

          {/* Action Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full bg-gradient-to-r from-white/[0.03] to-white/[0.06] hover:from-white/[0.08] hover:to-white/[0.12] text-white/80 hover:text-white border border-white/[0.08] hover:border-white/[0.15] gap-1.5 group/btn transition-all duration-300 rounded-xl h-8 mt-auto`}
              >
                <Eye className="h-3 w-3" />
                <span className="text-[10px] font-medium">Ver Perfil</span>
                <ChevronRight className="h-3 w-3 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
              </Button>
            </DialogTrigger>
              {/* Modal Content */}
              <DialogContent className="max-w-lg bg-[#0d1f35]/95 backdrop-blur-2xl border-white/10 text-white">
                <DialogHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar in modal con fondo según tipo */}
                    <div
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/20`}
                    >
                      {pastor.fotoUrl ? (
                        <>
                          {/* Fondo según tipo */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
                          <Image
                            src={pastor.fotoUrl}
                            alt={fullName}
                            fill
                            className="object-cover relative z-10"
                          />
                        </>
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                        >
                          <span className="text-2xl font-bold text-white">{initials}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <DialogTitle className="text-xl text-white">{fullName}</DialogTitle>
                      <DialogDescription
                        className={`text-sm bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-medium`}
                      >
                        {pastor.cargo || pastor.ministerio || 'Pastor'}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-5">
                  {/* Contact info */}
                  <div className="flex flex-wrap gap-3">
                    {location && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {location}
                      </div>
                    )}
                    {pastor.ministerio && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm">
                        <Briefcase className="w-3.5 h-3.5" />
                        {pastor.ministerio}
                      </div>
                    )}
                  </div>

                  {/* Biography */}
                  {pastor.biografia && (
                    <div className="relative">
                      <Quote className={`absolute -top-1 -left-1 w-6 h-6 text-white/30`} />
                      <p className="text-white/70 text-sm leading-relaxed pl-5 italic">
                        {pastor.biografia}
                      </p>
                    </div>
                  )}

                  {/* Trayectoria */}
                  {pastor.trayectoria && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                        <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${gradient}`} />
                        Trayectoria Ministerial
                      </h4>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                          {pastor.trayectoria}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export with QueryProvider
export default function EquipoPage() {
  return (
    <QueryProvider>
      <EquipoContent />
    </QueryProvider>
  )
}
