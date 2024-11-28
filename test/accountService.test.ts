/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaService } from '@/persistence/prisma/prisma.service'
import { AccountsService } from '@/services/accounts.service'
import { ConflictException } from '@nestjs/common/exceptions'
import { beforeAll, describe, expect, it, test, vi } from 'vitest'

const mockPrismaService = {
  user: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      /* seu objeto de usuário simulado */
      name: 'andre',
      email: 'user@example.com',
      password: '123',
      birthdate: '2001-05-14',
      role: 'USER',
      education: 'GRADUACAO',
      gender: 'HOMEM',
    }),
  },
}

let accountService: AccountsService

beforeAll(() => {
  accountService = new AccountsService(
    mockPrismaService as unknown as PrismaService,
  )
})

describe('Account Service', () => {
  test('Deve ser possível criar um usuário', async () => {
    const result = await accountService.create({
      name: 'andre',
      email: 'user@example.com',
      password: '123',
      birthdate: '2001-05-14',
      role: 'USER',
      education: 'GRADUACAO',
      gender: 'HOMEM',
    })

    expect(result).toHaveProperty('name')
    expect(result.email).toBe('user@example.com') // checamos se o email existe e se esta como foi criado
  })
})

describe('AccountsService', () => {
  it('deve lançar um erro se o e-mail já estiver em uso', async () => {
    mockPrismaService.user.findUnique.mockResolvedValueOnce({
      email: 'user@example.com',
    })

    await expect(
      accountService.create({
        name: 'Teste',
        email: 'user@example.com',
        password: 'senha',
        birthdate: '2000-01-01',
        role: 'USER',
        education: 'FUNDAMENTAL',
        gender: 'HOMEM',
      }),
    ).rejects.toThrow(ConflictException)

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'user@example.com',
      },
    })
  })
})
