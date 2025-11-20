'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, GraduationCap, Users, Award } from 'lucide-react'

export function EducacionSection() {
  return (
    <section id="educacion" className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-earth-brown">Educación Ministerial</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Formando líderes comprometidos con la excelencia y el servicio a través de programas educativos de calidad
          </p>
        </div>

        {/* Instituto Bíblico AMVA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="border-2 border-ocean-blue/20 hover:border-ocean-blue/40 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-ocean-blue/10 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-ocean-blue" />
                </div>
                <CardTitle className="text-2xl text-earth-brown">Instituto Bíblico AMVA</CardTitle>
              </div>
              <CardDescription className="text-base">
                Formación teológica integral para el ministerio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-ocean-blue" />
                  Sobre el Instituto
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  El Instituto Bíblico AMVA ofrece una formación teológica sólida y práctica, 
                  diseñada para equipar a pastores, líderes y obreros cristianos con las 
                  herramientas necesarias para un ministerio efectivo y transformador.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-forest-green" />
                  Áreas de Estudio
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-forest-green mt-1">•</span>
                    <span>Teología Sistemática y Bíblica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-forest-green mt-1">•</span>
                    <span>Homilética y Hermenéutica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-forest-green mt-1">•</span>
                    <span>Liderazgo y Administración Eclesiástica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-forest-green mt-1">•</span>
                    <span>Consejería Pastoral y Familia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-forest-green mt-1">•</span>
                    <span>Misiones y Evangelismo</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-earth-brown" />
                  Modalidades
                </h4>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Presencial:</strong> Clases intensivas los fines de semana</p>
                  <p><strong className="text-foreground">Semi-presencial:</strong> Combinación de clases presenciales y material en línea</p>
                  <p><strong className="text-foreground">Duración:</strong> 3 años (Diploma Ministerial)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escuela de Capellanía */}
          <Card className="border-2 border-forest-green/20 hover:border-forest-green/40 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-forest-green/10 rounded-lg">
                  <Users className="h-8 w-8 text-forest-green" />
                </div>
                <CardTitle className="text-2xl text-earth-brown">Escuela de Capellanía</CardTitle>
              </div>
              <CardDescription className="text-base">
                Formación especializada en cuidado pastoral y capellanía
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-forest-green" />
                  Sobre la Escuela
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  La Escuela de Capellanía prepara a líderes cristianos para ejercer el ministerio 
                  de capellanía en diversos contextos: hospitales, cárceles, fuerzas armadas, 
                  empresas, instituciones educativas y comunidades en situación de crisis.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-ocean-blue" />
                  Áreas de Capacitación
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-blue mt-1">•</span>
                    <span>Capellanía Hospitalaria y de Salud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-blue mt-1">•</span>
                    <span>Capellanía Penitenciaria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-blue mt-1">•</span>
                    <span>Capellanía Militar y Policial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-blue mt-1">•</span>
                    <span>Consejería en Crisis y Trauma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-blue mt-1">•</span>
                    <span>Ética Profesional del Capellán</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-earth-brown" />
                  Programa
                </h4>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Formato:</strong> Talleres prácticos y seminarios intensivos</p>
                  <p><strong className="text-foreground">Certificación:</strong> Capellán Certificado AMVA</p>
                  <p><strong className="text-foreground">Duración:</strong> 1 año (Certificado de Capellanía)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 sm:mt-12 text-center px-4">
          <Card className="max-w-4xl mx-auto bg-ocean-blue/5 border-ocean-blue/20">
            <CardContent className="py-6 sm:py-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-earth-brown">
                Información e Inscripciones
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                Para más información sobre nuestros programas educativos, requisitos de admisión y 
                proceso de inscripción, contáctanos a través de:
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 text-sm">
                <div>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:educacion@vidaabundante.org" className="text-ocean-blue hover:underline break-all">
                    educacion@vidaabundante.org
                  </a>
                </div>
                <div>
                  <strong className="text-foreground">WhatsApp:</strong>{' '}
                  <span className="text-muted-foreground">+54 11 xxxx-xxxx</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
