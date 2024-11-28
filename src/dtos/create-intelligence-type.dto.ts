import { z } from 'zod'

export const CreateIntelligenceTypeDto = z.object({
  description: z.string(),
  name: z.string(),
  courses: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .optional(),
})

export type CreateIntelligenceTypeDtoSchema = z.infer<
  typeof CreateIntelligenceTypeDto
>
