import { z } from 'zod'

export const CreateCourseDto = z.object({
  name: z.string(),
  description: z.string(),
  intelligences: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .optional(),
})

export type CreateCourseDtoSchema = z.infer<typeof CreateCourseDto>
