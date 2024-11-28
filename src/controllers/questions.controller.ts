import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CreateQuestionDtoSchema } from '../dtos/create-question.dto'
import { QuestionsService } from '../services/questions.service'

@Controller('/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDtoSchema) {
    return this.questionsService.create(createQuestionDto)
  }

  @Get()
  getQuestions(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 5,
  ) {
    return this.questionsService.getQuestions(page, pageSize)
  }
}
