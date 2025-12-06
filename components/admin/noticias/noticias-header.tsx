import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus, Newspaper } from 'lucide-react'

interface NoticiasHeaderProps {
  onAddClick: () => void
}

export function NoticiasHeader({ onAddClick }: NoticiasHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/admin">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
        >
          <ChevronLeft className="size-5 text-emerald-600 dark:text-emerald-400" />
        </Button>
      </Link>
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-emerald-600" />
            Gestión de Noticias
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra las noticias y anuncios de la organización
          </p>
        </div>
        <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Noticia
        </Button>
      </div>
    </div>
  )
}

