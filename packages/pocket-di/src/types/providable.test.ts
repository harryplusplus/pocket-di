import { describe, expect, it } from 'vitest'

import type { ClassProvider } from './class-provider.ts'
import {
  isInjectableConstructorProvidable,
  isProviderProvidable,
  providableToProvider,
} from './providable.ts'
import { inject } from './symbols.ts'
import { token } from './token.ts'
import type { ValueProvider } from './value-provider.ts'

describe('isProviderProvidable', () => {
  it('should return true for provider', () => {
    const provider: ValueProvider = {
      provide: token('test'),
      useValue: 'value',
    }

    expect(isProviderProvidable(provider)).toBe(true)
  })

  it('should return false for injectable constructor', () => {
    class TestClass {}

    expect(isProviderProvidable(TestClass)).toBe(false)
  })
})

describe('isInjectableConstructorProvidable', () => {
  it('should return true for injectable constructor', () => {
    class TestClass {}

    expect(isInjectableConstructorProvidable(TestClass)).toBe(true)
  })

  it('should return false for provider', () => {
    const provider: ValueProvider = {
      provide: token('test'),
      useValue: 'value',
    }

    expect(isInjectableConstructorProvidable(provider)).toBe(false)
  })
})

describe('providableToProvider', () => {
  it('should return provider as is', () => {
    const provider: ValueProvider = {
      provide: token('test'),
      useValue: 'value',
    }

    const result = providableToProvider(provider)

    expect(result).toBe(provider)
  })

  it('should convert injectable constructor to class provider', () => {
    class TestClass {
      static [inject] = [token('dep')] as const
    }

    const result = providableToProvider(TestClass)

    expect(result).toEqual({
      provide: TestClass,
      useClass: TestClass,
    } satisfies ClassProvider)
  })

  it('should convert injectable constructor without inject to class provider', () => {
    class TestClass {}

    const result = providableToProvider(TestClass)

    expect(result).toEqual({
      provide: TestClass,
      useClass: TestClass,
    } satisfies ClassProvider)
  })
})
