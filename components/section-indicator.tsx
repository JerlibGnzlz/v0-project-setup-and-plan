'use client'

import { useEffect, useState } from 'react'

const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sedes', label: 'Sedes' },
  { id: 'mision', label: 'Misión' },
  { id: 'directiva', label: 'Directiva' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'convenciones', label: 'Convención' },
  { id: 'galeria', label: 'Galería' },
  { id: 'educacion', label: 'Educación' },
]

export function SectionIndicator() {
  const [activeSection, setActiveSection] = useState('inicio')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group flex items-center gap-3"
            aria-label={`Go to ${section.label}`}
          >
            <span
              className={`text-xs font-medium text-white transition-all duration-300 ${activeSection === section.id
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
            >
              {section.label}
            </span>
            <div
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${activeSection === section.id
                ? 'bg-emerald-500 border-emerald-500 scale-125 shadow-lg shadow-emerald-500/50'
                : 'bg-transparent border-white/30 hover:border-emerald-400 hover:scale-110'
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
