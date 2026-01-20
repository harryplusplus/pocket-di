import { describe, expect, it } from 'vitest'

import {
  type ClassProvider,
  classProviderToDeclaration,
  defineProvider,
  type FactoryProvider,
  factoryProviderToDeclaration,
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
  type ValueProvider,
} from './provider.ts'
import { inject } from './symbols.ts'

describe('defineProvider', () => {
  it('should return provider when called with provider', () => {
    const provider: ValueProvider = { provide: 'test', useValue: 'value' }

    const result = defineProvider(provider)

    expect(result).toBe(provider)
  })

  it('should return provider function when called without arguments', () => {
    const providerFn = defineProvider()

    const provider: ValueProvider = { provide: 'test', useValue: 'value' }

    const result = providerFn(provider)

    expect(result).toBe(provider)
  })
})

describe('isValueProvider', () => {
  it('should return true for value provider', () => {
    const provider: ValueProvider = { provide: 'test', useValue: 'value' }

    expect(isValueProvider(provider)).toBe(true)
  })

  it('should return false for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    expect(isValueProvider(provider)).toBe(false)
  })

  it('should return false for factory provider', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => ({}),
    }

    expect(isValueProvider(provider)).toBe(false)
  })
})

describe('isClassProvider', () => {
  it('should return true for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    expect(isClassProvider(provider)).toBe(true)
  })

  it('should return false for value provider', () => {
    const provider: ValueProvider = { provide: 'test', useValue: 'value' }

    expect(isClassProvider(provider)).toBe(false)
  })

  it('should return false for factory provider', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => ({}),
    }

    expect(isClassProvider(provider)).toBe(false)
  })
})

describe('isFactoryProvider', () => {
  it('should return true for factory provider', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => ({}),
    }

    expect(isFactoryProvider(provider)).toBe(true)
  })

  it('should return false for value provider', () => {
    const provider: ValueProvider = { provide: 'test', useValue: 'value' }

    expect(isFactoryProvider(provider)).toBe(false)
  })

  it('should return false for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    expect(isFactoryProvider(provider)).toBe(false)
  })
})

describe('classProviderToDeclaration', () => {
  it('should return inject declaration from class', () => {
    class TestClass {
      static [inject] = ['dep1', 'dep2'] as const
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const result = classProviderToDeclaration(provider)

    expect(result).toEqual(['dep1', 'dep2'])
  })

  it('should return empty object when no inject declaration', () => {
    class TestClass {}

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const result = classProviderToDeclaration(provider)

    expect(result).toEqual({})
  })
})

describe('factoryProviderToDeclaration', () => {
  it('should return inject declaration from factory', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      inject: ['dep1', 'dep2'] as const,
      useFactory: () => ({}),
    }

    const result = factoryProviderToDeclaration(provider)

    expect(result).toEqual(['dep1', 'dep2'])
  })

  it('should return empty object when no inject declaration', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => ({}),
    }

    const result = factoryProviderToDeclaration(provider)

    expect(result).toEqual({})
  })
})
