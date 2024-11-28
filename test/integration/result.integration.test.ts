import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/modules/app.module';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { PrismaService } from '@/persistence/prisma/prisma.service';

describe('TestResults Integration Test', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await app.init();

    // Limpa o banco de dados antes do teste
    await prismaService.$executeRawUnsafe('TRUNCATE TABLE question CASCADE');
    await prismaService.$executeRawUnsafe('TRUNCATE TABLE intelligence_type CASCADE');
    await prismaService.$executeRawUnsafe('TRUNCATE TABLE test_result CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process and return test results correctly', async () => {
    // Popula o banco com dados para o teste
    const intelligence1 = await prismaService.intelligenceType.create({
      data: {
        name: 'Logical',
        description: 'Logical reasoning',
      },
    });

    const intelligence2 = await prismaService.intelligenceType.create({
      data: {
        name: 'Creative',
        description: 'Creative thinking',
      },
    });

    const question1 = await prismaService.question.create({
      data: {
        question_number: 1,
        question_text: 'What is 2 + 2?',
        score_value: 5,
        intell_type_id: intelligence1.id,
      },
    });

    const question2 = await prismaService.question.create({
      data: {
        question_number: 2,
        question_text: 'What is the capital of France?',
        score_value: 3,
        intell_type_id: intelligence2.id,
      },
    });

    // Mock de usuário
    const user = await prismaService.user.create({
      data: {
        id: 'user-id',
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'securepassword',
      },
    });

    // Simula a requisição para submissão de respostas
    const response = await request(app.getHttpServer())
      .post('/test-results')
      .set('Authorization', `Bearer valid-token`) // Simula autenticação
      .send({
        answer_values: [
          { question_number: question1.question_number, question_value: 5 },
          { question_number: question2.question_number, question_value: 3 },
        ],
      })
      .expect(201);

    // Verifica se o resultado está correto
    expect(response.body).toEqual({
      scores: {
        Logical: 5,
        Creative: 3,
      },
      result: {
        maxIntellTypeName: 'Logical',
        maxIntellTypeDescription: 'Logical reasoning',
        maxIntellTypeCourses: expect.any(Array), // Pode ser expandido conforme os cursos mockados
        maxScore: 5,
      },
    });

    // Verifica se os dados foram salvos no banco corretamente
    const testResult = await prismaService.testResult.findFirst({
      where: { user: { id: user.id } },
    });

    expect(testResult).toBeTruthy();
    expect(testResult?.total_score).toBe(5);
    expect(testResult?.intell_type_id).toBe(intelligence1.id);
  });
});