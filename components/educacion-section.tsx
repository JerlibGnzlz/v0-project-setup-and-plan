'use client'

import { BookOpen, GraduationCap, Users, Award, Mail, Phone, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const programs = [
  {
    title: 'Instituto Bíblico AMVA',
    subtitle: 'Formación teológica integral para el ministerio',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'El Instituto Bíblico AMVA ofrece una formación teológica sólida y práctica, diseñada para equipar a pastores, líderes y obreros cristianos con las herramientas necesarias para un ministerio efectivo y transformador.',
    areas: [
      'Teología Sistemática y Bíblica',
      'Homilética y Hermenéutica',
      'Liderazgo y Administración Eclesiástica',
      'Consejería Pastoral y Familia',
      'Misiones y Evangelismo',
    ],
    modalities: [
      { type: 'Presencial', desc: 'Clases intensivas los fines de semana' },
      { type: 'Semi-presencial', desc: 'Combinación de clases presenciales y material en línea' },
      { type: 'Duración', desc: '3 años (Diploma Ministerial)' },
    ],
  },
  {
    title: 'Escuela de Capellanía',
    subtitle: 'Formación especializada en cuidado pastoral y capellanía',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-500',
    description: 'La Escuela de Capellanía prepara a líderes cristianos para ejercer el ministerio de capellanía en diversos contextos: hospitales, cárceles, fuerzas armadas, empresas, instituciones educativas y comunidades en situación de crisis.',
    areas: [
      'Capellanía Hospitalaria y de Salud',
      'Capellanía Penitenciaria',
      'Capellanía Militar y Policial',
      'Consejería en Crisis y Trauma',
      'Ética Profesional del Capellán',
    ],
    modalities: [
      { type: 'Formato', desc: 'Talleres prácticos y seminarios intensivos' },
      { type: 'Certificación', desc: 'Capellán Certificado AMVA' },
      { type: 'Duración', desc: '1 año (Certificado de Capellanía)' },
    ],
  },
]

export function EducacionSection() {
  return (
    <section id="educacion" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d1f35]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gradient-to-t from-blue-500/20 to-transparent rounded-full blur-[100px]" />
        </div>
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80 font-medium">Formación de Excelencia</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Educación{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Ministerial
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            Formando líderes comprometidos con la excelencia y el servicio a través de programas educativos de calidad
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {programs.map((program, index) => {
            const Icon = program.icon
            return (
              <div key={index} className="relative group">
                {/* Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${program.gradient} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="relative h-full rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                  {/* Header gradient */}
                  <div className={`h-1 bg-gradient-to-r ${program.gradient}`} />
                  
                  <div className="p-6 sm:p-8">
                    {/* Title */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${program.gradient} flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">{program.title}</h3>
                        <p className="text-white/60 text-sm mt-1">{program.subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 leading-relaxed mb-6">
                      {program.description}
                    </p>

                    {/* Areas */}
                    <div className="mb-6">
                      <h4 className="flex items-center gap-2 text-white font-semibold mb-4">
                        <Award className="w-4 h-4 text-amber-400" />
                        Áreas de Estudio
                      </h4>
                      <ul className="space-y-2">
                        {program.areas.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-white/70 text-sm">
                            <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 bg-gradient-to-r ${program.gradient} bg-clip-text text-transparent`} />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Modalities */}
                    <div className="space-y-3">
                      {program.modalities.map((mod, idx) => (
                        <div key={idx} className="flex gap-2 text-sm">
                          <span className="text-white font-medium">{mod.type}:</span>
                          <span className="text-white/60">{mod.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Información e Inscripciones
              </h3>
              <p className="text-white/60 mb-6 max-w-xl mx-auto">
                Para más información sobre nuestros programas educativos, requisitos de admisión y proceso de inscripción, contáctanos:
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="mailto:educacion@vidaabundante.org"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  educacion@vidaabundante.org
                </a>
                <a
                  href="tel:+5411xxxxxxxx"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  +54 11 xxxx-xxxx
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-blue-500/50 to-transparent" />
    </section>
  )
}
