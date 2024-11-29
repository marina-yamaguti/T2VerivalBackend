import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/modules/app.module';
import { ConfigService } from '@nestjs/config';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

process.env.DATABASE_URL = 'file:./test.db';

describe('Questions and Test Results Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Mock do ConfigService com retorno simulado para as variáveis de ambiente
    const configServiceMock = {
      get: (key: string, options?: { infer: boolean }) => {
        const config = {
          DATABASE_URL: "postgresql://sofiasartori:password@localhost:5432/test",
          JWT_PRIVATE_KEY: "seu_private_key",
          JWT_PUBLIC_KEY: "seu_public_key",
          MAILER_USER: 'test-user',
          MAILER_PASS: 'test-pass',
        };
        return config[key];
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create a new question successfully', async () => {
    const newQuestion = {
      question_number: 1,
      question_text: 'What is 2 + 2?',
      score_value: 10,
      intelligence_name: 'Logical',
    };

    const response = await request(app.getHttpServer())
      .post('/questions')
      .send(newQuestion)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      question_number: newQuestion.question_number,
      question_text: newQuestion.question_text,
      score_value: newQuestion.score_value,
      Intell_type: {
        id: expect.any(String),
        name: newQuestion.intelligence_name,
      },
    });
  });

  it('should return paginated questions', async () => {
    const response = await request(app.getHttpServer())
      .get('/questions?page=1&pageSize=5')
      .expect(200);

    expect(response.body).toEqual({
      page: 1,
      data: expect.arrayContaining([
        {
          question_number: expect.any(Number),
          question_text: expect.any(String),
        },
      ]),
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it('should store answers and return test results', async () => {
    const mockToken = 'mock-valid-token';
    const response = await request(app.getHttpServer())
      .post('/test-results')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        answer_values: [
          { question_number: 1, question_value: 5 },
          { question_number: 2, question_value: 3 },
        ],
      })
      .expect(201);

    expect(response.body).toEqual({
      scores: {
        Logical: expect.any(Number),
        Creative: expect.any(Number),
      },
      result: {
        maxIntellTypeName: expect.any(String),
        maxIntellTypeDescription: expect.any(String),
        maxIntellTypeCourses: expect.arrayContaining([
          { name: expect.any(String), description: expect.any(String) },
        ]),
        maxScore: expect.any(Number),
      },
    });
  });

  it('should return 404 if questions do not exist', async () => {
    const mockToken = 'mock-valid-token';
    const response = await request(app.getHttpServer())
      .post('/test-results')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        answer_values: [
          { question_number: 999, question_value: 5 },
        ],
      })
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Uma ou mais perguntas não foram encontradas.',
    });
  });
});
