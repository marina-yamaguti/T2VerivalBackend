import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/modules/app.module';
import { PrismaService } from '@/persistence/prisma/prisma.service';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Quiz System Test', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await app.init();

    // Limpa o banco de dados antes dos testes
    await prismaService.$executeRawUnsafe('TRUNCATE TABLE question CASCADE');
    await prismaService.$executeRawUnsafe('TRUNCATE TABLE intelligence_type CASCADE');
    await prismaService.$executeRawUnsafe('TRUNCATE TABLE test_result CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete the full quiz flow successfully', async () => {
    // 1. Criação de tipos de inteligência
    const intelligenceLogical = await prismaService.intelligenceType.create({
      data: { name: 'Logical', description: 'Logical reasoning' },
    });

    const intelligenceCreative = await prismaService.intelligenceType.create({
      data: { name: 'Creative', description: 'Creative thinking' },
    });

    // 2. Criação de perguntas associadas aos tipos de inteligência
    await prismaService.question.createMany({
      data: [
        {
          question_number: 1,
          question_text: 'What is 2 + 2?',
          score_value: 5,
          intell_type_id: intelligenceLogical.id,
        },
        {
          question_number: 2,
          question_text: 'What is the capital of France?',
          score_value: 3,
          intell_type_id: intelligenceCreative.id,
        },
      ],
    });

    // 3. Acesso ao teste vocacional (listar perguntas paginadas)
    const questionsResponse = await request(app.getHttpServer())
      .get('/questions?page=1&pageSize=2')
      .expect(200);

    expect(questionsResponse.body).toEqual({
      page: 1,
      data: expect.arrayContaining([
        {
          question_number: 1,
          question_text: 'What is 2 + 2?',
        },
        {
          question_number: 2,
          question_text: 'What is the capital of France?',
        },
      ]),
      total: 2,
      totalPages: 1,
    });

    // 4. Submissão de respostas
    const mockUser = await prismaService.user.create({
      data: {
        id: 'user-id',
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
      },
    });

    const answersResponse = await request(app.getHttpServer())
      .post('/test-results')
      .set('Authorization', `Bearer mock-token`) // Simula autenticação
      .send({
        answer_values: [
          { question_number: 1, question_value: 5 },
          { question_number: 2, question_value: 3 },
        ],
      })
      .expect(201);

    expect(answersResponse.body).toEqual({
      scores: {
        Logical: 5,
        Creative: 3,
      },
      result: {
        maxIntellTypeName: 'Logical',
        maxIntellTypeDescription: 'Logical reasoning',
        maxIntellTypeCourses: expect.any(Array),
        maxScore: 5,
      },
    });

    // 5. Geração de resultados
    const testResult = await prismaService.testResult.findFirst({
      where: { user: { id: mockUser.id } },
    });

    expect(testResult).toBeTruthy();
    expect(testResult?.total_score).toBe(5);
    expect(testResult?.intell_type_id).toBe(intelligenceLogical.id);
  });
});
