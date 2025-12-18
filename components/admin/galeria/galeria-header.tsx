import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export function GaleriaHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
          Galería Multimedia
        </h1>
        <p className="text-muted-foreground mt-2">
          Administra las imágenes y videos que se muestran en la landing page
        </p>
      </div>
      <Link href="/admin">
        <Button variant="outline" size="sm">
          <ChevronLeft className="size-4 mr-2" />
          Volver
        </Button>
      </Link>
    </div>
  )
}














