'use client'

import { Heart, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionFormatBar, sectionTitleGradientClass } from './section-format-bar'
import { useConfiguracionLanding } from '@/lib/hooks/use-configuracion-landing'
import { useState } from 'react'
import { toast } from 'sonner'

export function OfrendasSection() {
  const { data: configuracion, isLoading } = useConfiguracionLanding()
  const [copied, setCopied] = useState(false)

  const getJustificacionClass = (
    value: string | undefined
  ): 'text-left' | 'text-center' | 'text-right' | 'text-justify' => {
    if (value === 'center') return 'text-center'
    if (value === 'right') return 'text-right'
    if (value === 'justify') return 'text-justify'
    return 'text-left'
  }

  const handleCopyCuenta = () => {
    const cuenta = configuracion?.ofrendasCuentaBancaria?.trim()
    if (!cuenta) return
    navigator.clipboard.writeText(cuenta).then(() => {
      setCopied(true)
      toast.success('Número de cuenta copiado')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // La sección siempre se muestra; el contenido y la cuenta se leen de la configuración.
  if (isLoading) return null

  const titulo = configuracion?.ofrendasTitulo || 'Ofrendas para la Misión'
  const contenido =
    configuracion?.ofrendasContenido ||
    'En AMVA (Asociación Misionera Vida Abundante) creemos que la fe se expresa plenamente cuando se comparte con los demás y se traduce en acciones que transforman vidas.'
  const cuenta = configuracion?.ofrendasCuentaBancaria?.trim()

  return (
    <section id="ofrendas" className="relative py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a1628]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 50% 50% at 50% 30%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 20% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 50%)
            `,
          }}
        />
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
          badgeIcon={Heart}
          badgeLabel="Tu aporte transforma"
          title={
            <>
              <span className={sectionTitleGradientClass}>{titulo}</span>
            </>
          }
          subtitle=""
          subtitleClassName={cn(
            'leading-snug text-sm',
            getJustificacionClass(configuracion?.ofrendasJustificacion)
          )}
          bottomMargin="compact"
        />

        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative p-4 md:p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div
                className={cn(
                  'text-white/80 text-sm leading-snug whitespace-pre-line space-y-2',
                  getJustificacionClass(configuracion?.ofrendasJustificacion)
                )}
              >
                {contenido.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {cuenta && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-medium text-white/70 mb-1.5">
                    Transferencia bancaria
                  </p>
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <code className="text-sm font-mono text-emerald-300 break-all">
                      {cuenta}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyCuenta}
                      className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-xs font-medium"
                      aria-label="Copiar número de cuenta"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1/4 -left-32 w-48 h-48 bg-pink-500/10 rounded-full blur-[80px] animate-blob" />
      <div className="absolute top-1/3 -right-32 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] animate-blob animation-delay-2000" />
    </section>
  )
}
