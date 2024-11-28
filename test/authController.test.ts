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

  // Verifica comportamento com entradas inválidas no handle.
  it('should throw an error when email or password is missing', async () => {
    await expect(
      authController.handle({
        email: '',
        password: 'validPassword',
      }),
    ).rejects.toThrowError();
  
    await expect(
      authController.handle({
        email: 'test@example.com',
        password: '',
      }),
    ).rejects.toThrowError();
  });

  // Verifica comportamento quando o PrismaService lança uma exceção.
  it('should throw UnauthorizedException if Prisma throws an error', async () => {
    prismaService.user.findUnique = vi.fn().mockRejectedValue(new Error('Database error'));
  
    await expect(
      authController.handle({
        email: 'test@example.com',
        password: 'validPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Adicione testes para garantir que a funcionalidade de recuperação de senha funcione corretamente.
  it('should send a password reset email for valid user', async () => {
    const user = {
      id: 'user-id',
      email: 'test@example.com',
    };
  
    prismaService.user.findUnique = vi.fn().mockResolvedValue(user);
    jwtService.sign = vi.fn().mockReturnValue('reset-token');
    const sendPasswordResetEmailMock = vi.fn();
    authController['mailService'] = { sendPasswordResetEmail: sendPasswordResetEmailMock } as any;
  
    await authController.forgotPassword({ email: 'test@example.com' });
  
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id }, { expiresIn: '1h' });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith('test@example.com', 'reset-token');
  });
  
  it('should throw UnauthorizedException for invalid user in forgotPassword', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue(null);
  
    await expect(
      authController.forgotPassword({ email: 'invalid@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Testes para validar a lógica de redefinição de senha.
  it('should reset the password for valid token and passwords', async () => {
    const user = {
      id: 'user-id',
      password: 'oldPassword',
    };
  
    prismaService.user.findUnique = vi.fn().mockResolvedValue(user);
    prismaService.user.update = vi.fn().mockResolvedValue({});
    jwtService.decode = vi.fn().mockReturnValue({ sub: 'user-id' });
  
    await authController.resetPassword(
      { password: 'newPassword', confirmPassword: 'newPassword' },
      'valid-token',
    );
  
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { password: expect.any(String) },
    });
  });
  
  it('should throw an error if passwords do not match in resetPassword', async () => {
    await expect(
      authController.resetPassword(
        { password: 'newPassword', confirmPassword: 'differentPassword' },
        'valid-token',
      ),
    ).rejects.toThrowError('Senhas não conferem');
  });

})
