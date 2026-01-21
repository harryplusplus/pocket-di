import { describe, expect, it } from 'vitest'

import { inject } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import type { Any } from '../types/utils.ts'
import type { ValueProvider } from '../types/value-provider.ts'
import { parse } from './parse.ts'

describe('parse basic', () => {
  it('should parse providables and validate', () => {
    const provider: ValueProvider = { provide: token('test'), useValue: {} }

    const result = parse({
      providables: [provider],
      parentProviderRegistry: null,
      override: false,
    })

    expect(result.map.get('test')).toBe(provider)
  })

  it('should validate all providers after parsing', () => {
    class DepClass {}

    class TestClass {
      static [inject] = { dep: DepClass }
    }

    const result = parse({
      providables: [DepClass, TestClass],
      parentProviderRegistry: null,
      override: false,
    })

    expect(result.map.get(TestClass)).toBeDefined()
    expect(result.map.get(DepClass)).toBeDefined()
  })
})

describe('parse validation errors', () => {
  it('should throw error for missing dependency', () => {
    class TestClass {
      static [inject] = ['missing'] as const
    }

    expect(() =>
      parse({
        providables: [TestClass],
        parentProviderRegistry: null,
        override: false,
      }),
    ).toThrow('dependency "missing" is not registered')
  })

  it('should throw error for circular dependency', () => {
    class ClassB {
      static [inject]: Any
    }

    class ClassA {
      static [inject] = [ClassB] as const
    }

    ClassB[inject] = [ClassA] as const

    expect(() =>
      parse({
        providables: [ClassA, ClassB],
        parentProviderRegistry: null,
        override: false,
      }),
    ).toThrow('Circular dependency detected')
  })
})
