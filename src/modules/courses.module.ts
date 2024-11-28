import { CoursesController } from '@/controllers/courses.controller'
import { PrismaModule } from '@/persistence/prisma/prisma.module'
import { CoursesService } from '@/services/courses.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [PrismaModule],
})
export class CoursesModule {}
