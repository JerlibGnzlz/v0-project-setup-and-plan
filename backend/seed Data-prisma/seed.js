import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de datos...');

    // Limpiar datos existentes (opcional)
    await prisma.pago.deleteMany();
    await prisma.inscripcion.deleteMany();
    await prisma.galeriaImagen.deleteMany();
    await prisma.convencion.deleteMany();
    await prisma.pastor.deleteMany();
    await prisma.user.deleteMany();

    // 1. Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@ministerio-amva.org',
            password: hashedPassword,
            nombre: 'Administrador Principal',
            rol: 'ADMIN',
        },
    });
    console.log('✅ Admin creado:', admin.email);

    // 2. Crear pastores
    const pastores = await prisma.pastor.createMany({
        data: [
            {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@ministerio.org',
                telefono: '+54 11 1234-5678',
                sede: 'Buenos Aires',
                cargo: 'Pastor Principal',
                activo: true,
            },
            {
                nombre: 'María',
                apellido: 'González',
                email: 'maria.gonzalez@ministerio.org',
                telefono: '+54 11 2345-6789',
                sede: 'Córdoba',
                cargo: 'Pastora Asociada',
                activo: true,
            },
            {
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                email: 'carlos.rodriguez@ministerio.org',
                telefono: '+54 11 3456-7890',
                sede: 'Rosario',
                cargo: 'Pastor de Jóvenes',
                activo: true,
            },
        ],
    });
    console.log('✅ Pastores creados:', pastores.count);

    // 3. Crear convenciones
    const convenciones = await prisma.convencion.createMany({
        data: [
            {
                titulo: 'Convención Anual 2025',
                descripcion:
                    'Gran convención anual del ministerio con enseñanzas, adoración y compañerismo',
                fechaInicio: new Date('2025-06-15T09:00:00'),
                fechaFin: new Date('2025-06-17T18:00:00'),
                ubicacion: 'Argentina',
                costo: 150.0,
                cupoMaximo: 500,
                activa: true,
            },
            {
                titulo: 'Retiro de Pastores 2025',
                descripcion: 'Retiro especial para pastores y líderes',
                fechaInicio: new Date('2025-08-10T09:00:00'),
                fechaFin: new Date('2025-08-12T18:00:00'),
                ubicacion: 'Mendoza',
                costo: 200.0,
                cupoMaximo: 100,
                activa: true,
            },
        ],
    });
    console.log('✅ Convenciones creadas:', convenciones.count);

    // 4. Crear galerías
    const galerias = await prisma.galeriaImagen.createMany({
        data: [
            {
                titulo: 'Convención 2024',
                descripcion: 'Momentos especiales de nuestra convención anual',
                imagenUrl: '/images/convention-2024.jpg',
                categoria: 'convenciones',
                orden: 1,
                activa: true,
            },
            {
                titulo: 'Alabanza y Adoración',
                descripcion: 'Nuestro equipo de alabanza en acción',
                imagenUrl: '/images/worship.jpg',
                categoria: 'alabanza',
                orden: 2,
                activa: true,
            },
            {
                titulo: 'Reuniones de Pastores',
                descripcion: 'Capacitación y comunión pastoral',
                imagenUrl: '/images/pastors-meeting.jpg',
                categoria: 'reuniones',
                orden: 3,
                activa: true,
            },
        ],
    });
    console.log('✅ Galerías creadas:', galerias.count);

    // 5. Crear inscripciones
    const primeraConvencion = await prisma.convencion.findFirst();
    if (primeraConvencion) {
        const inscripciones = await prisma.inscripcion.createMany({
            data: [
                {
                    convencionId: primeraConvencion.id,
                    nombre: 'Pedro',
                    apellido: 'López',
                    email: 'pedro.lopez@ministerio.org',
                    telefono: '+54 11 5555-1111',
                    sede: 'Buenos Aires',
                    tipoInscripcion: 'pastor',
                    estado: 'confirmado',
                },
                {
                    convencionId: primeraConvencion.id,
                    nombre: 'Ana',
                    apellido: 'Martínez',
                    email: 'ana.martinez@ministerio.org',
                    telefono: '+54 11 5555-2222',
                    sede: 'La Plata',
                    tipoInscripcion: 'pastor',
                    estado: 'confirmado',
                },
                {
                    convencionId: primeraConvencion.id,
                    nombre: 'Roberto',
                    apellido: 'García',
                    email: 'roberto.garcia@ministerio.org',
                    telefono: '+54 11 5555-3333',
                    sede: 'Quilmes',
                    tipoInscripcion: 'visitante',
                    estado: 'pendiente',
                },
            ],
        });
        console.log('✅ Inscripciones creadas:', inscripciones.count);

        // 6. Crear pagos
        const inscripcionesCreadas = await prisma.inscripcion.findMany({
            where: { convencionId: primeraConvencion.id },
        });

        const pagos = await prisma.pago.createMany({
            data: [
                {
                    inscripcionId: inscripcionesCreadas[0].id,
                    monto: 150.0,
                    metodoPago: 'transferencia',
                    estado: 'COMPLETADO',
                    referencia: 'REF-001-2025',
                    fechaPago: new Date(),
                },
                {
                    inscripcionId: inscripcionesCreadas[1].id,
                    monto: 150.0,
                    metodoPago: 'tarjeta',
                    estado: 'COMPLETADO',
                    referencia: 'REF-002-2025',
                    fechaPago: new Date(),
                },
                {
                    inscripcionId: inscripcionesCreadas[2].id,
                    monto: 150.0,
                    metodoPago: 'efectivo',
                    estado: 'PENDIENTE',
                },
            ],
        });
        console.log('✅ Pagos creados:', pagos.count);
    }

    console.log('🎉 Seed completado exitosamente!');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
