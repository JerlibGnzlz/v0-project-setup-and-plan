'use client'

import { Card, CardContent } from '@/components/ui/card'
import { type Inscripcion } from '@/lib/api/inscripciones'
import { getPagosInfo } from '@/lib/hooks/use-inscripcion-utils'
import { InscripcionInfoSection } from './inscripcion-info-section'
import { InscripcionPagosSection } from './inscripcion-pagos-section'

interface InscripcionCardProps {
    inscripcion: Inscripcion
    convencion?: { id: string; costo?: number | string }
    onEditar: (inscripcion: Inscripcion) => void
    onCancelar: (inscripcion: Inscripcion) => void
    onRehabilitar: (inscripcionId: string) => Promise<void>
    onCrearPago: (inscripcion: Inscripcion & { numeroCuota: number }, pago?: unknown) => void
    isRehabilitando: boolean
    cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
}

export function InscripcionCard({
    inscripcion,
    convencion,
    onEditar,
    onCancelar,
    onRehabilitar,
    onCrearPago,
    isRehabilitando,
    cardRefs,
}: InscripcionCardProps) {
    const pagosInfo = getPagosInfo(inscripcion, convencion)

    return (
        <Card
            key={inscripcion.id}
            ref={el => {
                if (el) cardRefs.current[inscripcion.id] = el
            }}
            data-inscripcion-id={inscripcion.id}
            className="border-amber-200/50 dark:border-amber-500/20 transition-all"
        >
            <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <InscripcionInfoSection
                        inscripcion={inscripcion}
                        pagosInfo={pagosInfo}
                        onEditar={onEditar}
                        onCancelar={onCancelar}
                        onRehabilitar={onRehabilitar}
                        isRehabilitando={isRehabilitando}
                    />
                    <InscripcionPagosSection
                        inscripcion={inscripcion}
                        pagosInfo={pagosInfo}
                        onCrearPago={onCrearPago}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

