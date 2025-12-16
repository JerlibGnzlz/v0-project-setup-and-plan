/**
 * Datos compartidos de ubicaciones/sedes
 * Este archivo centraliza la información de las sedes para que pueda ser reutilizada
 * en diferentes componentes (sedes-section, about-section, etc.)
 */

export interface Location {
    country: string
    city: string
    description: string
    image: string
    flag: string
}

export const locations: Location[] = [
    {
        country: 'Colombia',
        city: 'Bogotá',
        description:
            'Nuestra sede principal en América del Sur, alcanzando comunidades con el mensaje de esperanza.',
        image: '/bogota-colombia-cityscape-with-mountains.jpg',
        flag: '🇨🇴',
    },
    {
        country: 'España',
        city: 'Madrid',
        description: 'Expandiendo el reino en Europa, conectando con la comunidad hispana y europea.',
        image: '/madrid-spain-cityscape-with-architecture.jpg',
        flag: '🇪🇸',
    },
    {
        country: 'Argentina',
        city: 'Buenos Aires',
        description:
            'Ministerio activo en el corazón de Argentina, transformando vidas con el evangelio.',
        image: '/buenos-aires-argentina-cityscape.jpg',
        flag: '🇦🇷',
    },
    {
        country: 'Chile',
        city: 'Santiago',
        description: 'Presencia misionera en Chile, llevando luz a las comunidades locales.',
        image: '/santiago-chile-cityscape-with-andes-mountains.jpg',
        flag: '🇨🇱',
    },
    {
        country: 'Uruguay',
        city: 'Montevideo',
        description: 'Alcanzando Uruguay con amor y servicio, edificando la iglesia local.',
        image: '/montevideo-uruguay-cityscape-waterfront.jpg',
        flag: '🇺🇾',
    },
    {
        country: 'Brasil',
        city: 'São Paulo',
        description: 'Expandiendo el ministerio en el corazón de Sudamérica, alcanzando comunidades con el evangelio.',
        image: '/placeholder.jpg',
        flag: '🇧🇷',
    },
    {
        country: 'Panamá',
        city: 'Ciudad de Panamá',
        description: 'Puente entre continentes, llevando el mensaje de vida abundante a Centroamérica.',
        image: '/placeholder.jpg',
        flag: '🇵🇦',
    },
]

/**
 * Calcula el número de países únicos en las ubicaciones
 */
export function getTotalCountries(): number {
    return locations.length
}

