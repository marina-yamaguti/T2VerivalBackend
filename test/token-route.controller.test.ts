/* eslint-disable @typescript-eslint/no-unused-vars */
import { TokenRoute } from '@/controllers/token-route.controller'
import { ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { instance, mock } from 'ts-mockito'
import { beforeEach, describe, expect, it } from 'vitest'

describe('TokenRoute', () => {
  let controller: TokenRoute
  let authGuardMock: typeof AuthGuard

  beforeEach(async () => {
    // Mock para AuthGuard
    authGuardMock = mock(AuthGuard)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenRoute],
      providers: [
        {
          provide: 'AuthGuard',
          useFactory: () => instance(AuthGuard),
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => true, // Simula o guard permitindo acesso sempre
      })
      .compile()

    controller = module.get<TokenRoute>(TokenRoute)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return "ok" when handle is called', async () => {
    // Mock para CurrentUser
    const user = { sub: '123' } // sub = id do usuario

    const result = await controller.handle(user)
    expect(result).toBe('ok')
  })
})
