import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenPayload } from '../auth/jwt.strategy'
import { CurrentUser } from '../commons/decorators/current-user-decorator'
import { Roles } from '../commons/decorators/roles.decorator'
import { RoleGuard } from '../commons/guards/role.guard'

@Controller('/user-role-route')
export class UserRoleRoute {
  constructor() {}

  @Roles('USER')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async handle(@CurrentUser() user: TokenPayload) {
    return 'ok'
  }
}
