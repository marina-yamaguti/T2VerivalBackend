import { CreateCourseDtoSchema } from '@/dtos/create-course.dto'
import { CoursesService } from '@/services/courses.service'
import { Body, Controller, Post } from '@nestjs/common'

@Controller('/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async handle(@Body() createCourseDto: CreateCourseDtoSchema) {
    return this.coursesService.create(createCourseDto)
  }
}
