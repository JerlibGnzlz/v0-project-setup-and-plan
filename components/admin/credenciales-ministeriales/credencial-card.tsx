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
            align-items: flex-start;
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
            position: absolute;
            top: 2px;
            right: 2px;
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
          .footer {
            margin-top: 6px;
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
            <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px;">
              <div style="flex-shrink: 0;">
                <img src="/mundo.png" alt="AMVA Logo" style="width: 70px; height: 70px; object-fit: contain;" />
              </div>
              <div style="flex: 1;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 3px; color: #0D374E; text-align: left; line-height: 1.2; text-shadow: 0 1px 2px rgba(255,255,255,0.9);">EL CONSEJO EJECUTIVO NACIONAL</div>
                <div style="font-size: 8px; line-height: 1.25; margin-bottom: 3px; color: #0D374E; text-align: left; font-weight: 500; text-shadow: 0 1px 2px rgba(255,255,255,0.9);">
                  CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                </div>
              </div>
            </div>
            
            <!-- FICHERO DE CULTO -->
            <div style="margin-bottom: 6px;">
              <div style="text-align: center; font-size: 7px; font-weight: bold; color: #0D374E; word-break: break-word; text-shadow: 0 1px 2px rgba(255,255,255,0.9); line-height: 1.2;">
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

          {/* Card Container con Flip - Ampliado para mejor visualización del dorso completo */}
          <div className="relative w-full flex justify-center" style={{ perspective: '1000px' }}>
            <div
              className="relative transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                width: '1000px',
                height: '630px',
                minWidth: '1000px',
                minHeight: '630px',
              }}
            >
              {/* FRENTE - Ampliado para mejor visualización del dorso completo */}
              <div
                className="rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  width: '1000px',
                  height: '630px',
                  minWidth: '1000px',
                  minHeight: '630px',
                  maxWidth: '1000px',
                  maxHeight: '630px',
                  padding: '35px',
                  background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
                }}
              >
            {/* Header */}
            <div className="text-center mb-2" style={{ marginBottom: '9px' }}>
              <h1 className="font-bold tracking-wide" style={{ fontSize: '19.5px', lineHeight: '1.2', margin: 0, color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                ASOCIACIÓN MISIONERA
              </h1>
              <h1 className="font-bold tracking-wide" style={{ fontSize: '19.5px', lineHeight: '1.2', margin: 0, color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                VIDA ABUNDANTE
              </h1>
            </div>

            <div className="flex relative" style={{ gap: '12px', alignItems: 'flex-start' }}>
              {/* Foto */}
              <div className="flex-shrink-0" style={{ width: '132px' }}>
                <div className="bg-white rounded border-2 border-gray-400 mb-1.5 flex items-center justify-center overflow-hidden shadow-md" style={{ width: '132px', height: '162px', borderRadius: '6px' }}>
                  {credencial.fotoUrl ? (
                    <Image
                      src={credencial.fotoUrl}
                      alt="Foto"
                      width={132}
                      height={162}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-center px-1" style={{ fontSize: '10.5px' }}>FOTO</span>
                  )}
                </div>
                <div className="text-center font-semibold whitespace-nowrap" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                  {credencial.tipoPastor} / SHEPHERD
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 space-y-0.75 min-w-0" style={{ paddingTop: '0px' }}>
                <div>
                  <div className="mb-0.75 font-medium" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    Apellido / Surname
                  </div>
                  <div className="font-bold uppercase break-words" style={{ fontSize: '15px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                    {credencial.apellido}
                  </div>
                </div>
                <div>
                  <div className="mb-0.75 font-medium" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    Nombre / Name
                  </div>
                  <div className="font-bold uppercase break-words" style={{ fontSize: '15px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                    {credencial.nombre}
                  </div>
                </div>
                <div>
                  <div className="mb-0.75 font-medium" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    Documento / Document
                  </div>
                  <div className="font-bold text-black font-mono break-words" style={{ fontSize: '15px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                    {credencial.documento}
                  </div>
                </div>
                <div>
                  <div className="mb-0.75 font-medium" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    Nacionalidad / Nationality
                  </div>
                  <div className="font-bold break-words" style={{ fontSize: '15px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                    {credencial.nacionalidad}
                  </div>
                </div>
                <div>
                  <div className="mb-0.75 font-medium" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    Fecha de nacimiento / Birthdate
                  </div>
                  <div className="font-bold break-words" style={{ fontSize: '15px', lineHeight: '1.2', color: '#000000', fontWeight: 700 }}>
                    {fechaNacimiento}
                  </div>
                </div>
              </div>

              {/* Logo AMVA - Ampliado visualmente */}
              <div className="absolute top-0 right-0 flex items-center justify-center" style={{ width: '195px', height: '195px', top: '3px', right: '3px' }}>
                <Image
                  src="/mundo.png"
                  alt="AMVA Logo"
                  width={195}
                  height={195}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center" style={{ marginTop: '9px' }}>
              <div className="font-bold mb-0.75" style={{ fontSize: '18px', lineHeight: '1.2', marginBottom: '3px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                CREDENCIAL MINISTERIAL INTERNACIONAL
              </div>
              <div style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL
              </div>
            </div>
          </div>

              {/* DORSO - Ampliado para mejor visualización del dorso completo */}
              <div
                className="absolute inset-0 rounded-lg text-white shadow-xl border-2 border-blue-300/30 overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  width: '1000px',
                  height: '630px',
                  minWidth: '1000px',
                  minHeight: '630px',
                  maxWidth: '1000px',
                  maxHeight: '630px',
                  padding: '35px',
                  background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 10%, #3b82f6 25%, #2563eb 40%, #1e40af 60%, #1e3a8a 75%, #1e40af 90%, #2563eb 100%)',
                }}
              >
            <div className="h-full flex flex-col" style={{ height: '100%', justifyContent: 'space-between' }}>
              {/* Header con Logo y Texto al lado - Logo ampliado visualmente */}
              <div className="flex items-start mb-1.5" style={{ gap: '15px', marginBottom: '9px' }}>
                <div className="flex-shrink-0">
                  <Image
                    src="/mundo.png"
                    alt="AMVA Logo"
                    width={135}
                    height={135}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="font-bold mb-1 tracking-wide uppercase text-left" style={{ fontSize: '16.5px', lineHeight: '1.2', marginBottom: '4.5px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    EL CONSEJO EJECUTIVO NACIONAL
                  </div>
                  <div className="leading-relaxed mb-1 text-left" style={{ fontSize: '12px', lineHeight: '1.25', marginBottom: '4.5px', color: '#0D374E', fontWeight: 500, textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>
                    CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                    MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                  </div>
                </div>
              </div>

              {/* FICHERO DE CULTO */}
              <div className="mb-1.5" style={{ marginBottom: '9px' }}>
                <div className="font-bold text-center break-words" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.2' }}>
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA 000-318 C.U.I.T.30-68748687-7
                </div>
              </div>

              {/* Footer: Firma (izquierda) y QR + Fecha (derecha) */}
              <div className="mt-auto flex justify-between items-end" style={{ paddingTop: '6px', gap: '15px' }}>
                {/* Firma - Izquierda */}
                <div className="flex-shrink-0" style={{ width: '232.5px' }}>
                  <div className="flex flex-col items-center justify-center" style={{ padding: '6px' }}>
                    <div className="w-full flex items-center justify-center overflow-hidden mb-0.75" style={{ height: '67.5px', marginBottom: '3px' }}>
                      <Image
                        src="/firma-presidente.png"
                        alt="Firma Presidente"
                        width={225}
                        height={67.5}
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
                            placeholder.style.fontSize = '10.5px'
                            placeholder.textContent = 'Firma Presidente'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    </div>
                    <div className="font-semibold text-center break-words" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.2' }}>FIRMA PRESIDENTE DEL C.E.N.</div>
                  </div>
                </div>

                {/* QR + Fecha - Derecha */}
                <div className="flex-shrink-0 flex flex-col items-end" style={{ gap: '6px' }}>
                  <div className="bg-white border-2 border-white/30 flex items-center justify-center" style={{ width: '108px', height: '108px', borderRadius: '3px' }}>
                    <span className="text-white/30 text-center" style={{ fontSize: '10.5px' }}>QR CODE</span>
                  </div>
                  <div className="font-bold text-right break-words" style={{ fontSize: '10.5px', color: '#0D374E', fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.9)', lineHeight: '1.2' }}>VENCE: {fechaVencimiento}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
