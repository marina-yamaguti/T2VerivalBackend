/* eslint-disable camelcase */
import { TokenPayload } from '@/auth/jwt.strategy'
import { CreateTestResultDtoSchema } from '@/dtos/create-test-result.dto'
import { PrismaService } from '@/persistence/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class TestResultsService {
  constructor(private prisma: PrismaService) {}

  async create(user: TokenPayload, body: CreateTestResultDtoSchema) {
    const { answer_values } = body

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    })

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado!')
    }

    const questionNumbers = answer_values.map((av) => av.question_number)
    const questions = await this.getQuestionsByNumbers(questionNumbers)

    if (questions.length !== answer_values.length) {
      throw new NotFoundException(
        'Uma ou mais perguntas não foram encontradas.',
      )
    }

    const intelligenceTypeScores = this.calcIntelligenceTypeScores(
      answer_values,
      questions,
    )

    const { maxIntellTypeId, maxScore } = this.findMaxScore(
      intelligenceTypeScores,
    )

    if (!maxIntellTypeId) {
      throw new NotFoundException('Tipo de inteligência não encontrado.')
    }

    // To Review: This function is not returning the correct answer
    const intelligenceNamesWithScores =
      await this.getIntelligenceNamesWithScores(intelligenceTypeScores)

    const maxIntellType = await this.prisma.intelligenceType.findFirst({
      where: {
        id: maxIntellTypeId,
      },
    })

    const maxIntellTypeName = maxIntellType?.name
    const maxIntellTypeDescription = maxIntellType?.description
    const maxIntellTypeCourses = await this.prisma.course.findMany({
      where: {
        intell_type: {
          some: {
            id: maxIntellTypeId,
          },
        },
      },
    })

    await this.prisma.testResult.create({
      data: {
        user: {
          connect: {
            id: user.sub,
          },
        },
        total_score: maxScore,
        intell_type: {
          connect: {
            id: maxIntellTypeId,
          },
        },
      },
    })

    return {
      scores: intelligenceNamesWithScores,
      result: {
        maxIntellTypeName,
        maxIntellTypeDescription,
        maxIntellTypeCourses: maxIntellTypeCourses.map((course) => ({
          name: course.name,
          description: course.description,
        })),
        maxScore,
      },
    }
  }

  private async getQuestionsByNumbers(questionNumbers: number[]) {
    return this.prisma.question.findMany({
      where: { question_number: { in: questionNumbers } },
      include: { Intell_type: true },
    })
  }

  private calcIntelligenceTypeScores(answer_values, questions) {
    const intelligenceTypeScores = {}

    answer_values.forEach((answer) => {
      const question = questions.find(
        (q) => q.question_number === answer.question_number,
      )
      if (question && question.intell_type_id) {
        if (!intelligenceTypeScores[question.intell_type_id]) {
          intelligenceTypeScores[question.intell_type_id] = {
            score: 0,
            questionsCount: 0,
            questionsMaxScoreCount: 0,
            questionMaxScore: 0,
            questionMinScore: 0,
          }
        }
        intelligenceTypeScores[question.intell_type_id].score +=
          answer.question_value
        intelligenceTypeScores[question.intell_type_id].questionsCount++

        // Desempate
        if (answer.question_value === 5) {
          intelligenceTypeScores[question.intell_type_id]
            .questionsMaxScoreCount++
        }
        if (
          answer.question_value >
          intelligenceTypeScores[question.intell_type_id].questionMaxScore
        ) {
          intelligenceTypeScores[question.intell_type_id].questionMaxScore =
            answer.question_value
        }
        if (
          answer.question_value <
          intelligenceTypeScores[question.intell_type_id].questionMinScore
        ) {
          intelligenceTypeScores[question.intell_type_id].questionMinScore =
            answer.question_value
        }
      }
    })

    const intelligenceTypeScoresAverage = this.averageAnswers(
      intelligenceTypeScores,
    )

    return intelligenceTypeScoresAverage
  }

  private averageAnswers(intelligenceTypeScores) {
    const intelligenceTypeScoresAverage = {}
    const intelligenceTypesKeys = Object.keys(intelligenceTypeScores)

    intelligenceTypesKeys.forEach((intTypeId) => {
      if (!intelligenceTypeScoresAverage[intTypeId]) {
        intelligenceTypeScoresAverage[intTypeId] = {
          score: intelligenceTypeScores[intTypeId].score,
          questionsMaxScoreCount:
            intelligenceTypeScores[intTypeId].questionsMaxScoreCount,
          questionMaxScore: intelligenceTypeScores[intTypeId].questionMaxScore,
          questionMinScore: intelligenceTypeScores[intTypeId].questionMinScore,
          questionsCount: intelligenceTypeScores[intTypeId].questionsCount,
        }
        const result =
          intelligenceTypeScores[intTypeId].score /
          intelligenceTypeScores[intTypeId].questionsCount

        intelligenceTypeScoresAverage[intTypeId].score =
          Math.round(result * 100) / 100
      }
    })

    return intelligenceTypeScoresAverage
  }

  private findMaxScore(intelligenceTypeScores): {
    maxIntellTypeId: string
    maxScore: number
  } {
    let maxIntellType = {
      score: 0,
      questionsMaxScoreCount: 0,
      questionMaxScore: 0,
      questionMinScore: 0,
      questionCount: 0,
    }
    let maxIntellTypeId = ''
    const intelligenceTypeIds = Object.keys(intelligenceTypeScores)

    intelligenceTypeIds.forEach((intTypeId) => {
      if (intelligenceTypeScores[intTypeId].score > maxIntellType.score) {
        maxIntellType = intelligenceTypeScores[intTypeId]
        maxIntellTypeId = intTypeId
      } else if (
        intelligenceTypeScores[intTypeId].score === maxIntellType.score
      ) {
        if (
          intelligenceTypeScores[intTypeId].questionsMaxScoreCount >
          maxIntellType.questionsMaxScoreCount
        ) {
          maxIntellType = intelligenceTypeScores[intTypeId]
          maxIntellTypeId = intTypeId
        } else if (
          intelligenceTypeScores[intTypeId].questionsMaxScoreCount ===
          maxIntellType.questionsMaxScoreCount
        ) {
          const intTypeAmplitude =
            intelligenceTypeScores[intTypeId].questionMaxScore -
            intelligenceTypeScores[intTypeId].questionMinScore
          const maxIntellTypeAmplitude =
            maxIntellType.questionMaxScore - maxIntellType.questionMinScore

          if (intTypeAmplitude > maxIntellTypeAmplitude) {
            maxIntellType = intelligenceTypeScores[intTypeId]
            maxIntellTypeId = intTypeId
          } else if (intTypeAmplitude === maxIntellTypeAmplitude) {
            if (
              intelligenceTypeScores[intTypeId].questionCount >
              maxIntellType.questionCount
            ) {
              maxIntellType = intelligenceTypeScores[intTypeId]
              maxIntellTypeId = intTypeId
            }
          }
        }
      }
    })
    const maxScore = maxIntellType.score

    return { maxIntellTypeId, maxScore }
  }

  private async getIntelligenceNamesWithScores(
    intelligenceTypeScores: Record<
      string,
      {
        score: number
        questionsMaxScoreCount: number
        questionMaxScore: number
        questionMinScore: number
        questionCount: number
      }
    >,
  ): Promise<Record<string, number>> {
    const intelligenceIds = Object.keys(intelligenceTypeScores)
    const intelligenceTypes = await this.prisma.intelligenceType.findMany({
      where: { id: { in: intelligenceIds } },
    })

    const intelligenceNames: Record<string, string> = intelligenceTypes.reduce(
      (item, current) => {
        item[current.id] = current.name
        return item
      },
      {} as Record<string, string>,
    )

    if (Object.keys(intelligenceNames).length === 0) {
      return {}
    }

    const intelligenceNamesWithScores: Record<string, number> = Object.entries(
      intelligenceTypeScores,
    ).reduce(
      (item, [id, details]) => {
        const name = intelligenceNames[id]
        if (name) {
          item[name] = details.score
        }
        return item
      },
      {} as Record<string, number>,
    )

    return intelligenceNamesWithScores
  }
}
