/* eslint-disable camelcase */
import { CreateQuestionDtoSchema } from '@/dtos/create-question.dto'
import { PrismaService } from '@/persistence/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  normalize_name(name) {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/ /g, '-')
      .toUpperCase()
  }

  async create(body: CreateQuestionDtoSchema) {
    const { question_number, question_text, score_value, intelligence_name } =
      body

    const existingIntelligenceType =
      await this.prisma.intelligenceType.findFirst({
        where: {
          name: this.normalize_name(intelligence_name),
        },
      })

    if (!existingIntelligenceType) {
      throw new NotFoundException('Tipo de Inteligência não existe!')
    }

    await this.prisma.question.upsert({
      where: {
        question_number,
      },
      update: {
        question_text,
        score_value,
        Intell_type: {
          connect: {
            id: existingIntelligenceType.id,
          },
        },
      },
      create: {
        question_number,
        question_text,
        score_value,
        Intell_type: {
          connect: {
            id: existingIntelligenceType.id,
          },
        },
      },
    })
  }

  async getQuestions(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize
    const take = pageSize * 1

    const questions = await this.prisma.question.findMany({
      skip,
      take,
      select: {
        question_number: true,
        question_text: true,
      },
      orderBy: {
        question_number: 'asc',
      },
    })

    const totalQuestions = await this.prisma.question.count()

    return {
      data: questions,
      total: totalQuestions,
      page,
      totalPages: Math.ceil(totalQuestions / pageSize),
    }
  }
}
