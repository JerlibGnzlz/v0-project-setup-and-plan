'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CredencialMinisterial } from '@/lib/api/credenciales-ministeriales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { RotateCcw, Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CredencialCardProps {
  credencial: CredencialMinisterial
  onEdit?: () => void
  onBackToList?: () => void
}

export function CredencialCard({ credencial, onEdit, onBackToList }: CredencialCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const fechaVencimiento = format(
      new Date(credencial.fechaVencimiento),
      'dd/MM/yyyy',
      { locale: es }
    )
    const fechaNacimiento = format(
      new Date(credencial.fechaNacimiento),
      'dd/MM/yyyy',
      { locale: es }
    )

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credencial Ministerial - ${credencial.nombre} ${credencial.apellido}</title>
        <style>
          @media print {
            @page {
              size: 85.6mm 53.98mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .credencial {
              width: 85.6mm !important;
              height: 53.98mm !important;
              border-radius: 0 !important;
              box-shadow: none !important;
            }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            gap: 20px;
            justify-content: center;
            background: #f5f5f5;
          }
          .credencial {
            width: 85.6mm;
            height: 53.98mm;
            background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%);
            border-radius: 4mm;
            padding: 3mm;
            color: white;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            overflow: hidden;
          }
          .credencial-dorso {
            background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%);
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
          }
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 1px;
            color: #0D374E;
          }
          .content {
            display: flex;
            gap: 12px;
            position: relative;
          }
          .photo-section {
            width: 96px;
            flex-shrink: 0;
          }
          .photo-placeholder {
            width: 96px;
            height: 112px;
            background: white;
            border: 2px solid rgba(156, 163, 175, 1);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 10px;
            text-align: center;
            margin-bottom: 6px;
            overflow: hidden;
          }
          .photo-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
          }
          .tipo-pastor {
            font-size: 8px;
            text-align: center;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #0D374E;
          }
          .info-section {
            flex: 1;
          }
          .info-row {
            margin-bottom: 10px;
          }
          .info-label {
            font-size: 9px;
            margin-bottom: 2px;
            color: #0D374E;
            opacity: 0.8;
          }
          .info-value {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            color: #000000;
          }
          .logo-section {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 112px;
            height: 112px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-section img {
            width: 112px;
            height: 112px;
            object-fit: contain;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
          }
          .footer-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 6px;
            color: #0D374E;
          }
          .footer-address {
            font-size: 10px;
            color: #0D374E;
            opacity: 0.8;
          }
          .dorso-content {
            padding: 16px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
          }
          .dorso-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .dorso-certificacion {
            font-size: 11px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .dorso-fecha {
            text-align: right;
            font-size: 12px;
            font-weight: bold;
            margin-top: auto;
          }
        </style>
      </head>
      <body>
        <!-- FRENTE -->
        <div class="credencial">
          <div class="header">
            <h1>ASOCIACIÓN MISIONERA</h1>
            <h1>VIDA ABUNDANTE</h1>
          </div>
          <div class="content">
            <div class="photo-section">
              <div class="photo-placeholder">
                ${credencial.fotoUrl ? `<img src="${credencial.fotoUrl}" alt="Foto" />` : 'FOTO'}
              </div>
              <div class="tipo-pastor">${credencial.tipoPastor} / SHEPHERD</div>
            </div>
            <div class="info-section">
              <div class="info-row">
                <div class="info-label">Apellido / Surname</div>
                <div class="info-value">${credencial.apellido}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nombre / Name</div>
                <div class="info-value">${credencial.nombre}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Documento / Document</div>
                <div class="info-value">${credencial.documento}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nacionalidad / Nationality</div>
                <div class="info-value">${credencial.nacionalidad}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Fecha de nacimiento / Birthdate</div>
                <div class="info-value">${fechaNacimiento}</div>
              </div>
            </div>
            <div class="logo-section">
              <img src="/mundo.png" alt="AMVA Logo" />
            </div>
          </div>
          <div class="footer">
            <div class="footer-title">CREDENCIAL MINISTERIAL INTERNACIONAL</div>
            <div class="footer-address">SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL</div>
          </div>
        </div>

        <!-- DORSO -->
        <div class="credencial credencial-dorso">
          <div class="dorso-content">
            <!-- Header con Logo y Texto al lado -->
            <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 10px;">
              <div style="flex-shrink: 0;">
                <img src="/mundo.png" alt="AMVA Logo" style="width: 100px; height: 100px; object-fit: contain;" />
              </div>
              <div style="flex: 1;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0D374E; text-align: left;">EL CONSEJO EJECUTIVO NACIONAL</div>
                <div style="font-size: 11px; line-height: 1.4; margin-bottom: 8px; color: #0D374E; text-align: left;">
                  CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                </div>
              </div>
            </div>
            
            <!-- FICHERO DE CULTO -->
            <div style="margin-bottom: 10px;">
              <div style="text-align: left; font-size: 10px; font-weight: bold; white-space: nowrap; color: #0D374E; overflow: hidden;">
                FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
              </div>
            </div>
            
            <!-- Footer: Firma (izquierda) y QR + Fecha (derecha) -->
            <div style="margin-top: auto; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; gap: 15px;">
              <!-- Firma - Izquierda -->
              <div style="flex-shrink: 0;">
                <div style="width: 200px; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="width: 100%; height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
                    <img src="/firma-presidente.png" alt="Firma Presidente" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'color: rgba(255,255,255,0.5); font-size: 9px;\'>Firma</span>';" />
                  </div>
                  <div style="font-size: 10px; font-weight: bold; text-align: center; color: #0D374E;">FIRMA PRESIDENTE DEL C.E.N.</div>
                </div>
              </div>
              
              <!-- QR + Fecha - Derecha -->
              <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                <div style="width: 96px; height: 96px; background: white; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;">
                  <span style="color: rgba(255,255,255,0.3); font-size: 9px; text-align: center;">QR CODE</span>
                </div>
                <div style="font-size: 10px; font-weight: bold; text-align: right; color: #0D374E;">VENCE: ${fechaVencimiento}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const fechaVencimiento = format(
    new Date(credencial.fechaVencimiento),
    'dd/MM/yyyy',
    { locale: es }
  )
  const fechaNacimiento = format(
    new Date(credencial.fechaNacimiento),
    'dd/MM/yyyy',
    { locale: es }
  )

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Controles */}
      <div className="flex justify-between items-center gap-2 mb-4">
        {onBackToList && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Lista
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isFlipped ? 'Ver Frente' : 'Ver Dorso'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          {onEdit && (
            <Button variant="default" size="sm" onClick={onEdit}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Card Container con Flip */}
      <div className="relative w-full" style={{ perspective: '1000px' }}>
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRENTE */}
          <div
            className="w-full rounded-lg p-4 text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              minHeight: '320px',
              maxHeight: '320px',
              background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-3">
              <h1 className="text-base font-bold tracking-wide text-[#0D374E]">
                ASOCIACIÓN MISIONERA
              </h1>
              <h1 className="text-base font-bold tracking-wide text-[#0D374E]">
                VIDA ABUNDANTE
              </h1>
            </div>

            <div className="flex gap-3 relative">
              {/* Foto */}
              <div className="w-24 flex-shrink-0">
                <div className="w-24 h-28 bg-white rounded border-2 border-gray-400 mb-1.5 flex items-center justify-center overflow-hidden shadow-md">
                  {credencial.fotoUrl ? (
                    <Image
                      src={credencial.fotoUrl}
                      alt="Foto"
                      width={96}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-[10px] text-center px-2">FOTO</span>
                  )}
                </div>
                <div className="text-[8px] text-center font-semibold text-[#0D374E] whitespace-nowrap">
                  {credencial.tipoPastor} / SHEPHERD
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 space-y-2 min-w-0">
                <div>
                  <div className="text-[8px] text-[#0D374E] mb-0.5 font-medium">
                    Apellido / Surname
                  </div>
                  <div className="text-xs font-bold uppercase text-black truncate">
                    {credencial.apellido}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] text-[#0D374E] mb-0.5 font-medium">
                    Nombre / Name
                  </div>
                  <div className="text-xs font-bold uppercase text-black truncate">
                    {credencial.nombre}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] text-[#0D374E] mb-0.5 font-medium">
                    Documento / Document
                  </div>
                  <div className="text-xs font-bold text-black font-mono truncate">
                    {credencial.documento}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] text-[#0D374E] mb-0.5 font-medium">
                    Nacionalidad / Nationality
                  </div>
                  <div className="text-xs font-bold text-black truncate">
                    {credencial.nacionalidad}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] text-[#0D374E] mb-0.5 font-medium">
                    Fecha de nacimiento / Birthdate
                  </div>
                  <div className="text-xs font-bold text-black truncate">
                    {fechaNacimiento}
                  </div>
                </div>
              </div>

              {/* Logo AMVA */}
              <div className="absolute top-0 right-0 w-28 h-28 flex items-center justify-center">
                <Image
                  src="/mundo.png"
                  alt="AMVA Logo"
                  width={112}
                  height={112}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <div className="text-sm font-bold mb-1 text-[#0D374E]">
                CREDENCIAL MINISTERIAL INTERNACIONAL
              </div>
              <div className="text-[9px] text-[#0D374E]">
                SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL
              </div>
            </div>
          </div>

          {/* DORSO */}
          <div
            className="absolute inset-0 w-full rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              width: '85.6mm',
              height: '53.98mm',
              minWidth: '85.6mm',
              minHeight: '53.98mm',
              maxWidth: '85.6mm',
              maxHeight: '53.98mm',
              padding: '3mm',
              background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
            }}
          >
            <div className="h-full flex flex-col">
              {/* Header con Logo y Texto al lado */}
              <div className="flex items-start gap-4 mb-2">
                <div className="flex-shrink-0">
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold mb-2 tracking-wide uppercase text-[#0D374E] text-left">
                    EL CONSEJO EJECUTIVO NACIONAL
                  </div>
                  <div className="text-xs leading-relaxed mb-2 text-[#0D374E] text-left">
                    CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                    MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                  </div>
                </div>
              </div>

              {/* FICHERO DE CULTO */}
              <div className="mb-2 flex-1 min-h-0">
                <div className="text-[10px] font-bold whitespace-nowrap text-left text-[#0D374E] overflow-hidden">
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
                </div>
              </div>

              {/* Footer: Firma (izquierda) y QR + Fecha (derecha) */}
              <div className="mt-auto pt-4 flex justify-between items-end gap-4">
                {/* Firma - Izquierda */}
                <div className="flex-shrink-0">
                  <div className="w-[200px] p-2 flex flex-col items-center justify-center">
                    <div className="w-full h-12 flex items-center justify-center overflow-hidden mb-1">
                      <Image
                        src="/firma-presidente.png"
                        alt="Firma Presidente"
                        width={180}
                        height={48}
                        className="object-contain max-w-full max-h-full"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('span')) {
                            const placeholder = document.createElement('span')
                            placeholder.className = 'text-white/50 text-[9px]'
                            placeholder.textContent = 'Firma'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-semibold text-center text-[#0D374E]">FIRMA PRESIDENTE DEL C.E.N.</div>
                  </div>
                </div>

                {/* QR + Fecha - Derecha */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                  <div className="w-24 h-24 bg-white border-2 border-white/30 flex items-center justify-center">
                    <span className="text-white/30 text-[9px] text-center">QR CODE</span>
                  </div>
                  <div className="text-[10px] font-bold text-right text-[#0D374E]">VENCE: {fechaVencimiento}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

