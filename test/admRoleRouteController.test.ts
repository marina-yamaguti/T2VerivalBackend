/* eslint-disable @typescript-eslint/no-unused-vars */
import { RoleGuard } from '@/commons/guards/role.guard'
import { AdmRoleRoute } from '@/controllers/adm-role-route.controller'
import { ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { anything, instance, mock, when } from 'ts-mockito'
import { beforeEach, describe, expect, it } from 'vitest'

describe('AdmRoleRoute Controller', () => {
  let controller: AdmRoleRoute
  let authGuardMock: typeof AuthGuard
  let roleGuardMock: RoleGuard

  beforeEach(async () => {
    // Mock the guards
    authGuardMock = mock(AuthGuard)
    roleGuardMock = mock(RoleGuard)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdmRoleRoute],
      providers: [
        { provide: AuthGuard('jwt'), useValue: instance(authGuardMock) },
      ],
    }).compile()

    controller = module.get<AdmRoleRoute>(AdmRoleRoute)

    // Simulate guard behavior
    // when(authGuardMock.canActivate(anything())).thenReturn(true)
    when(roleGuardMock.canActivate(anything())).thenCall(
      (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest()
        return req.user && req.user.role === 'ADMIN'
      },
    )
  })

  it('should return "ok" if user is an admin', async () => {
    // Mock the user object to include 'sub' which is expected by the JWT strategy
    const req = { user: { sub: '12345', role: 'ADMIN' } }
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext

    // Call the controller handle method with the mocked user object
    expect(await controller.handle(req.user)).toBe('ok')
  })

  it('should not allow access if user is not an admin', async () => {
    const req = { user: { sub: '12345', role: 'USER' } }
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext

    try {
      await controller.handle(req.user)
      fail('Access Denied') // This line should trigger if no error is thrown
    } catch (error) {
      // Check if the error is an instance of Error and then access its message property
      if (error instanceof Error) {
        expect(error.message).toContain('Access Denied')
      } else {
        // Handle the case where it is not an error object or does not have a message property
        fail('The thrown error is not an instance of Error')
      }
    }
  })
})
