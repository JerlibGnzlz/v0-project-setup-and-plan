'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CredencialMinisterial } from '@/lib/api/credenciales-ministeriales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CredencialFlipCardCompactProps {
  credencial: CredencialMinisterial
  className?: string
}

export function CredencialFlipCardCompact({
  credencial,
  className,
}: CredencialFlipCardCompactProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Parsear fechas correctamente para evitar problemas de timezone
  const parseDate = (dateString: string): Date => {
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0]
      const [year, month, day] = datePart.split('-').map(Number)
      return new Date(year, month - 1, day)
    } else {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
  }

  const fechaVencimiento = format(
    parseDate(credencial.fechaVencimiento),
    'dd/MM/yyyy',
    { locale: es }
  )
  const fechaNacimiento = format(
    parseDate(credencial.fechaNacimiento),
    'dd/MM/yyyy',
    { locale: es }
  )

  return (
    <div className={cn('relative w-full', className)}>
      {/* Botón para voltear */}
      <div className="absolute -top-10 right-0 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-7 text-xs px-2"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          {isFlipped ? 'Frente' : 'Dorso'}
        </Button>
      </div>

      {/* Card Container con Flip */}
      <div
        className="relative w-full flex justify-center"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative transition-transform duration-700 cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            width: '100%',
            maxWidth: '400px',
            height: '252px',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* FRENTE */}
          <div
            className="rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              width: '100%',
              height: '252px',
              padding: '14px',
              background:
                'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
            }}
          >
            {/* Header */}
            <div className="text-center" style={{ marginBottom: '6px' }}>
              <h1
                className="font-bold tracking-wide"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.1',
                  margin: 0,
                  color: '#0D374E',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                  letterSpacing: '0.5px',
                }}
              >
                ASOCIACIÓN MISIONERA
              </h1>
              <h1
                className="font-bold tracking-wide"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.1',
                  margin: 0,
                  color: '#0D374E',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                  letterSpacing: '0.5px',
                }}
              >
                VIDA ABUNDANTE
              </h1>
            </div>

            {/* Sección principal */}
            <div className="flex justify-center items-center" style={{ flex: 1 }}>
              <div
                className="flex relative w-full"
                style={{
                  gap: '8px',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Foto */}
                <div className="flex-shrink-0" style={{ width: '88px' }}>
                  <div
                    className="bg-white rounded border-2 border-gray-400 mb-1 flex items-center justify-center overflow-hidden shadow-md"
                    style={{
                      width: '88px',
                      height: '108px',
                      borderRadius: '4px',
                    }}
                  >
                    {credencial.fotoUrl ? (
                      <Image
                        src={credencial.fotoUrl}
                        alt="Foto"
                        width={88}
                        height={108}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span
                        className="text-gray-400 text-center px-1"
                        style={{ fontSize: '7px' }}
                      >
                        FOTO
                      </span>
                    )}
                  </div>
                  <div
                    className="text-center font-semibold whitespace-nowrap"
                    style={{
                      fontSize: '7px',
                      color: '#0D374E',
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      lineHeight: '1.1',
                    }}
                  >
                    {credencial.tipoPastor} / SHEPHERD
                  </div>
                </div>

                {/* Información */}
                <div
                  className="flex-1 space-y-0.5 min-w-0"
                  style={{ paddingTop: '0px', maxWidth: '200px' }}
                >
                  <div>
                    <div
                      className="mb-0.5 font-medium"
                      style={{
                        fontSize: '7px',
                        color: '#0D374E',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      Apellido / Surname
                    </div>
                    <div
                      className="font-bold uppercase break-words"
                      style={{
                        fontSize: '10px',
                        lineHeight: '1.2',
                        color: '#000000',
                        fontWeight: 700,
                      }}
                    >
                      {credencial.apellido}
                    </div>
                  </div>
                  <div>
                    <div
                      className="mb-0.5 font-medium"
                      style={{
                        fontSize: '7px',
                        color: '#0D374E',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      Nombre / Name
                    </div>
                    <div
                      className="font-bold uppercase break-words"
                      style={{
                        fontSize: '10px',
                        lineHeight: '1.2',
                        color: '#000000',
                        fontWeight: 700,
                      }}
                    >
                      {credencial.nombre}
                    </div>
                  </div>
                  <div>
                    <div
                      className="mb-0.5 font-medium"
                      style={{
                        fontSize: '7px',
                        color: '#0D374E',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      Documento / Document
                    </div>
                    <div
                      className="font-bold text-black font-mono break-words"
                      style={{
                        fontSize: '10px',
                        lineHeight: '1.2',
                        color: '#000000',
                        fontWeight: 700,
                      }}
                    >
                      {credencial.documento}
                    </div>
                  </div>
                  <div>
                    <div
                      className="mb-0.5 font-medium"
                      style={{
                        fontSize: '7px',
                        color: '#0D374E',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      Nacionalidad / Nationality
                    </div>
                    <div
                      className="font-bold break-words"
                      style={{
                        fontSize: '10px',
                        lineHeight: '1.2',
                        color: '#000000',
                        fontWeight: 700,
                      }}
                    >
                      {credencial.nacionalidad}
                    </div>
                  </div>
                  <div>
                    <div
                      className="mb-0.5 font-medium"
                      style={{
                        fontSize: '7px',
                        color: '#0D374E',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      Fecha de nacimiento / Birthdate
                    </div>
                    <div
                      className="font-bold break-words"
                      style={{
                        fontSize: '10px',
                        lineHeight: '1.2',
                        color: '#000000',
                        fontWeight: 700,
                      }}
                    >
                      {fechaNacimiento}
                    </div>
                  </div>
                </div>

                {/* Logo AMVA */}
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: '100px', height: '100px' }}
                >
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center" style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <div
                className="font-bold mb-1"
                style={{
                  fontSize: '12px',
                  lineHeight: '1.1',
                  marginBottom: '2px',
                  color: '#0D374E',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                }}
              >
                CREDENCIAL MINISTERIAL INTERNACIONAL
              </div>
              <div
                style={{
                  fontSize: '7px',
                  color: '#0D374E',
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                }}
              >
                SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL
              </div>
            </div>
          </div>

          {/* DORSO */}
          <div
            className="absolute inset-0 rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              width: '100%',
              height: '252px',
              padding: '14px',
              background:
                'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
            }}
          >
            <div className="h-full flex flex-col" style={{ height: '100%' }}>
              {/* Header con Logo y Texto */}
              <div className="flex items-start" style={{ gap: '10px', marginBottom: '6px' }}>
                <div className="flex-shrink-0">
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={70}
                    height={70}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div
                    className="font-bold tracking-wide uppercase text-left"
                    style={{
                      fontSize: '11px',
                      lineHeight: '1.15',
                      marginBottom: '3px',
                      color: '#0D374E',
                      fontWeight: 700,
                      textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                    }}
                  >
                    EL CONSEJO EJECUTIVO NACIONAL
                  </div>
                  <div
                    className="leading-relaxed text-left"
                    style={{
                      fontSize: '8px',
                      lineHeight: '1.25',
                      marginBottom: '0px',
                      color: '#0D374E',
                      fontWeight: 500,
                      textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                    }}
                  >
                    CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                    MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                  </div>
                </div>
              </div>

              {/* FICHERO DE CULTO */}
              <div style={{ marginBottom: '6px', marginTop: '4px' }}>
                <div
                  className="font-bold text-center break-words"
                  style={{
                    fontSize: '7px',
                    color: '#0D374E',
                    fontWeight: 700,
                    textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                    lineHeight: '1.2',
                  }}
                >
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
                </div>
              </div>

              {/* Footer: Firma y QR + Fecha */}
              <div
                className="flex justify-between items-end"
                style={{ marginTop: 'auto', gap: '10px', paddingTop: '4px' }}
              >
                {/* Firma - Izquierda */}
                <div className="flex-shrink-0" style={{ width: '155px' }}>
                  <div
                    className="flex flex-col items-center justify-center"
                    style={{ padding: '4px' }}
                  >
                    <div
                      className="w-full flex items-center justify-center overflow-hidden"
                      style={{ height: '45px', marginBottom: '2px' }}
                    >
                      <Image
                        src="/firma-presidente.png"
                        alt="Firma Presidente"
                        width={151}
                        height={45}
                        className="object-contain max-w-full max-h-full"
                        unoptimized
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          filter: 'brightness(0.3) contrast(1.5)',
                          WebkitFilter: 'brightness(0.3) contrast(1.5)',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('span')) {
                            const placeholder = document.createElement('span')
                            placeholder.className = 'text-white/50'
                            placeholder.style.fontSize = '7px'
                            placeholder.textContent = 'Firma Presidente'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    </div>
                    <div
                      className="font-semibold text-center break-words"
                      style={{
                        fontSize: '7px',
                        color: '#0D374E',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                        lineHeight: '1.1',
                      }}
                    >
                      FIRMA PRESIDENTE DEL C.E.N.
                    </div>
                  </div>
                </div>

                {/* QR + Fecha - Derecha */}
                <div className="flex-shrink-0 flex flex-col items-end" style={{ gap: '4px' }}>
                  <div
                    className="bg-white border-2 border-white/30 flex items-center justify-center overflow-hidden"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '2px',
                      padding: '4px',
                    }}
                  >
                    <Image
                      src="/qr.png"
                      alt="QR Code"
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div
                    className="font-bold text-right break-words"
                    style={{
                      fontSize: '7px',
                      color: '#0D374E',
                      fontWeight: 700,
                      textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      lineHeight: '1.1',
                    }}
                  >
                    VENCE: {fechaVencimiento}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

