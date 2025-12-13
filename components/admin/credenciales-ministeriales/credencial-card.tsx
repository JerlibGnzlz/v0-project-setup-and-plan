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

    // Parsear fechas correctamente para evitar problemas de timezone
    // Las fechas vienen en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
    const parseDate = (dateString: string): Date => {
      // Si viene en formato YYYY-MM-DD, parsearlo correctamente
      if (dateString.includes('T')) {
        // Formato ISO completo, extraer solo la parte de fecha
        const datePart = dateString.split('T')[0]
        const [year, month, day] = datePart.split('-').map(Number)
        return new Date(year, month - 1, day) // Mes es 0-indexed
      } else {
        // Formato YYYY-MM-DD
        const [year, month, day] = dateString.split('-').map(Number)
        return new Date(year, month - 1, day) // Mes es 0-indexed
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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credencial Ministerial - ${credencial.nombre} ${credencial.apellido}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @media print {
            @page {
              size: 400px 252px;
              margin: 0;
            }
            html, body {
              width: 85.6mm;
              height: 53.98mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            body {
              display: block;
              background: transparent;
            }
            .credencial {
              width: 85.6mm !important;
              height: 53.98mm !important;
              min-width: 85.6mm !important;
              min-height: 53.98mm !important;
              max-width: 85.6mm !important;
              max-height: 53.98mm !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 3mm !important;
              page-break-after: always;
              page-break-inside: avoid;
            }
            .credencial:last-child {
              page-break-after: auto;
            }
          }
          @media screen {
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              gap: 20px;
              justify-content: center;
              background: #f5f5f5;
            }
          }
          .credencial {
            width: 400px;
            height: 252px;
            background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%);
            border-radius: 8px;
            padding: 14px;
            color: white;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            overflow: hidden;
            display: block;
          }
          .credencial-dorso {
            background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%);
          }
          .header {
            text-align: center;
            margin-bottom: 6px;
          }
          .header h1 {
            font-size: 13px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 0.5px;
            color: #0D374E;
            line-height: 1.2;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .content {
            display: flex;
            gap: 8px;
            position: relative;
            align-items: center;
            justify-content: center;
            width: 100%;
            flex: 1;
          }
          .photo-section {
            width: 88px;
            flex-shrink: 0;
          }
          .photo-placeholder {
            width: 88px;
            height: 108px;
            background: white;
            border: 2px solid rgba(156, 163, 175, 1);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 7px;
            text-align: center;
            margin-bottom: 4px;
            overflow: hidden;
          }
          .photo-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
          }
          .tipo-pastor {
            font-size: 7px;
            text-align: center;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #0D374E;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .info-section {
            flex: 1;
            min-width: 0;
            padding-top: 0;
          }
          .info-row {
            margin-bottom: 2px;
          }
          .info-label {
            font-size: 7px;
            margin-bottom: 2px;
            color: #0D374E;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .info-value {
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            color: #000000;
            line-height: 1.2;
            word-break: break-word;
          }
          .logo-section {
            flex-shrink: 0;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-section img {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }
          .credencial {
            display: flex;
            flex-direction: column;
          }
          .footer {
            margin-top: auto;
            padding-top: 8px;
            text-align: center;
          }
          .footer-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
            color: #0D374E;
            line-height: 1.2;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .footer-address {
            font-size: 7px;
            color: #0D374E;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .dorso-content {
            padding: 14px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
          }
          .dorso-header-logo {
            flex-shrink: 0;
          }
          .dorso-header-logo img {
            width: 70px;
            height: 70px;
            object-fit: contain;
          }
          .dorso-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #0D374E;
            line-height: 1.2;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .dorso-certificacion {
            font-size: 8px;
            line-height: 1.25;
            margin-bottom: 3px;
            color: #0D374E;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
          }
          .dorso-fichero-text {
            font-size: 7px;
            font-weight: bold;
            color: #0D374E;
            word-break: break-word;
            text-align: center;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
            line-height: 1.2;
          }
          .dorso-firma-box {
            width: 155px;
            padding: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .dorso-firma-box img {
            width: 100%;
            height: 45px;
            object-fit: contain;
            display: block;
            margin-bottom: 2px;
          }
          .dorso-firma-text {
            font-size: 7px;
            font-weight: 600;
            text-align: center;
            color: #0D374E;
            word-break: break-word;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
            line-height: 1.2;
          }
          .dorso-qr-box {
            width: 72px;
            height: 72px;
            background: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .dorso-qr-text {
            color: rgba(255,255,255,0.3);
            font-size: 7px;
            text-align: center;
          }
          .dorso-vence-text {
            font-size: 7px;
            font-weight: bold;
            text-align: right;
            color: #0D374E;
            word-break: break-word;
            text-shadow: 0 1px 2px rgba(255,255,255,0.9);
            line-height: 1.2;
          }
        </style>
      </head>
      <body>
        <!-- FRENTE -->
        <div class="credencial" style="width: 400px; height: 252px; min-width: 400px; min-height: 252px; max-width: 400px; max-height: 252px;">
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
        <div class="credencial credencial-dorso" style="width: 400px; height: 252px; min-width: 400px; min-height: 252px; max-width: 400px; max-height: 252px;">
          <div class="dorso-content">
            <!-- Header con Logo y Texto al lado -->
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 6px;">
  <div style="flex-shrink: 0;">
    <img src="/mundo.png" alt="AMVA Logo" style="width: 70px; height: 70px; object-fit: contain; display: block;" />
  </div>
  <div style="flex: 1;">
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #0D374E; text-align: center; line-height: 1.3; text-shadow: 0 1px 2px rgba(255,255,255,0.9);">
      EL CONSEJO EJECUTIVO NACIONAL
    </div>
    <div style="font-size: 11px; line-height: 1.4; margin-bottom: 3px; color: #0D374E; text-align: center; font-weight: 500; text-shadow: 0 1px 2px rgba(255,255,255,0.9);">
      CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
    </div>
  </div>
</div>
            
            <!-- FICHERO DE CULTO -->
            <div style="margin-bottom: 6px;">
              <div style="text-align: center; font-size: 8px; font-weight: bold; color: #0D374E; word-break: break-word; text-shadow: 0 1px 2px rgba(255,255,255,0.9); line-height: 1.2;">
                FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
              </div>
            </div>      
            
            <!-- Footer: Firma (izquierda) y QR + Fecha (derecha) -->
            <div style="margin-top: auto; padding-top: 4px; display: flex; justify-content: space-between; align-items: flex-end; gap: 10px;">
              <!-- Firma - Izquierda -->
              <div style="flex-shrink: 0; width: 155px;">
                <div style="padding: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="width: 100%; height: 45px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
                    <img src="/firma-presidente.png" alt="Firma Presidente" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'color: rgba(255,255,255,0.5); font-size: 7px;\'>Firma Presidente</span>';" />
                  </div>
                  <div style="font-size: 7px; font-weight: 600; text-align: center; color: #0D374E; word-break: break-word; text-shadow: 0 1px 2px rgba(255,255,255,0.9); line-height: 1.2;">FIRMA PRESIDENTE DEL C.E.N.</div>
                </div>
              </div>
              
              <!-- QR + Fecha - Derecha -->
              <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <div style="width: 72px; height: 72px; background: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 2px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: rgba(255,255,255,0.3); font-size: 7px; text-align: center;">QR CODE</span>
                </div>
                <div style="font-size: 7px; font-weight: bold; text-align: right; color: #0D374E; word-break: break-word; text-shadow: 0 1px 2px rgba(255,255,255,0.9); line-height: 1.2;">VENCE: ${fechaVencimiento}</div>
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

  // Parsear fechas correctamente para evitar problemas de timezone
  const parseDate = (dateString: string): Date => {
    // Si viene en formato YYYY-MM-DD, parsearlo correctamente
    if (dateString.includes('T')) {
      // Formato ISO completo, extraer solo la parte de fecha
      const datePart = dateString.split('T')[0]
      const [year, month, day] = datePart.split('-').map(Number)
      return new Date(year, month - 1, day) // Mes es 0-indexed
    } else {
      // Formato YYYY-MM-DD
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day) // Mes es 0-indexed
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
    <div className="relative w-full max-w-7xl mx-auto">
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

      {/* Card Container con Flip - Tamaño ampliado para mejor visualización */}
      <div className="relative w-full flex justify-center" style={{ perspective: '1000px' }}>
        <div
          className="relative transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            width: '800px',
            height: '504px',
            minWidth: '800px',
            minHeight: '504px',
          }}
        >
          {/* FRENTE - Tamaño ampliado para mejor visualización */}
          <div
            className="rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              width: '800px',
              height: '504px',
              minWidth: '800px',
              minHeight: '504px',
              maxWidth: '800px',
              maxHeight: '504px',
              padding: '26px',
              background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
            }}
          >
            {/* Header */}
            <div className="text-center" style={{ marginBottom: '12px' }}>
              <h1 className="font-bold tracking-wide" style={{ fontSize: '24px', lineHeight: '1.1', margin: 0, color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)', letterSpacing: '0.4px' }}>
                ASOCIACIÓN MISIONERA
              </h1>
              <h1 className="font-bold tracking-wide" style={{ fontSize: '24px', lineHeight: '1.1', margin: 0, color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)', letterSpacing: '0.4px' }}>
                VIDA ABUNDANTE
              </h1>
            </div>

            {/* Sección principal sin borde amarillo - Centrada */}
            <div className="flex justify-center items-center" style={{ marginBottom: 'auto', flex: 1 }}>
              <div className="flex relative w-full" style={{ gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
                {/* Foto */}
                <div className="flex-shrink-0" style={{ width: '180px' }}>
                  <div className="bg-white rounded border-2 border-gray-400 mb-1 flex items-center justify-center overflow-hidden shadow-md" style={{ width: '180px', height: '216px', borderRadius: '6px' }}>
                    {credencial.fotoUrl ? (
                      <Image
                        src={credencial.fotoUrl}
                        alt="Foto"
                        width={180}
                        height={216}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-center px-1" style={{ fontSize: '13px' }}>FOTO</span>
                    )}
                  </div>
                  <div className="text-center font-semibold whitespace-nowrap" style={{ fontSize: '13px', color: '#0D374E', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.1' }}>
                    {credencial.tipoPastor} / SHEPHERD
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1 space-y-1 min-w-0" style={{ paddingTop: '0px', maxWidth: '530px' }}>
                  <div>
                    <div className="mb-1 font-medium" style={{ fontSize: '13px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                      Apellido / Surname
                    </div>
                    <div className="font-bold uppercase break-words" style={{ fontSize: '18px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                      {credencial.apellido}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-medium" style={{ fontSize: '13px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                      Nombre / Name
                    </div>
                    <div className="font-bold uppercase break-words" style={{ fontSize: '18px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                      {credencial.nombre}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-medium" style={{ fontSize: '13px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                      Documento / Document
                    </div>
                    <div className="font-bold text-black font-mono break-words" style={{ fontSize: '18px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                      {credencial.documento}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-medium" style={{ fontSize: '13px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                      Nacionalidad / Nationality
                    </div>
                    <div className="font-bold break-words" style={{ fontSize: '18px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                      {credencial.nacionalidad}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-medium" style={{ fontSize: '13px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                      Fecha de nacimiento / Birthdate
                    </div>
                    <div className="font-bold break-words" style={{ fontSize: '18px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                      {fechaNacimiento}
                    </div>
                  </div>
                </div>

                {/* Logo AMVA - Centrado y más grande */}
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '216px', height: '216px' }}>
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={216}
                    height={216}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Footer - Pie de página */}
            <div className="text-center" style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <div className="font-bold mb-1" style={{ fontSize: '22px', lineHeight: '1.1', marginBottom: '3px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                CREDENCIAL MINISTERIAL INTERNACIONAL
              </div>
              <div style={{ fontSize: '13px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL
              </div>
            </div>
          </div>

          {/* DORSO - Tamaño ampliado para mejor visualización */}
          <div
            className="absolute inset-0 rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              width: '800px',
              height: '504px',
              minWidth: '800px',
              minHeight: '504px',
              maxWidth: '800px',
              maxHeight: '504px',
              padding: '26px',
              background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
            }}
          >
            <div className="h-full flex flex-col" style={{ height: '100%' }}>
              {/* Header con Logo y Texto al lado */}
              <div className="flex items-start" style={{ gap: '16px', marginBottom: '8px' }}>
                <div className="flex-shrink-0">
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={140}
                    height={140}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="font-bold tracking-wide uppercase text-left" style={{ fontSize: '22px', lineHeight: '1.15', marginBottom: '4px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    EL CONSEJO EJECUTIVO NACIONAL
                  </div>
                  <div className="leading-relaxed text-left" style={{ fontSize: '15px', lineHeight: '1.3', marginBottom: '0px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                    MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                  </div>
                </div>
              </div>

              {/* FICHERO DE CULTO - Posicionado justo después del texto de certificación */}
              <div style={{ marginBottom: '8px', marginTop: '4px' }}>
                <div className="font-bold text-center break-words" style={{ fontSize: '15px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.2' }}>
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
                </div>
              </div>

              {/* Footer: Firma (izquierda) y QR + Fecha (derecha) - Subido para mejor distribución */}
              <div className="flex justify-between items-end" style={{ marginTop: 'auto', gap: '16px', paddingTop: '0px' }}>
                {/* Firma - Izquierda */}
                <div className="flex-shrink-0" style={{ width: '220px' }}>
                  <div className="flex flex-col items-center justify-center" style={{ padding: '6px' }}>
                    <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: '66px', marginBottom: '4px' }}>
                      <Image
                        src="/firma-presidente.png"
                        alt="Firma Presidente"
                        width={216}
                        height={66}
                        className="object-contain max-w-full max-h-full"
                        unoptimized
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('span')) {
                            const placeholder = document.createElement('span')
                            placeholder.className = 'text-white/50'
                            placeholder.style.fontSize = '15px'
                            placeholder.textContent = 'Firma Presidente'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    </div>
                    <div className="font-semibold text-center break-words" style={{ fontSize: '15px', color: '#0D374E', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.1' }}>FIRMA PRESIDENTE DEL C.E.N.</div>
                  </div>
                </div>

                {/* QR + Fecha - Derecha */}
                <div className="flex-shrink-0 flex flex-col items-end" style={{ gap: '7px' }}>
                  <div className="bg-white border-2 border-white/30 flex items-center justify-center" style={{ width: '103px', height: '103px', borderRadius: '4px' }}>
                    <span className="text-white/30 text-center" style={{ fontSize: '15px' }}>QR CODE</span>
                  </div>
                  <div className="font-bold text-right break-words" style={{ fontSize: '15px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.1' }}>VENCE: {fechaVencimiento}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
