import { AccountsController } from '@/controllers/accounts.controller'
import { PrismaModule } from '@/persistence/prisma/prisma.module'
import { AccountsService } from '@/services/accounts.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [PrismaModule],
})
export class AccountsModule {}
