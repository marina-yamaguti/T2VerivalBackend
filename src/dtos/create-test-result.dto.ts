import { z } from 'zod'

export const CreateTestResultDto = z.object({
  answer_values: z.array(
    z.object({
      question_number: z.number(),
      question_value: z.number(),
    }),
  ),
})

export type CreateTestResultDtoSchema = z.infer<typeof CreateTestResultDto>
