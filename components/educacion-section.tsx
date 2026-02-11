'use client'

import { useState, useCallback } from 'react'
import { BookOpen, GraduationCap, Users, Globe, Mail, Phone, Copy, Check } from 'lucide-react'
import { useEducacionProgramas } from '@/lib/hooks/use-educacion-programas'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const CLAVE_STYLE: Record<
  string,
  { icon: LucideIcon; gradient: string; image: string }
> = {
  instituto_biblico: {
    icon: GraduationCap,
    gradient: 'from-sky-400 to-blue-500',
    image: '/biblico.png',
  },
  escuela_capellania: {
    icon: Users,
    gradient: 'from-emerald-500 to-teal-500',
    image: '/capellania.png',
  },
  misiones: {
    icon: Globe,
    gradient: 'from-amber-500 to-orange-500',
    image: '/mundo.png',
  },
}

function useCopyToClipboard() {
  const [copied, setCopied] = useState<'email' | 'phone' | null>(null)

  const copy = useCallback(async (text: string, kind: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      toast.success('Copiado al portapapeles')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }, [])

  return { copy, copied }
}

export function EducacionSection() {
  const { data, isLoading } = useEducacionProgramas()
  const { copy, copied } = useCopyToClipboard()
  const list = (data?.programas ?? []).filter((p) => p.clave !== 'misiones')
  const contactEmail = data?.contactEmail ?? 'educacion@vidaabundante.org'
  const contactTelefono = data?.contactTelefono ?? '+54 11 xxxx-xxxx'
  const telHref = contactTelefono.replace(/\s/g, '')

  return (
    <section id="educacion" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d1f35]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gradient-to-t from-blue-500/20 to-transparent rounded-full blur-[100px]" />
        </div>
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
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80 font-medium">Formación de Excelencia</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Educación{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Ministerial
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            Formando líderes comprometidos con la excelencia y el servicio a través de programas
            educativos de calidad
          </p>
        </div>

        {/* 3 programas con campos dinámicos (modalidad, inscripción, cuota mensual) */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/5 border border-white/10 h-80 animate-pulse"
                />
              ))
            ) : (
              list.map((programa) => {
                const style = CLAVE_STYLE[programa.clave] ?? CLAVE_STYLE.instituto_biblico
                const Icon = style.icon
                return (
                  <div key={programa.id} className="relative group">
                    <div
                      className={`absolute -inset-1 bg-gradient-to-r ${style.gradient} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500`}
                    />
                    <div className="relative h-full rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col">
                      <div className="relative h-36 overflow-hidden bg-white/5 flex items-center justify-center p-4">
                        <img
                          src={style.image}
                          alt={programa.titulo}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-transparent to-transparent opacity-70" />
                        <div
                          className={`absolute bottom-3 left-4 p-2.5 rounded-xl bg-gradient-to-r ${style.gradient} shadow-lg`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="text-lg font-bold text-white mb-4">{programa.titulo}</h4>

                        <div className="space-y-4 text-sm flex-1">
                          <div>
                            <h5 className="font-semibold text-white mb-2">
                              Estructura académica
                            </h5>
                            <p className="text-white/70">
                              Duración: {programa.duracion ?? '2 años.'}
                            </p>
                            <p className="text-white/70 mt-1">
                              <span className="font-medium text-white/90">Modalidad:</span>{' '}
                              {programa.modalidad}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-white mb-2">Plan de inversión</h5>
                            <p className="text-white/70">
                              <span className="font-medium text-white/90">Inscripción:</span>{' '}
                              {programa.inscripcion}
                            </p>
                            <p className="text-white/70">
                              <span className="font-medium text-white/90">Cuota mensual:</span>{' '}
                              {programa.cuotaMensual}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-white mb-2">Requisitos</h5>
                            <p className="text-white/70">
                              {programa.requisitos ??
                                'Internet, dispositivo electrónico y compromiso con estudios, trabajos y exámenes.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Contact Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Información e Inscripciones
              </h3>
              <p className="text-white/60 mb-6 max-w-xl mx-auto">
                Para más información sobre nuestros programas educativos, requisitos de admisión y
                proceso de inscripción, contáctanos:
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-white hover:underline select-all"
                  >
                    {contactEmail}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => copy(contactEmail, 'email')}
                    aria-label="Copiar correo"
                  >
                    {copied === 'email' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${telHref}`}
                    className="text-white hover:underline select-all"
                  >
                    {contactTelefono}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => copy(contactTelefono, 'phone')}
                    aria-label="Copiar teléfono"
                  >
                    {copied === 'phone' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
    </section>
  )
}
