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
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { QueryProvider } from '@/lib/providers/query-provider'
import { getReturnUrl } from '@/lib/utils/scroll-restore'

// Configuración de tipos
const tipoConfig: Record<TipoPastor, { 
  icon: any
  label: string
  gradient: string
  bgColor: string
}> = {
  DIRECTIVA: { 
    icon: Crown, 
    label: 'Directiva Pastoral',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/10'
  },
  PRESIDENTE: { 
    icon: Globe, 
    label: 'Presidentes de País',
    gradient: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500/10'
  },
  SUPERVISOR: { 
    icon: MapPin, 
    label: 'Supervisores Regionales',
    gradient: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-500/10'
  },
  PASTOR: { 
    icon: Users, 
    label: 'Pastores',
    gradient: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-500/10'
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

  // Filtrar pastores
  const filteredPastores = useMemo(() => {
    return pastores.filter((pastor: Pastor) => {
      const matchTipo = selectedTipo === 'todos' || pastor.tipo === selectedTipo
      const matchPais = selectedPais === 'todos' || pastor.pais === selectedPais
      const matchRegion = selectedRegion === 'todos' || pastor.region === selectedRegion
      const matchSearch = searchTerm === '' || 
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
          backgroundSize: '60px 60px'
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
                    {filteredPastores.length} de {pastores.length} miembros
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
              {(Object.keys(tipoConfig) as TipoPastor[]).map((tipo) => {
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
              {(Object.keys(tipoConfig) as TipoPastor[]).map((tipo) => {
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
                      <div className={`flex-1 h-px bg-gradient-to-r ${config.gradient} opacity-30 ml-4`} />
                    </div>

                    {/* Cards grid - Tamaño uniforme y compacto */}
                    <div className={`grid gap-4 ${
                      pastoresDelTipo.length === 1 ? 'grid-cols-1 max-w-sm' :
                      pastoresDelTipo.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
                      pastoresDelTipo.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
                      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}>
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

// Componente de tarjeta de pastor
function PastorCard({ pastor, gradient }: { pastor: Pastor; gradient: string }) {
  const fullName = `${pastor.nombre} ${pastor.apellido}`
  const location = [pastor.sede, pastor.region, pastor.pais].filter(Boolean).join(', ')

  return (
    <div className="group h-full">
      <div className="relative h-full flex flex-col">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
        
        {/* Card - Altura fija y compacta */}
        <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 h-full flex flex-col">
          {/* Image - Altura fija con fondo según tipo */}
          <div className="relative h-48 overflow-hidden bg-white/5 flex-shrink-0">
            {pastor.fotoUrl ? (
              <>
                {/* Fondo según tipo */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
                <Image
                  src={pastor.fotoUrl}
                  alt={fullName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 relative z-10"
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                <span className="text-3xl font-bold text-white/30">
                  {pastor.nombre?.[0]}{pastor.apellido?.[0]}
                </span>
              </div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-20 pointer-events-none`} />
            
            {/* Type badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 text-[10px] px-1.5 py-0.5`}>
                {tipoConfig[pastor.tipo]?.label.split(' ')[0] || pastor.tipo}
              </Badge>
            </div>
          </div>

          {/* Content - Altura fija y compacta */}
          <div className="p-3 flex flex-col flex-1 min-h-0">
            <h3 className="text-sm font-bold text-white mb-0.5 truncate">{fullName}</h3>
            <p className={`text-xs font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1.5 truncate`}>
              {pastor.cargo || pastor.ministerio || 'Pastor'}
            </p>
            {location && (
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] mb-2">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-1.5 text-[10px] h-7 mt-auto"
                >
                  <Eye className="h-3 w-3" />
                  Ver Perfil
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#0d1f35] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">{fullName}</DialogTitle>
                  <DialogDescription className={`text-base bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-medium`}>
                    {pastor.cargo || pastor.ministerio || tipoConfig[pastor.tipo]?.label}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Info grid */}
                  <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </div>
                    )}
                    {pastor.ministerio && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {pastor.ministerio}
                      </div>
                    )}
                  </div>
                  
                  {/* Biografía */}
                  {pastor.biografia && (
                    <div>
                      <h4 className="font-bold text-lg mb-3 text-white">Acerca de</h4>
                      <p className="text-white/70 leading-relaxed">{pastor.biografia}</p>
                    </div>
                  )}

                  {/* Trayectoria */}
                  {pastor.trayectoria && (
                    <div>
                      <h4 className="font-bold text-lg mb-3 text-white">Trayectoria Ministerial</h4>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/70 leading-relaxed whitespace-pre-line">{pastor.trayectoria}</p>
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
