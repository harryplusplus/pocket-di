import { describe, expect, it } from 'vitest'

import type { ClassProvider, FactoryProvider } from '../types/provider.ts'
import { postConstruct } from '../types/symbols.ts'
import { resolveInstanceAsync } from './resolve-instance-async.ts'

describe('resolveInstanceAsync with class provider', () => {
  it('should create instance from class', async () => {
    class TestClass {
      value = 'test'
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const result = await resolveInstanceAsync({ provider, dependencies: [] })

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

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    await resolveInstanceAsync({ provider, dependencies: [] })

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

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    await resolveInstanceAsync({ provider, dependencies: [] })

    expect(called).toBe(true)
  })
})

describe('resolveInstanceAsync with factory provider', () => {
  it('should create instance from factory', async () => {
    const instance = { value: 'test' }

    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => instance,
    }

    const result = await resolveInstanceAsync({ provider, dependencies: [] })

    expect(result).toBe(instance)
  })

  it('should await factory if returns Promise', async () => {
    const instance = { value: 'test' }

    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: async () => Promise.resolve(instance),
    }

    const result = await resolveInstanceAsync({ provider, dependencies: [] })

    expect(result).toBe(instance)
  })
})
