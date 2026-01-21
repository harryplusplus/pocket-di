import { describe, expect, it } from 'vitest'

import type { ClassProvider } from '../types/class-provider.ts'
import type { FactoryProvider } from '../types/factory-provider.ts'
import { postConstruct } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import { resolveInstanceAsync } from './resolve-instance-async.ts'

describe('resolveInstanceAsync with class provider', () => {
  it('should create instance from class', async () => {
    class TestClass {
      value = 'test'
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const result = await resolveInstanceAsync({ provider, dependencies: {} })

    expect(result).toBeInstanceOf(TestClass)
    expect((result as TestClass).value).toBe('test')
  })

  it('should call postConstruct if defined', async () => {
    let called = false

    class TestClass {
      [postConstruct]() {
        called = true
      }
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    await resolveInstanceAsync({ provider, dependencies: {} })

    expect(called).toBe(true)
  })

  it('should await postConstruct if returns Promise', async () => {
    let called = false

    class TestClass {
      async [postConstruct]() {
        await Promise.resolve()
        called = true
      }
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    await resolveInstanceAsync({ provider, dependencies: {} })

    expect(called).toBe(true)
  })
})

describe('resolveInstanceAsync with factory provider', () => {
  it('should create instance from factory', async () => {
    const instance = { value: 'test' }

    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => instance,
    }

    const result = await resolveInstanceAsync({ provider, dependencies: {} })

    expect(result).toBe(instance)
  })

  it('should await factory if returns Promise', async () => {
    const instance = { value: 'test' }

    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: async () => Promise.resolve(instance),
    }

    const result = await resolveInstanceAsync({ provider, dependencies: {} })

    expect(result).toBe(instance)
  })
})
