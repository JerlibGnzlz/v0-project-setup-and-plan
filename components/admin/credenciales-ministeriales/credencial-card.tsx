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
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            gap: 20px;
            justify-content: center;
          }
          .credencial {
            width: 400px;
            height: 250px;
            background: linear-gradient(135deg, #0D374E 0%, #0a2d3d 25%, #082229 50%, #0D374E 75%, #0a2d3d 100%);
            border-radius: 12px;
            padding: 15px;
            color: white;
            position: relative;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .credencial-dorso {
            background: linear-gradient(135deg, #0D374E 0%, #0a2d3d 25%, #082229 50%, #0D374E 75%, #0a2d3d 100%);
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
          }
          .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 1px;
            color: #0D374E;
          }
          .content {
            display: flex;
            gap: 15px;
          }
          .photo-section {
            width: 100px;
          }
          .photo-placeholder {
            width: 100px;
            height: 120px;
            background: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3b82f6;
            font-size: 10px;
            text-align: center;
            margin-bottom: 8px;
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
            margin-bottom: 8px;
            font-size: 11px;
          }
          .info-label {
            font-size: 8px;
            margin-bottom: 2px;
            color: #0D374E;
          }
          .info-value {
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            color: #000000;
          }
          .logo-section {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #60a5fa;
          }
          .footer {
            position: absolute;
            bottom: 15px;
            left: 0;
            right: 0;
            text-align: center;
          }
          .footer-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #0D374E;
          }
          .footer-address {
            font-size: 9px;
            color: #0D374E;
          }
          .dorso-content {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
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
              <div class="tipo-pastor">${credencial.tipoPastor} / ${credencial.tipoPastor === 'PASTORA' ? 'SHEPHERD' : 'PASTOR'}</div>
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
              <img src="/mundo.png" alt="AMVA Logo" style="width: 120px; height: 120px; object-fit: contain;" />
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
            <!-- Header con Logo y QR -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
              <div style="flex-shrink: 0;">
                <img src="/mundo.png" alt="AMVA Logo" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
              <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                <div style="width: 100px; height: 100px; background: white; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;">
                  <span style="color: rgba(255,255,255,0.3); font-size: 10px; text-align: center;">QR CODE</span>
                </div>
                <div style="font-size: 10px; font-weight: bold; text-align: right;">VENCE: ${fechaVencimiento}</div>
              </div>
            </div>
            
            <!-- Título y Certificación (Todo arriba) -->
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">EL CONSEJO EJECUTIVO NACIONAL</div>
              <div style="font-size: 12px; line-height: 1.5; margin-bottom: 10px;">
                CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
              </div>
              <div style="text-align: left; font-size: 11px; font-weight: bold; margin-top: 10px; white-space: nowrap;">
                FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
              </div>
            </div>
            
            <!-- Firma (Abajo) -->
            <div style="margin-top: auto; padding-top: 15px;">
              <div style="text-align: center;">
                <div style="width: 250px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.3); padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="width: 100%; height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
                    <img src="/firma-presidente.png" alt="Firma Presidente" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'color: rgba(255,255,255,0.5); font-size: 10px;\'>Firma</span>';" />
                  </div>
                  <div style="font-size: 11px; font-weight: bold; text-align: center;">FIRMA PRESIDENTE DEL C.E.N.</div>
                </div>
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
              background: 'linear-gradient(135deg, #0D374E 0%, #0a2d3d 25%, #082229 50%, #0D374E 75%, #0a2d3d 100%)',
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
                  {credencial.tipoPastor} / {credencial.tipoPastor === 'PASTORA' ? 'SHEPHERD' : 'PASTOR'}
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
            className="absolute inset-0 w-full rounded-lg p-4 text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '320px',
              maxHeight: '320px',
              background: 'linear-gradient(135deg, #0D374E 0%, #0a2d3d 25%, #082229 50%, #0D374E 75%, #0a2d3d 100%)',
            }}
          >
            <div className="h-full flex flex-col">
              {/* Header con Logo y QR */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-shrink-0">
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <div className="w-24 h-24 bg-white border-2 border-white/30 flex items-center justify-center">
                    <span className="text-white/30 text-[10px] text-center">QR CODE</span>
                  </div>
                  <div className="text-xs font-bold text-right">VENCE: {fechaVencimiento}</div>
                </div>
              </div>

              {/* Título, Certificación y FICHERO DE CULTO (Todo arriba) */}
              <div className="text-center mb-4">
                <div className="text-xl font-bold mb-3 tracking-wide uppercase">
                  EL CONSEJO EJECUTIVO NACIONAL
                </div>
                <div className="text-sm leading-relaxed mb-3">
                  CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                  MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                </div>
                <div className="text-xs font-bold whitespace-nowrap text-left mt-3">
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
                </div>
              </div>

              {/* Firma (Abajo) */}
              <div className="mt-auto pt-4">
                <div className="flex justify-center">
                  <div className="w-[250px] bg-white/5 border border-white/40 p-3 flex flex-col items-center justify-center">
                    <div className="w-full h-16 flex items-center justify-center overflow-hidden mb-2">
                      <Image
                        src="/firma-presidente.png"
                        alt="Firma Presidente"
                        width={200}
                        height={60}
                        className="object-contain max-w-full max-h-full"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('span')) {
                            const placeholder = document.createElement('span')
                            placeholder.className = 'text-white/50 text-[10px]'
                            placeholder.textContent = 'Firma'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-center">FIRMA PRESIDENTE DEL C.E.N.</div>
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

