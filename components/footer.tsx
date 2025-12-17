'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook } from 'lucide-react'
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
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
              {/* Brand */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14">
                    <Image src="/mundo.png" alt="AMVA Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg block">ASOCIACION MISIONERA VIDA ABUNDANTE</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">
                  Llevando formación pastoral y vida abundante a las naciones a través de
                  convenciones, seminarios y recursos de formación continua.
                </p>

                {/* Download App Button */}
                <div className="max-w-xs">
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
              <div className="space-y-6">
                <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-blue-500 rounded-full" />
                  Enlaces Rápidos
                </h3>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {quickLinks.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-sky-400 transition-colors duration-300 flex-shrink-0" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              {/* Copyright */}
              <p className="text-white/60 text-sm">
                &copy; {new Date().getFullYear()} Asociación Misionera Vida Abundante. Todos los derechos reservados.
              </p>

              {/* Developer Credit */}
              <p className="text-white/50 text-sm">
                Desarrollado por{' '}
                <span className="text-emerald-400 font-medium">Jerlib Gonzalez</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
