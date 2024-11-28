import { PrismaService } from '@/persistence/prisma/prisma.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { z } from 'zod'

const UserRole = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

type UserRoleSchema = z.infer<typeof UserRole>

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  matchRoles(roles: string[], userRole: UserRoleSchema) {
    return roles.some((role) => role === userRole.role)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    )

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    const user = await this.prisma.user.findUnique({
      where: { id: request.user.sub },
    })

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!')
    }

    return this.matchRoles(requiredRoles, user)
  }
}
