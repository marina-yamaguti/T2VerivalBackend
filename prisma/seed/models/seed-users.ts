import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { ISeed } from './interface/iseed-model'

export class SeedUsers implements ISeed {
  async mocking(prisma: PrismaClient) {
    const admin = await prisma.user.upsert({
      where: {
        email: 'admin@polymathech.com',
      },
      update: {},
      create: {
        name: 'Admin',
        email: 'admin@polymathech.com',
        password: await hash('admin', 8),
        birthdate: new Date('1999-01-01'),
        role: 'ADMIN',
        education: 'DOUTORADO',
        gender: 'OUTRO',
      },
    })
    console.log('ADMIN CREATED ', admin)

    const user = await prisma.user.upsert({
      where: {
        email: 'user@example.com',
      },
      update: {},
      create: {
        name: 'Usuário',
        email: 'user@example.com',
        password: await hash('12345', 8),
        birthdate: new Date('2003-01-01'),
        role: 'USER',
        education: 'GRADUACAO',
        gender: 'MULHER',
      },
    })
    console.log('DEFAULT USER CREATED ', user)
  }
}
