'use client'

import type { Noticia } from '@/lib/api/noticias'

interface NoticiasStatsProps {
  noticias: Noticia[]
}

export function NoticiasStats({ noticias }: NoticiasStatsProps) {
  const total = noticias.length
  const publicadas = noticias.filter(n => n.publicado).length
  const borradores = noticias.filter(n => !n.publicado).length
  const destacadas = noticias.filter(n => n.destacado).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold text-foreground">{total}</p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Publicadas</p>
        <p className="text-2xl font-bold text-emerald-600">{publicadas}</p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Borradores</p>
        <p className="text-2xl font-bold text-amber-600">{borradores}</p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Destacadas</p>
        <p className="text-2xl font-bold text-purple-600">{destacadas}</p>
      </div>
    </div>
  )
}




























