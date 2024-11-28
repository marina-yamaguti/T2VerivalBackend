import { QuestionsController } from '@/controllers/questions.controller'
import { PrismaModule } from '@/persistence/prisma/prisma.module'
import { QuestionsService } from '@/services/questions.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService],
  imports: [PrismaModule],
})
export class QuestionsModule {}
