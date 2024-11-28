import { TokenPayload } from '@/auth/jwt.strategy'
import { CurrentUser } from '@/commons/decorators/current-user-decorator'
import { Roles } from '@/commons/decorators/roles.decorator'
import { RoleGuard } from '@/commons/guards/role.guard'
import { EmailService } from '@/services/email.service'
import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/get-email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Roles('USER')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async handle(@CurrentUser() user: TokenPayload) {
    return this.emailService.getEmail(user)
  }
}