import { describe, expect, it } from 'vitest'

import { createCircularDependencyChecker } from '../circular-dependency-checker.ts'
import { inject } from '../types/symbols.ts'
import type { FindProvider } from './find-provider.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

describe('validate-declaration-recursive', () => {
  it('should skip validation for value provider', () => {
    const provider = {
      provide: 'test',
      useValue: 'value',
    }

    const findProvider: FindProvider = () => null
    const checker = createCircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({
        provider,
        findProvider,
        checker,
      }),
    ).not.toThrow()
  })

  it('should validate class provider', () => {
    class TestClass {
      static [inject] = ['dep1'] as const
    }

    const provider = {
      provide: 'test',
      useClass: TestClass,
    }

    const findProvider: FindProvider = (token) => ({
      provide: token,
      useValue: 'value',
    })

    const checker = createCircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({
        provider,
        findProvider,
        checker,
      }),
    ).not.toThrow()
  })

  it('should validate factory provider', () => {
    const provider = {
      provide: 'test',
      inject: ['dep1'] as const,
      useFactory: () => ({}),
    }

    const findProvider: FindProvider = (token) => ({
      provide: token,
      useValue: 'value',
    })

    const checker = createCircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({
        provider,
        findProvider,
        checker,
      }),
    ).not.toThrow()
  })

  it('should throw when class provider dependency not found', () => {
    class TestClass {
      static [inject] = ['missing-dep'] as const
    }

    const provider = {
      provide: 'test',
      useClass: TestClass,
    }

    const findProvider: FindProvider = () => null
    const checker = createCircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({
        provider,
        findProvider,
        checker,
      }),
    ).toThrow(
      'Cannot register token "test" (class "TestClass"): dependency "missing-dep" is not registered.',
    )
  })

  it('should throw when factory provider dependency not found', () => {
    const provider = {
      provide: 'test',
      inject: ['missing-dep'] as const,
      useFactory: () => ({}),
    }

    const findProvider: FindProvider = () => null
    const checker = createCircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({
        provider,
        findProvider,
        checker,
      }),
    ).toThrow(
      'Cannot register token "test": dependency "missing-dep" is not registered.',
    )
  })
})
