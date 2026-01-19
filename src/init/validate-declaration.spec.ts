import { describe, expect, it } from 'vitest'

import { createCircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { InjectDeclaration } from '../types/inject-declaration.ts'
import { inject } from '../types/symbols.ts'
import type { FindProvider } from './find-provider.ts'
import { validateDeclaration } from './validate-declaration.ts'

describe('validate-declaration', () => {
  describe('tuple declaration', () => {
    it('should validate tuple declaration successfully', () => {
      const declaration: InjectDeclaration = ['dep1', 'dep2'] as const

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).not.toThrow()
    })

    it('should throw when dependency not found', () => {
      const declaration: InjectDeclaration = ['dep1', 'dep2'] as const

      const findProvider: FindProvider = () => null

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).toThrow(
        'Cannot register token "test": dependency "dep1" is not registered.',
      )
    })

    it('should include class name in error message', () => {
      const declaration: InjectDeclaration = ['dep1'] as const

      const findProvider: FindProvider = () => null

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: 'TestClass',
        }),
      ).toThrow(
        'Cannot register token "test" (class "TestClass"): dependency "dep1" is not registered.',
      )
    })
  })

  describe('record declaration', () => {
    it('should validate record declaration successfully', () => {
      const declaration: InjectDeclaration = {
        dep1: 'dep1',
        dep2: 'dep2',
      }

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).not.toThrow()
    })

    it('should throw when dependency not found', () => {
      const declaration: InjectDeclaration = {
        dep1: 'dep1',
      }

      const findProvider: FindProvider = () => null

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).toThrow(
        'Cannot register token "test": dependency "dep1" is not registered.',
      )
    })

    it('should throw for invalid property name __proto__', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const declaration = Object.create(null)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      declaration.__proto__ = 'dep1'

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).toThrow(
        'Cannot register token "test": invalid dependency property name "__proto__".',
      )
    })

    it('should throw for invalid property name constructor', () => {
      const declaration: InjectDeclaration = {
        constructor: 'dep1',
      }

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).toThrow(
        'Cannot register token "test": invalid dependency property name "constructor".',
      )
    })

    it('should throw for invalid property name prototype', () => {
      const declaration: InjectDeclaration = {
        prototype: 'dep1',
      }

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).toThrow(
        'Cannot register token "test": invalid dependency property name "prototype".',
      )
    })

    it('should throw for empty property name', () => {
      const declaration: InjectDeclaration = {
        '': 'dep1',
      }

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).toThrow(
        'Cannot register token "test": invalid dependency property name "".',
      )
    })

    it('should include class name in property name error', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const declaration = Object.create(null)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      declaration.__proto__ = 'dep1'

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useValue: 'value',
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          declaration,
          findProvider,
          checker,
          className: 'TestClass',
        }),
      ).toThrow(
        'Cannot register token "test" (class "TestClass"): invalid dependency property name "__proto__".',
      )
    })
  })

  describe('with class tokens', () => {
    it('should work with class dependencies', () => {
      class Dependency {
        static [inject] = [] as const
      }

      const declaration: InjectDeclaration = [Dependency] as const

      const findProvider: FindProvider = (token) => ({
        provide: token,
        useClass: Dependency,
      })

      const checker = createCircularDependencyChecker()

      expect(() =>
        validateDeclaration({
          token: 'test',
          declaration,
          findProvider,
          checker,
          className: null,
        }),
      ).not.toThrow()
    })
  })
})
