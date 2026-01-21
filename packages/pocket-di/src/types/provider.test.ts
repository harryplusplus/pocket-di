import { describe, expect, it } from 'vitest'

import { type ClassProvider } from './class-provider.ts'
import { type FactoryProvider } from './factory-provider.ts'
import {
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
} from './provider.ts'
import { token } from './token.ts'
import type { ValueProvider } from './value-provider.ts'

describe('isValueProvider', () => {
  it('should return true for value provider', () => {
    const provider: ValueProvider = {
      provide: token('test'),
      useValue: 'value',
    }

    expect(isValueProvider(provider)).toBe(true)
  })

  it('should return false for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    expect(isValueProvider(provider)).toBe(false)
  })

  it('should return false for factory provider', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => ({}),
    }

    expect(isValueProvider(provider)).toBe(false)
  })
})

describe('isClassProvider', () => {
  it('should return true for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    expect(isClassProvider(provider)).toBe(true)
  })

  it('should return false for value provider', () => {
    const provider: ValueProvider = {
      provide: token('test'),
      useValue: 'value',
    }

    expect(isClassProvider(provider)).toBe(false)
  })

  it('should return false for factory provider', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => ({}),
    }

    expect(isClassProvider(provider)).toBe(false)
  })
})

describe('isFactoryProvider', () => {
  it('should return true for factory provider', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => ({}),
    }

    expect(isFactoryProvider(provider)).toBe(true)
  })

  it('should return false for value provider', () => {
    const provider: ValueProvider = {
      provide: token('test'),
      useValue: 'value',
    }

    expect(isFactoryProvider(provider)).toBe(false)
  })

  it('should return false for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    expect(isFactoryProvider(provider)).toBe(false)
  })
})
