import { z } from 'zod'

export const CreateQuestionDto = z.object({
  question_number: z.number(),
  question_text: z.string(),
  score_value: z.number(),
  intelligence_name: z.string(),
})

export type CreateQuestionDtoSchema = z.infer<typeof CreateQuestionDto>
