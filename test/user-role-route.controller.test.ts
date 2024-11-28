/* eslint-disable @typescript-eslint/no-unused-vars */
import { RoleGuard } from '@/commons/guards/role.guard'
import { UserRoleRoute } from '@/controllers/user-role-route.controller'
import { ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'ts-mockito'
import { beforeEach, describe, expect, it } from 'vitest'

describe('UserRoleRoute', () => {
  let controller: UserRoleRoute
  let authGuardMock: typeof AuthGuard
  let mockRoleGuard: RoleGuard

  beforeEach(async () => {
    // Mocks para AuthGuard e RoleGuard
    authGuardMock = mock(AuthGuard)
    mockRoleGuard = mock(RoleGuard)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRoleRoute],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => true, // Simula sempre permitindo acesso
      })
      .overrideGuard(RoleGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true, // Simula sempre permitindo acesso com o role correto
      })
      .compile()

    controller = module.get<UserRoleRoute>(UserRoleRoute)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return "ok" when handle is called with proper role', async () => {
    // Mock para CurrentUser
    const user = { sub: '123' } // Substitua conforme a estrutura esperada do seu TokenPayload

    const result = await controller.handle(user)
    expect(result).toBe('ok')
  })
})
