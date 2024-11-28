import { TokenPayload } from '@/auth/jwt.strategy'
import { CurrentUser } from '@/commons/decorators/current-user-decorator'
import { ZodValidationPipe } from '@/commons/pipes/zod-validation-pipe'
import {
  CreateAccountDto,
  CreateAccountDtoSchema,
} from '@/dtos/create-account.dto'
import { AccountsService } from '@/services/accounts.service'
import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common'

@Controller('/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccountDto))
  async handle(@Body() createAccountDto: CreateAccountDtoSchema) {
    return this.accountsService.create(createAccountDto)
  }

  @Get('/email')
  async getUserEmail(@CurrentUser() user: TokenPayload) {
    return this.accountsService.getUserEmail(user)
  }
}
