'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CredencialPastoral } from '@/lib/api/credenciales-pastorales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { RotateCcw, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CredencialPastoralCardProps {
  credencial: CredencialPastoral
  onEdit?: () => void
}

export function CredencialPastoralCard({ credencial, onEdit }: CredencialPastoralCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const fechaVencimiento = format(
      new Date(credencial.fechaVencimiento),
      'dd/MM/yyyy',
      { locale: es }
    )
    const fechaEmision = format(
      new Date(credencial.fechaEmision),
      'dd/MM/yyyy',
      { locale: es }
    )

    // Obtener datos del pastor
    const nombrePastor = credencial.pastor.nombre || ''
    const apellidoPastor = credencial.pastor.apellido || ''
    const documentoPastor = credencial.pastor.telefono || 'N/A' // Usar teléfono como documento si no hay otro campo
    const nacionalidadPastor = 'Argentina' // Valor por defecto
    const tipoPastor = 'PASTOR' // Valor por defecto

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credencial Pastoral - ${nombrePastor} ${apellidoPastor}</title>
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
            font-size: 14px;
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
          .tipo-pastor {
            font-size: 10px;
            text-align: center;
            font-weight: 600;
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
          .numero-credencial {
            font-size: 10px;
            opacity: 0.9;
            margin-top: 5px;
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
              <div class="photo-placeholder">FOTO</div>
              <div class="tipo-pastor">${tipoPastor} / PASTOR</div>
            </div>
            <div class="info-section">
              <div class="info-row">
                <div class="info-label">Apellido / Surname</div>
                <div class="info-value">${apellidoPastor}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nombre / Name</div>
                <div class="info-value">${nombrePastor}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Número de Credencial</div>
                <div class="info-value">${credencial.numeroCredencial}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nacionalidad / Nationality</div>
                <div class="info-value">${nacionalidadPastor}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Fecha de Emisión</div>
                <div class="info-value">${fechaEmision}</div>
              </div>
            </div>
            <div class="logo-section">AMVA</div>
          </div>
          <div class="footer">
            <div class="footer-title">CREDENCIAL MINISTERIAL INTERNACIONAL</div>
            <div class="footer-address">SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL</div>
          </div>
        </div>

        <!-- DORSO -->
        <div class="credencial credencial-dorso">
          <div class="dorso-content">
            <div class="dorso-header">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">EL CONSEJO EJECUTIVO NACIONAL</div>
            </div>
            <div class="dorso-certificacion">
              CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
            </div>
            <div style="margin: 20px 0;">
              <div style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 5px;">FIRMA PRESIDENTE DEL C.E.N.</div>
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
  const fechaEmision = format(
    new Date(credencial.fechaEmision),
    'dd/MM/yyyy',
    { locale: es }
  )

  const nombrePastor = credencial.pastor.nombre || ''
  const apellidoPastor = credencial.pastor.apellido || ''
  const tipoPastor = 'PASTOR' // Valor por defecto

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Controles */}
      <div className="flex justify-end gap-2 mb-4">
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
              <h1 className="text-sm font-bold tracking-wide text-gray-800 dark:text-gray-100">
                ASOCIACIÓN MISIONERA
              </h1>
              <h1 className="text-sm font-bold tracking-wide text-gray-800 dark:text-gray-100">
                VIDA ABUNDANTE
              </h1>
            </div>

            <div className="flex gap-4 relative">
              {/* Foto */}
              <div className="w-28 flex-shrink-0">
                <div className="w-28 h-32 bg-white rounded border-2 border-gray-400 mb-2 flex items-center justify-center overflow-hidden shadow-md">
                  <span className="text-gray-400 text-[10px] text-center px-2">FOTO</span>
                </div>
                <div className="text-[10px] text-center font-semibold text-gray-800 dark:text-gray-100">
                  {tipoPastor} / PASTOR
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 space-y-2.5">
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Apellido / Surname
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-900 dark:text-white">
                    {apellidoPastor}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Nombre / Name
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-900 dark:text-white">
                    {nombrePastor}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Número de Credencial
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                    {credencial.numeroCredencial}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Fecha de Emisión
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {fechaEmision}
                  </div>
                </div>
              </div>

              {/* Logo Circular con Globo */}
              <div className="absolute top-1 right-1 w-24 h-24 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Globo de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center">
                    <div className="text-white text-2xl font-bold">AMVA</div>
                  </div>
                  {/* Texto alrededor del globo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[6px] text-white font-semibold absolute -top-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      ASOCIACIÓN MISIONERA
                    </div>
                    <div className="text-[6px] text-white font-semibold absolute -bottom-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      VIDA ABUNDANTE
                    </div>
                  </div>
                </div>
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
                <div className="text-center mb-8">
                  <div className="text-xl font-bold mb-3 tracking-wide uppercase">
                    EL CONSEJO EJECUTIVO NACIONAL
                  </div>
                </div>
                <div className="text-base leading-relaxed mb-8 text-center px-4">
                  CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                  MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                </div>
                <div className="mt-12 flex justify-center">
                  <div className="border-b-2 border-white/40 pb-3 w-64 text-center">
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

