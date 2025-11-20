import Link from "next/link"
import { Facebook, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">VA</span>
              </div>
              <span className="font-bold text-xl">Vida Abundante</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Llevando formación pastoral y vida abundante a las naciones
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#inicio" className="opacity-80 hover:opacity-100 transition-opacity">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="#nosotros" className="opacity-80 hover:opacity-100 transition-opacity">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="#directiva" className="opacity-80 hover:opacity-100 transition-opacity">
                  Directiva
                </Link>
              </li>
              <li>
                <Link href="#convenciones" className="opacity-80 hover:opacity-100 transition-opacity">
                  Convenciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="opacity-80">info@vidaabundante.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="opacity-80">+52 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="opacity-80">Argentina</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} Vida Abundante. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
