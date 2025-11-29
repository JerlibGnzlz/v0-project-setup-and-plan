import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Buscar usuarios admin existentes
    const existingAdmins = await prisma.user.findMany({
      where: { rol: 'ADMIN' },
      take: 5
    });
    
    console.log('Usuarios admin existentes:', existingAdmins.length);
    existingAdmins.forEach(u => {
      console.log(`  - ${u.email} (${u.nombre})`);
    });
    
    // Si no hay usuarios, crear uno por defecto
    if (existingAdmins.length === 0) {
      console.log('\n⚠️  No hay usuarios admin. Creando uno por defecto...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          email: 'admin@amva.com',
          password: hashedPassword,
          nombre: 'Administrador',
          rol: 'ADMIN',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&size=128&bold=true'
        }
      });
      console.log('✅ Usuario admin creado:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Contraseña: admin123`);
      console.log(`   ⚠️  IMPORTANTE: Cambia esta contraseña después del primer login`);
    } else {
      console.log('\n✅ Ya existen usuarios admin en la base de datos');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
