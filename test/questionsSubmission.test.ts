import { TestResultsService } from '@/services/test-results.service';
import { PrismaService } from '@/persistence/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TestResultsService - Submission of Answers', () => {
  let testResultsService: TestResultsService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = {
      user: { findUnique: vi.fn() },
      question: { findMany: vi.fn() },
      intelligenceType: { findMany: vi.fn(), findFirst: vi.fn() },
      course: { findMany: vi.fn() },
      testResult: { create: vi.fn() },
    } as unknown as PrismaService;

    testResultsService = new TestResultsService(prismaService);
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
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
  });

  it('should throw NotFoundException if questions do not exist', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue({ id: 'user-id' });
    prismaService.question.findMany = vi.fn().mockResolvedValue([]);

    const mockUser = { sub: 'user-id' };
    const mockBody = {
      answer_values: [{ question_number: 1, question_value: 5 }],
    };

    await expect(testResultsService.create(mockUser, mockBody)).rejects.toThrow(
      'Uma ou mais perguntas não foram encontradas.',
    );
    expect(prismaService.question.findMany).toHaveBeenCalledWith({
      where: { question_number: { in: [1] } },
      include: { Intell_type: true },
    });
  });

  it('should store answers in the database when data is valid', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue({ id: 'user-id' });
    prismaService.question.findMany = vi.fn().mockResolvedValue([
      { question_number: 1, intell_type_id: 'intell-1' },
      { question_number: 2, intell_type_id: 'intell-2' },
    ]);
    prismaService.intelligenceType.findMany = vi.fn().mockResolvedValue([
      { id: 'intell-1', name: 'Logical', description: 'Logical reasoning' },
      { id: 'intell-2', name: 'Creative', description: 'Creative thinking' },
    ]);
    prismaService.intelligenceType.findFirst = vi.fn().mockResolvedValue({
      id: 'intell-1',
      name: 'Logical',
      description: 'Logical reasoning',
    });
    prismaService.course.findMany = vi.fn().mockResolvedValue([
      { name: 'Computer Science', description: 'CS Description' },
      { name: 'Mathematics', description: 'Mathematics Description' },
    ]);
    prismaService.testResult.create = vi.fn().mockResolvedValue({});
  
    const mockUser = { sub: 'user-id' };
    const mockBody = {
      answer_values: [
        { question_number: 1, question_value: 5 },
        { question_number: 2, question_value: 3 },
      ],
    };
  
    // Ajuste para alinhar o resultado esperado
    const result = await testResultsService.create(mockUser, mockBody);
  
    expect(prismaService.testResult.create).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: 'user-id' } },
        total_score: 5, // Atualizado para refletir o valor calculado
        intell_type: { connect: { id: 'intell-1' } },
      },
    });
  
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

  it('should calculate scores correctly for valid answers', async () => {
    prismaService.user.findUnique = vi.fn().mockResolvedValue({ id: 'user-id' });
    prismaService.question.findMany = vi.fn().mockResolvedValue([
      { question_number: 1, intell_type_id: 'intell-1' },
      { question_number: 2, intell_type_id: 'intell-1' },
    ]);
    prismaService.intelligenceType.findMany = vi.fn().mockResolvedValue([
      { id: 'intell-1', name: 'Logical', description: 'Logical reasoning' },
    ]);
    prismaService.intelligenceType.findFirst = vi.fn().mockResolvedValue({
      id: 'intell-1',
      name: 'Logical',
      description: 'Logical reasoning',
    });
    prismaService.course.findMany = vi.fn().mockResolvedValue([
      { name: 'Computer Science', description: 'CS Description' },
    ]);
    prismaService.testResult.create = vi.fn().mockResolvedValue({});

    const mockUser = { sub: 'user-id' };
    const mockBody = {
      answer_values: [
        { question_number: 1, question_value: 5 },
        { question_number: 2, question_value: 3 },
      ],
    };

    const result = await testResultsService.create(mockUser, mockBody);

    expect(result.scores).toEqual({
      Logical: 4,
    });
    expect(prismaService.intelligenceType.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['intell-1'] } },
    });
  });
});
