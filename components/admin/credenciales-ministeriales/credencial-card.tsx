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
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 12px;
            padding: 20px;
            color: white;
            position: relative;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .credencial-dorso {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
          }
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 1px;
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
            font-size: 9px;
            text-align: center;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .info-section {
            flex: 1;
          }
          .info-row {
            margin-bottom: 8px;
            font-size: 11px;
          }
          .info-label {
            font-size: 9px;
            opacity: 0.9;
            margin-bottom: 2px;
          }
          .info-value {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
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
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .footer-address {
            font-size: 9px;
            opacity: 0.9;
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
            <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
              <div style="flex-shrink: 0;">
                <img src="/mundo.png" alt="AMVA Logo" style="width: 100px; height: 100px; object-fit: contain;" />
              </div>
              <div style="flex: 1;">
                <div class="dorso-header" style="text-align: left; margin-bottom: 15px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">EL CONSEJO EJECUTIVO NACIONAL</div>
                </div>
                <div class="dorso-certificacion" style="text-align: left;">
                  CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                </div>
              </div>
            </div>
            <div style="margin: 20px 0;">
              <div style="text-align: left; font-size: 11px; font-weight: bold; margin-bottom: 8px; white-space: nowrap;">
                FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
              </div>
              <div style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 5px; text-align: left;">FIRMA PRESIDENTE DEL C.E.N.</div>
            </div>
            <div class="dorso-fecha">
              VENCE: ${fechaVencimiento}
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
            className="w-full bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 rounded-lg p-6 text-gray-800 dark:text-gray-100 shadow-xl border-2 border-blue-200 dark:border-blue-700"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              minHeight: '320px',
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold tracking-wide text-gray-800 dark:text-gray-100">
                ASOCIACIÓN MISIONERA
              </h1>
              <h1 className="text-lg font-bold tracking-wide text-gray-800 dark:text-gray-100">
                VIDA ABUNDANTE
              </h1>
            </div>

            <div className="flex gap-4 relative">
              {/* Foto */}
              <div className="w-28 flex-shrink-0">
                <div className="w-28 h-32 bg-white rounded border-2 border-gray-400 mb-2 flex items-center justify-center overflow-hidden shadow-md">
                  {credencial.fotoUrl ? (
                    <Image
                      src={credencial.fotoUrl}
                      alt="Foto"
                      width={112}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-[10px] text-center px-2">FOTO</span>
                  )}
                </div>
                <div className="text-[9px] text-center font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {credencial.tipoPastor} / {credencial.tipoPastor === 'PASTORA' ? 'SHEPHERD' : 'PASTOR'}
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 space-y-2.5">
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Apellido / Surname
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-900 dark:text-white">
                    {credencial.apellido}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Nombre / Name
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-900 dark:text-white">
                    {credencial.nombre}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Documento / Document
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                    {credencial.documento}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Nacionalidad / Nationality
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {credencial.nacionalidad}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Fecha de nacimiento / Birthdate
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {fechaNacimiento}
                  </div>
                </div>
              </div>

              {/* Logo AMVA */}
              <div className="absolute top-1 right-1 w-32 h-32 flex items-center justify-center">
                <Image
                  src="/mundo.png"
                  alt="AMVA Logo"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="text-lg font-bold mb-1.5 text-gray-900 dark:text-white">
                CREDENCIAL MINISTERIAL INTERNACIONAL
              </div>
              <div className="text-[10px] text-gray-700 dark:text-gray-200">
                SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL
              </div>
            </div>
          </div>

          {/* DORSO */}
          <div
            className="absolute inset-0 w-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-lg p-8 text-white shadow-xl border-2 border-blue-600 dark:border-blue-700"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '320px',
            }}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-5 mb-6">
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
                    <div className="text-xl font-bold mb-3 tracking-wide uppercase text-left">
                      EL CONSEJO EJECUTIVO NACIONAL
                    </div>
                    <div className="text-base leading-relaxed text-left">
                      CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                      MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="text-xs font-bold mb-3 whitespace-nowrap text-left">
                    FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
                  </div>
                  <div className="border-b-2 border-white/40 pb-3 text-left">
                    <div className="text-sm font-semibold">FIRMA PRESIDENTE DEL C.E.N.</div>
                  </div>
                </div>
              </div>
              <div className="text-right text-lg font-bold mt-8">
                VENCE: {fechaVencimiento}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

