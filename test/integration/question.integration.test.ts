import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/modules/app.module';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

describe('Questions and Test Results Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Teste de criação de perguntas
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

  // Teste para listar perguntas com paginação
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

  // Teste para submeter respostas e obter resultados
  it('should store answers and return test results', async () => {
    const mockToken = 'mock-valid-token'; // Substitua com um token válido no ambiente de teste
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

  // Teste para erro ao submeter respostas com perguntas inexistentes
  it('should return 404 if questions do not exist', async () => {
    const mockToken = 'mock-valid-token'; // Substitua com um token válido no ambiente de teste
    const response = await request(app.getHttpServer())
      .post('/test-results')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        answer_values: [
          { question_number: 999, question_value: 5 }, // Número inválido
        ],
      })
      .expect(404);

    expect(response.body.message).toBe('Uma ou mais perguntas não foram encontradas.');
  });
});