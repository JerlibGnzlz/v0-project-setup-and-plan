'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronRight } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')
  const navContainerRef = useRef<HTMLDivElement>(null)
  const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({})
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

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
      const sections = ['inicio', 'sedes', 'mision', 'directiva', 'pastores', 'galeria', 'educacion']
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

  useEffect(() => {
    const updateUnderline = () => {
      const activeLink = navLinksRef.current[activeSection]
      const container = navContainerRef.current
      
      if (activeLink && container) {
        const containerRect = container.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        
        setUnderlineStyle({
          left: linkRect.left - containerRect.left,
          width: linkRect.width,
        })
      }
    }

    updateUnderline()
    window.addEventListener('resize', updateUnderline)
    return () => window.removeEventListener('resize', updateUnderline)
  }, [activeSection])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    
    if (element) {
      const offsetTop = element.offsetTop - 64
      const startPosition = window.scrollY
      const distance = offsetTop - startPosition
      const duration = 1200 // Increased from default to 1200ms for slower scroll
      let start: number | null = null

      const smoothScrollAnimation = (currentTime: number) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)
        
        // Easing function for smooth deceleration
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
    { href: '#mision', label: 'Misión' },
    { href: '#directiva', label: 'Directiva' },
    { href: '#pastores', label: 'Pastores' },
    { href: '#galeria', label: 'Galería' },
    { href: '#educacion', label: 'Educación' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">VA</span>
          </div>
          <span className="font-bold text-lg sm:text-xl">Vida Abundante</span>
        </Link>
        
        <div ref={navContainerRef} className="hidden md:flex items-center gap-6 relative">
          {navLinks.map((link) => {
            const sectionId = link.href.replace('#', '')
            const isActive = activeSection === sectionId
            
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => { navLinksRef.current[sectionId] = el }}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <span
            className="absolute -bottom-4 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${underlineStyle.left}px`,
              width: `${underlineStyle.width}px`,
            }}
          />
          <Button asChild>
            <Link href="#inscripcion" onClick={(e) => handleNavClick(e, '#inscripcion')}>
              Inscríbete
            </Link>
          </Button>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-foreground rounded-full transition-all duration-300 ease-in-out ${
                isOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-full h-0.5 bg-foreground rounded-full transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-full h-0.5 bg-foreground rounded-full transition-all duration-300 ease-in-out ${
                isOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>

        <div
          className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
          style={{ top: '64px' }}
        />

        <div
          className={`md:hidden fixed right-0 top-16 h-[calc(100vh-64px)] w-[300px] sm:w-[350px] bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
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
                  className={`group flex items-center justify-between py-3 px-4 text-lg font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                  } ${isOpen ? 'animate-in slide-in-from-right-4 fade-in' : ''}`}
                  style={{
                    animationDelay: isOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
            <Button 
              asChild 
              className={`mt-6 w-full ${isOpen ? 'animate-in slide-in-from-right-4 fade-in' : ''}`}
              style={{
                animationDelay: isOpen ? `${navLinks.length * 50}ms` : '0ms',
              }}
            >
              <Link href="#inscripcion" onClick={(e) => handleNavClick(e, '#inscripcion')}>
                Inscríbete
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </nav>
  )
}
