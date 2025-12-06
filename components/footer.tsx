'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react'
import { DownloadAppButton } from '@/components/download-app-button'

const quickLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#sedes', label: 'Sedes' },
  { href: '#mision', label: 'Misión' },
  { href: '#directiva', label: 'Directiva' },
  { href: '#noticias', label: 'Noticias' },
  { href: '#convenciones', label: 'Convención' },
  { href: '#galeria', label: 'Galería' },
  { href: '#educacion', label: 'Educación' },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-sky-500' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-amber-500' },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#060d17]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-sky-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-emerald-500/20 rounded-full blur-[100px]" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12">
                  <Image src="/mundo.png" alt="AMVA Logo" fill className="object-contain" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg block">A.M.V.A</span>
                  <span className="text-xs text-white/50">Vida Abundante</span>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Llevando formación pastoral y vida abundante a las naciones a través de
                convenciones, seminarios y recursos de formación continua.
              </p>

              {/* Download App Button */}
              <div className="mb-6">
                <DownloadAppButton />
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map(social => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 transition-all duration-300 ${social.color} hover:border-transparent hover:text-white`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-blue-500 rounded-full" />
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                {quickLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-sky-400 transition-colors duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                Contacto
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:info@vidaabundante.org"
                    className="flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300 text-sm"
                  >
                    <div className="p-2 rounded-lg bg-white/5">
                      <Mail className="w-4 h-4 text-sky-400" />
                    </div>
                    info@vidaabundante.org
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+5411xxxxxxxx"
                    className="flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300 text-sm"
                  >
                    <div className="p-2 rounded-lg bg-white/5">
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </div>
                    +54 11 xxxx-xxxx
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="p-2 rounded-lg bg-white/5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  Buenos Aires, Argentina
                </li>
              </ul>
            </div>

            {/* Newsletter / CTA */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                Mantente Conectado
              </h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Únete a nuestra comunidad y recibe actualizaciones sobre eventos y convenciones.
              </p>
              <Link
                href="#inscripcion"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
              >
                Inscríbete
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              {/* Copyright */}
              <p className="text-white/50 text-sm flex items-center gap-1">
                &copy; {new Date().getFullYear()} Asociación Misionera Vida Abundante. Hecho con{' '}
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> para el Reino.
              </p>

              {/* Separator - hidden on mobile */}
              <span className="hidden sm:inline text-white/20">|</span>

              {/* Developer Credit */}
              <p className="text-white/40 text-xs sm:text-sm">
                Diseñado y desarrollado por{' '}
                <span className="text-emerald-400 font-medium">Jerlib Gonzalez</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
