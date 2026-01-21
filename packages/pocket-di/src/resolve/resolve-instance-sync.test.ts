import { describe, expect, it } from 'vitest'

import type { ClassProvider } from '../types/class-provider.ts'
import type { FactoryProvider } from '../types/factory-provider.ts'
import { postConstruct } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import { resolveInstanceSync } from './resolve-instance-sync.ts'

describe('resolveInstanceSync with class provider', () => {
  it('should create instance from class', () => {
    class TestClass {
      value = 'test'
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const result = resolveInstanceSync({
      token: 'test',
      provider,
      dependencies: [],
    })

    expect(result).toBeInstanceOf(TestClass)
    expect((result as TestClass).value).toBe('test')
  })

  it('should call postConstruct if defined', () => {
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

    resolveInstanceSync({ token: 'test', provider, dependencies: [] })

    expect(called).toBe(true)
  })

  it('should throw error if postConstruct returns Promise', () => {
    class TestClass {
      [postConstruct]() {
        return Promise.resolve()
      }
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    expect(() =>
      resolveInstanceSync({ token: 'test', provider, dependencies: [] }),
    ).toThrow(
      'Cannot resolve "test" (TestClass) synchronously: postConstruct returns Promise',
    )
  })
})

describe('resolveInstanceSync with factory provider', () => {
  it('should create instance from factory', () => {
    const instance = { value: 'test' }

    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => instance,
    }

    const result = resolveInstanceSync({
      token: 'test',
      provider,
      dependencies: [],
    })

    expect(result).toBe(instance)
  })

  it('should throw error if factory returns Promise', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => Promise.resolve({}),
    }

    expect(() =>
      resolveInstanceSync({ token: 'test', provider, dependencies: [] }),
    ).toThrow('Cannot resolve "test" synchronously: useFactory returns Promise')
  })
})
