'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronRight, Sparkles } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')
  const [scrolled, setScrolled] = useState(false)
  const navContainerRef = useRef<HTMLDivElement>(null)
  const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = ['inicio', 'sedes', 'nosotros', 'directiva', 'pastores', 'galeria', 'educacion']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)

    if (element) {
      const offsetTop = element.offsetTop - 80
      const startPosition = window.scrollY
      const distance = offsetTop - startPosition
      const duration = 1200
      let start: number | null = null

      const smoothScrollAnimation = (currentTime: number) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)

        const easeInOutCubic = (t: number) => {
          return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        window.scrollTo(0, startPosition + distance * easeInOutCubic(progress))

        if (progress < 1) {
          requestAnimationFrame(smoothScrollAnimation)
        }
      }

      requestAnimationFrame(smoothScrollAnimation)
    }

    setIsOpen(false)
  }

  const navLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#sedes', label: 'Sedes' },
    { href: '#nosotros', label: 'Nosotros' },
    { href: '#directiva', label: 'Directiva' },
    { href: '#pastores', label: 'Pastores' },
    { href: '#galeria', label: 'Galería' },
    { href: '#educacion', label: 'Educación' },
  ]

  return (
    <>
      {/* Floating Navbar */}
      <nav
        className={`fixed z-50 transition-all duration-700 ease-out ${
          scrolled
            ? 'top-4 left-4 right-4 mx-auto max-w-7xl'
            : 'top-0 left-0 right-0'
        }`}
      >
        <div
          className={`transition-all duration-700 ease-out ${
            scrolled
              ? 'bg-[#0a1628]/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10'
              : 'bg-[#0a1628]/60 backdrop-blur-xl border-b border-white/5'
          }`}
        >
          <div className={`container mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-700 ease-out ${
            scrolled ? 'h-16' : 'h-[72px]'
          }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/mundo.png"
                  alt="Logo AMVA"
                  width={64}
                  height={64}
                  className={`object-contain transition-all duration-700 ease-out group-hover:scale-105 ${
                    scrolled ? 'w-12 h-12' : 'w-14 h-14 sm:w-16 sm:h-16'
                  }`}
                />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className={`font-bold text-white leading-tight transition-all duration-700 ease-out ${
                  scrolled ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                }`}>
                  <span className="hidden sm:inline">Asociación Misionera</span>
                  <span className="sm:hidden">A.M.V.A</span>
                </span>
                <span className={`hidden sm:block font-bold bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent leading-tight transition-all duration-700 ease-out ${
                  scrolled ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                }`}>
                  Vida Abundante
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div ref={navContainerRef} className="hidden lg:flex items-center gap-1 relative">
              {navLinks.map((link) => {
                const sectionId = link.href.replace('#', '')
                const isActive = activeSection === sectionId

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    ref={(el) => { navLinksRef.current[sectionId] = el }}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
                    )}
                  </Link>
                )
              })}

              {/* CTA Button with gradient */}
              <Button
                asChild
                className="ml-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 border-0"
              >
                <Link href="#inscripcion" onClick={(e) => handleNavClick(e, '#inscripcion')} className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Inscríbete
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out origin-center ${
                    isOpen ? 'rotate-45 translate-y-[7px]' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-0 scale-0' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out origin-center ${
                    isOpen ? '-rotate-45 -translate-y-[7px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        style={{ top: scrolled ? '76px' : '72px' }}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden fixed right-0 z-40 w-[300px] sm:w-[350px] bg-[#0d1f35]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          top: scrolled ? '76px' : '72px',
          height: scrolled ? 'calc(100vh - 76px)' : 'calc(100vh - 72px)'
        }}
      >
        <nav className="flex flex-col p-6 gap-2 overflow-y-auto h-full">
          {navLinks.map((link, index) => {
            const sectionId = link.href.replace('#', '')
            const isActive = activeSection === sectionId

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`group flex items-center justify-between py-3 px-4 text-lg font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'hover:bg-white/5 text-white/70'
                } ${isOpen ? 'animate-in slide-in-from-right-4 fade-in' : ''}`}
                style={{
                  animationDelay: isOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                <span>{link.label}</span>
                <ChevronRight className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                }`} />
              </Link>
            )
          })}

          <Button
            asChild
            size="lg"
            className={`mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg border-0 ${
              isOpen ? 'animate-in slide-in-from-right-4 fade-in' : ''
            }`}
            style={{
              animationDelay: isOpen ? `${navLinks.length * 50}ms` : '0ms',
            }}
          >
            <Link href="#inscripcion" onClick={(e) => handleNavClick(e, '#inscripcion')} className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Inscríbete Ahora
            </Link>
          </Button>
        </nav>
      </div>
    </>
  )
}
