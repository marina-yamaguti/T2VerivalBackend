import { QuestionsController } from '@/controllers/questions.controller';
import { QuestionsService } from '@/services/questions.service';
import { PrismaService } from '@/persistence/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateQuestionDto } from '@/dtos/create-question.dto';

// Mock manual para o PrismaService
const prismaMock = {
  intelligenceType: {
    findFirst: vi.fn(),
  },
  question: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

// Mock manual para o QuestionsService
const questionsServiceMock = {
  create: vi.fn(),
  getQuestions: vi.fn(),
};

describe('QuestionsController', () => {
  let questionsController: QuestionsController;
  let questionsService: QuestionsService;

  beforeEach(() => {
    questionsService = new QuestionsService(prismaMock as any);
    questionsController = new QuestionsController(questionsService);
  });

  // Teste para criação bem-sucedida de uma questão
  it('should create a new question successfully', async () => {
    const newQuestion = {
      question_number: 1,
      question_text: 'What is 2 + 2?',
      score_value: 10,
      intelligence_name: 'LOGICAL',
    };
  
    // Mock para `findFirst`
    prismaMock.intelligenceType.findFirst.mockResolvedValue({
      id: 'intelligence-id',
      name: 'LOGICAL',
    });
  
    // Mock para `upsert`
    prismaMock.question.upsert.mockResolvedValue({
      id: '1',
      question_number: 1,
      question_text: 'What is 2 + 2?',
      score_value: 10,
      Intell_type: {
        id: 'intelligence-id',
        name: 'LOGICAL',
      },
    });
  
    // Mock do serviço QuestionsService
    const mockService = {
      create: vi.fn().mockResolvedValue({
        id: '1',
        question_number: 1,
        question_text: 'What is 2 + 2?',
        score_value: 10,
        Intell_type: {
          id: 'intelligence-id',
          name: 'LOGICAL',
        },
      }),
    };
  
    // Atualizando o controlador com o mock do serviço
    questionsController = new QuestionsController(mockService as any);
  
    // Executa o método `create` do controlador
    const result = await questionsController.create(newQuestion);
  
    // Verifica se o serviço foi chamado com os parâmetros corretos
    expect(mockService.create).toHaveBeenCalledWith(newQuestion);
  
    // Valida o resultado retornado
    expect(result).toEqual({
      id: '1',
      question_number: 1,
      question_text: 'What is 2 + 2?',
      score_value: 10,
      Intell_type: {
        id: 'intelligence-id',
        name: 'LOGICAL',
      },
    });
  });

  // Teste para erro ao criar uma questão com tipo de inteligência inexistente
  it('should throw NotFoundException if intelligence type does not exist', async () => {
    const newQuestion = {
      question_number: 2,
      question_text: 'What is the capital of France?',
      score_value: 20,
      intelligence_name: 'UNKNOWN',
    };

    prismaMock.intelligenceType.findFirst.mockResolvedValue(null);

    await expect(
      questionsController.create(CreateQuestionDto.parse(newQuestion)),
    ).rejects.toThrow(NotFoundException);
  });

  // Teste para listagem de questões
  it('should return paginated list of questions', async () => {
    const questionsMock = [
      { question_number: 1, question_text: 'What is 2 + 2?' },
      { question_number: 2, question_text: 'What is the capital of France?' },
    ];

    prismaMock.question.findMany.mockResolvedValue(questionsMock);
    prismaMock.question.count.mockResolvedValue(10);

    const result = await questionsController.getQuestions(1, 2);

    expect(prismaMock.question.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 2,
      select: {
        question_number: true,
        question_text: true,
      },
      orderBy: {
        question_number: 'asc',
      },
    });

    expect(result).toEqual({
      data: questionsMock,
      total: 10,
      page: 1,
      totalPages: 5,
    });
  });

  // Teste para listagem sem resultados
  it('should return empty list if no questions exist', async () => {
    prismaMock.question.findMany.mockResolvedValue([]);
    prismaMock.question.count.mockResolvedValue(0);

    const result = await questionsController.getQuestions(1, 2);

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  });

  // Teste para erro no banco durante listagem
  it('should throw error if database fails during getQuestions', async () => {
    prismaMock.question.findMany.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(questionsController.getQuestions(1, 2)).rejects.toThrow(
      'Database error',
    );
  });
});