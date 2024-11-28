import { AppService } from '@/services/app.service'
import { beforeEach, describe, expect, it } from 'vitest'

describe('AppService', () => {
  let appService: AppService

  beforeEach(() => {
    appService = new AppService()
  })

  it('should return "App is alive!"', () => {
    const result = appService.getHealth()
    expect(result).toBe('App is alive!')
  })
})
