import { TokenPayload } from '@/auth/jwt.strategy'
import { CurrentUser } from '@/commons/decorators/current-user-decorator'
import { Roles } from '@/commons/decorators/roles.decorator'
import { RoleGuard } from '@/commons/guards/role.guard'
import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/adm-role-route')
export class AdmRoleRoute {
  constructor() {}

  @Roles('ADMIN')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async handle(@CurrentUser() user: TokenPayload) {
    return 'ok'
  }
}
