'use client'

import { useEffect, useState, useMemo } from 'react'
import { Target, Eye, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedCounter } from './animated-counter'
import { SectionFormatBar, sectionTitleGradientClass } from './section-format-bar'
import { useSedesCount } from '@/lib/hooks/use-sedes'
import { useConfiguracionLanding } from '@/lib/hooks/use-configuracion-landing'

export function AboutSection() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const { data: totalPaisesResponse } = useSedesCount()
  const { data: configuracion, isLoading: isLoadingConfig } =
    useConfiguracionLanding()

  // Extraer el número del response de axios
  const totalPaises =
    typeof totalPaisesResponse === 'number'
      ? totalPaisesResponse
      : totalPaisesResponse?.data || 0

  // Usar configuración dinámica o valores por defecto
  const stats = useMemo(() => {
    if (isLoadingConfig || !configuracion) {
      // Valores por defecto mientras carga
      return [
        {
          end: 500,
          suffix: '+',
          label: 'Pastores Formados',
          color: 'from-sky-400 to-blue-500',
        },
        {
          end: totalPaises,
          suffix: '',
          label: 'Países',
          color: 'from-emerald-400 to-teal-500',
        },
        {
          end: 15,
          suffix: '+',
          label: 'Años de Ministerio',
          color: 'from-amber-400 to-orange-500',
        },
        {
          end: 50,
          suffix: '+',
          label: 'Convenciones',
          color: 'from-sky-400 to-emerald-500',
        },
      ]
    }

    // Usar configuración dinámica
    const paises =
      configuracion.paisesOverride !== null
        ? configuracion.paisesOverride
        : totalPaises

    return [
      {
        end: configuracion.pastoresFormados,
        suffix: configuracion.pastoresFormadosSuffix,
        label: 'Pastores Formados',
        color: 'from-sky-400 to-blue-500',
      },
      {
        end: paises,
        suffix: '',
        label: 'Países',
        color: 'from-emerald-400 to-teal-500',
      },
      {
        end: configuracion.anosMinisterio,
        suffix: configuracion.anosMinisterioSuffix,
        label: 'Años de Ministerio',
        color: 'from-amber-400 to-orange-500',
      },
      {
        end: configuracion.convenciones,
        suffix: configuracion.convencionesSuffix,
        label: 'Convenciones',
        color: 'from-sky-400 to-emerald-500',
      },
    ]
  }, [configuracion, totalPaises, isLoadingConfig])

  const getJustificacionClass = (
    value: string | undefined
  ): 'text-left' | 'text-center' | 'text-right' | 'text-justify' => {
    if (value === 'center') return 'text-center'
    if (value === 'right') return 'text-right'
    if (value === 'justify') return 'text-justify'
    return 'text-left'
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section id="nosotros" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a1628]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse 50% 50% at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
            `,
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionFormatBar
          badgeIcon={Sparkles}
          badgeLabel="Nuestra Identidad"
          title={
            configuracion?.titulo
              ?.split(' ')
              .map((word, index) => {
                if (index === 0) return word
                return (
                  <span key={index} className={sectionTitleGradientClass}>
                    {' '}
                    {word}
                  </span>
                )
              }) ?? (
                <>
                  Quiénes{' '}
                  <span className={sectionTitleGradientClass}>Somos</span>
                </>
              )
          }
          subtitle={
            configuracion?.subtitulo ||
            'Una organización misionera comprometida con la formación integral de líderes pastorales para el servicio del Reino'
          }
          subtitleClassName={cn(
            'leading-relaxed',
            getJustificacionClass(configuracion?.subtituloJustificacion)
          )}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="relative group">
              {/* Glow effect - applies gradient colors from stat.color */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
              />
              <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div
                  className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Misión */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {configuracion?.misionTitulo || 'Nuestra Misión'}
                </h3>
              </div>
              <p
                className={cn(
                  'text-white/70 leading-relaxed',
                  getJustificacionClass(configuracion?.misionJustificacion)
                )}
              >
                {configuracion?.misionContenido ||
                  'Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.'}
              </p>
            </div>
          </div>

          {/* Visión */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {configuracion?.visionTitulo || 'Nuestra Visión'}
                </h3>
              </div>
              <p
                className={cn(
                  'text-white/70 leading-relaxed',
                  getJustificacionClass(configuracion?.visionJustificacion)
                )}
              >
                {configuracion?.visionContenido ||
                  'Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
    </section>
  )
}
