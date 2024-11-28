import { TokenPayload } from '@/auth/jwt.strategy'
import { CurrentUser } from '@/commons/decorators/current-user-decorator'
import { Roles } from '@/commons/decorators/roles.decorator'
import { RoleGuard } from '@/commons/guards/role.guard'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CreateTestResultDtoSchema } from '../dtos/create-test-result.dto'
import { TestResultsService } from '../services/test-results.service'

@Controller('/test-results')
export class TestResultsController {
  constructor(private readonly testResultsService: TestResultsService) {}

  @Roles('USER')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async handle(
    @CurrentUser() user: TokenPayload,
    @Body() createTestResultDto: CreateTestResultDtoSchema,
  ) {
    return this.testResultsService.create(user, createTestResultDto)
  }
}
