import { NotFoundException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { ISeed } from './interface/iseed-model'

const pathJsonQuestions = path.resolve(
  __dirname,
  '../resources/entities/json/questions.json',
)

export class SeedQuestions implements ISeed {
  async mocking(prisma: PrismaClient) {
    const questions = this.fetchingQuestions()

    for (const question of questions) {
      console.log('QUESTION NUMBER ', question.question_number)
      console.log('QUESTION TEXT ', question.question_text)

      const intType = this.normalize_name(question.intelligenceType)
      await this.createQuestions(
        prisma,
        question.question_number,
        question.question_text,
        question.score_value,
        intType,
      )
    }
  }

  private fetchingQuestions() {
    let questionsFile
    try {
      questionsFile = JSON.parse(fs.readFileSync(pathJsonQuestions, 'utf-8'))
    } catch (error) {
      throw new Error('Erro ao carregar arquivo de cursos')
    }
    return questionsFile
  }

  private normalize_name(name: string) {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/ /g, '-')
      .toUpperCase()
  }

  private async createQuestions(
    prisma: PrismaClient,
    questionNumber: number,
    questionText: string,
    scoreValue: number,
    intelligenceType: string,
  ) {
    const existingIntelligenceType = await prisma.intelligenceType.findFirst({
      where: {
        name: intelligenceType,
      },
    })

    if (!existingIntelligenceType) {
      throw new NotFoundException('Tipo de Inteligência não existe!')
    }

    console.log('INTELLIGENCE TYPE FOUND ', existingIntelligenceType)

    const question = await prisma.question.create({
      data: {
        question_number: questionNumber,
        question_text: questionText,
        score_value: scoreValue,
        Intell_type: {
          connect: {
            id: existingIntelligenceType.id,
          },
        },
      },
    })

    console.log('QUESTION CREATED ', question)
  }
}
