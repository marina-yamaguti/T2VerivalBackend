import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenPayload } from '../auth/jwt.strategy'
import { CurrentUser } from '../commons/decorators/current-user-decorator'

@Controller('/token-route')
@UseGuards(AuthGuard('jwt'))
export class TokenRoute {
  constructor() {}

  @Post()
  async handle(@CurrentUser() user: TokenPayload) {
    return 'ok'
  }
}
