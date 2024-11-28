import { AuthController } from '@/controllers/auth.controller'
import { PrismaService } from '@/persistence/prisma/prisma.service'
import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('AuthController', () => {
  let authController: AuthController
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeEach(() => {
    prismaService = new PrismaService()
    jwtService = new JwtService({ secret: 'test-secret' })
    authController = new AuthController(prismaService, jwtService)
  })

  it('should return access token and user role for valid credentials', async () => {
    const user = {
      id: 'user-id',
      email: 'test@example.com',
      password: await hash('validPassword', 10),
      role: 'USER',
    }

    prismaService.user.findUnique = vi.fn().mockResolvedValue(user)

    jwtService.sign = vi.fn().mockReturnValue('signed-jwt-token')

    const result = await authController.handle({
      email: 'test@example.com',
      password: 'validPassword',
    })

    expect(result).toEqual({
      access_token: 'signed-jwt-token',
      user_role: 'USER',
    })
  })

  it('should throw UnauthorizedException for invalid email', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue(null)

    await expect(
      authController.handle({
        email: 'invalid@example.com',
        password: 'anyPassword',
      }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException for invalid password', async () => {
    const user = {
      id: 'user-id',
      email: 'test@example.com',
      password: await hash('validPassword', 10),
      role: 'USER',
    }

    prismaService.user.findUnique = vi.fn().mockResolvedValue(user)

    await expect(
      authController.handle({
        email: 'test@example.com',
        password: 'invalidPassword',
      }),
    ).rejects.toThrow(UnauthorizedException)
  })
})
