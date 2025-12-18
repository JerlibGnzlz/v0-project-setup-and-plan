import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus } from 'lucide-react'

interface PastoresHeaderProps {
  onAddClick: () => void
}

export function PastoresHeader({ onAddClick }: PastoresHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/admin">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-sky-50 dark:hover:bg-sky-500/10"
        >
          <ChevronLeft className="size-5 text-sky-600 dark:text-sky-400" />
        </Button>
      </Link>
      <div className="relative flex-1">
        <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 rounded-xl blur-xl dark:from-sky-500/5 dark:via-emerald-500/5 dark:to-amber-500/5" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
            Estructura Organizacional
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los pastores, directivos y líderes de la organización
          </p>
        </div>
      </div>
      <Button
        onClick={onAddClick}
        className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
      >
        <Plus className="size-4 mr-2" />
        Agregar Pastor
      </Button>
    </div>
  )
}














