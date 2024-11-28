import { IntelligenceTypesController } from '@/controllers/intelligence-types.controller'
import { PrismaModule } from '@/persistence/prisma/prisma.module'
import { IntelligenceTypesService } from '@/services/intelligence-types.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [IntelligenceTypesController],
  providers: [IntelligenceTypesService],
  imports: [PrismaModule],
})
export class IntelligenceTypesModule {}
