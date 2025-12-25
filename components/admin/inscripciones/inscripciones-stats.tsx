'use client'

import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, Sparkles, Calendar, CheckCircle2 } from 'lucide-react'

interface InscripcionesStatsProps {
    total: number
    nuevas: number
    hoy: number
    confirmadas: number
}

export function InscripcionesStats({
    total,
    nuevas,
    hoy,
    confirmadas,
}: InscripcionesStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{total}</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nuevas (24h)</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {nuevas}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Hoy</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{hoy}</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-lg">
                            <Calendar className="size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {confirmadas}
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}























