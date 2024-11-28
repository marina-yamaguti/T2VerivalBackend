import { TestResultsService } from '@/services/test-results.service';
import { PrismaService } from '@/persistence/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TestResultsService', () => {
  let testResultsService: TestResultsService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    testResultsService = new TestResultsService(prismaService);
  });

  it('should calculate intelligence type scores correctly', async () => {
    const questions = [
      { question_number: 1, intell_type_id: 'intell-1' },
      { question_number: 2, intell_type_id: 'intell-1' },
      { question_number: 3, intell_type_id: 'intell-2' },
    ];
  
    const answers = [
      { question_number: 1, question_value: 5 },
      { question_number: 2, question_value: 3 },
      { question_number: 3, question_value: 4 },
    ];
  
    const intelligenceTypeScores = {
      'intell-1': {
        score: 4,
        questionsCount: 2,
        questionsMaxScoreCount: 1,
        questionMaxScore: 5,
        questionMinScore: 3, 
      },
      'intell-2': {
        score: 4,
        questionsCount: 1,
        questionsMaxScoreCount: 0,
        questionMaxScore: 4,
        questionMinScore: 4,
      },
    };
  
    vi.spyOn(testResultsService as any, 'calcIntelligenceTypeScores').mockReturnValue(intelligenceTypeScores);
  
    expect(
      testResultsService['calcIntelligenceTypeScores'](answers, questions),
    ).toEqual(intelligenceTypeScores);
  });

  it('should find the maximum intelligence type correctly', () => {
    const intelligenceTypeScores = {
      'intell-1': {
        score: 4,
        questionsMaxScoreCount: 1,
        questionMaxScore: 5,
        questionMinScore: 3,
        questionsCount: 2,
      },
      'intell-2': {
        score: 4,
        questionsMaxScoreCount: 0,
        questionMaxScore: 4,
        questionMinScore: 4,
        questionsCount: 1,
      },
      'intell-3': {
        score: 3,
        questionsMaxScoreCount: 1,
        questionMaxScore: 3,
        questionMinScore: 3,
        questionsCount: 1,
      },
    };

    const result = testResultsService['findMaxScore'](intelligenceTypeScores);

    expect(result).toEqual({ maxIntellTypeId: 'intell-1', maxScore: 4 });
  });

  it('should throw NotFoundException if user does not exist', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue(null);

    const mockUser = { sub: 'user-id' };
    const mockBody = {
      answer_values: [{ question_number: 1, question_value: 5 }],
    };

    await expect(testResultsService.create(mockUser, mockBody)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if questions are missing', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue({ id: 'user-id' });
    prismaService.question.findMany = vi.fn().mockResolvedValue([]);

    const mockUser = { sub: 'user-id' };
    const mockBody = {
      answer_values: [{ question_number: 1, question_value: 5 }],
    };

    await expect(testResultsService.create(mockUser, mockBody)).rejects.toThrow(
      'Uma ou mais perguntas não foram encontradas.',
    );
  });

  it('should return correct results when all data is valid', async () => {
    // Mocka a chamada para buscar o usuário
    prismaService.user.findUnique = vi.fn().mockResolvedValue({ id: 'user-id' });
  
    // Mocka as perguntas associadas às respostas
    prismaService.question.findMany = vi.fn().mockResolvedValue([
      { question_number: 1, intell_type_id: 'intell-1' },
      { question_number: 2, intell_type_id: 'intell-2' },
    ]);
  
    // Mocka os tipos de inteligência associados às perguntas
    prismaService.intelligenceType.findMany = vi.fn().mockResolvedValue([
      { id: 'intell-1', name: 'Logical', description: 'Logical reasoning' },
      { id: 'intell-2', name: 'Creative', description: 'Creative thinking' },
    ]);
  
    // Mocka o tipo de inteligência dominante
    prismaService.intelligenceType.findFirst = vi.fn().mockResolvedValue({
      id: 'intell-1',
      name: 'Logical',
      description: 'Logical reasoning',
    });
  
    // Mocka os cursos associados ao tipo de inteligência dominante
    prismaService.course.findMany = vi.fn().mockResolvedValue([
      { name: 'Computer Science', description: 'CS Description' },
      { name: 'Mathematics', description: 'Mathematics Description' },
    ]);
  
    // Mocka a criação de um novo resultado de teste
    prismaService.testResult.create = vi.fn().mockResolvedValue({});
  
    // Corpo da requisição
    const mockUser = { sub: 'user-id' };
    const mockBody = {
      answer_values: [
        { question_number: 1, question_value: 5 },
        { question_number: 2, question_value: 3 },
      ],
    };
  
    // Chama o método a ser testado
    const result = await testResultsService.create(mockUser, mockBody);
  
    // Verifica o resultado
    expect(result).toEqual({
      scores: {
        Logical: 5,
        Creative: 3,
      },
      result: {
        maxIntellTypeName: 'Logical',
        maxIntellTypeDescription: 'Logical reasoning',
        maxIntellTypeCourses: [
          { name: 'Computer Science', description: 'CS Description' },
          { name: 'Mathematics', description: 'Mathematics Description' },
        ],
        maxScore: 5,
      },
    });
  });
});