import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { defineFactoryProvider } from '../src/factory-provider.ts'
import {
  isClassProvider,
  isConstructorProvider,
  isFactoryProvider,
  isValueProvider,
  type Provider,
} from '../src/provider.ts'
import { defineValueProvider } from '../src/value-provider.ts'

class TestService {}

class AnotherService {}

describe('provider', () => {
  describe('isValueProvider', () => {
    it('should return true for ValueProvider', () => {
      const provider: Provider = defineValueProvider({
        provide: 'test-token',
        useValue: new TestService(),
      })

      expect(isValueProvider(provider)).toBe(true)
    })

    it('should return false for ClassProvider', () => {
      const provider: Provider = defineClassProvider({
        provide: 'test-token',
        useClass: TestService,
      })

      expect(isValueProvider(provider)).toBe(false)
    })

    it('should return false for FactoryProvider', () => {
      const provider: Provider = defineFactoryProvider({
        provide: 'test-token',
        useFactory: () => new TestService(),
      })

      expect(isValueProvider(provider)).toBe(false)
    })

    it('should return false for Constructor provider', () => {
      const provider: Provider = TestService

      expect(isValueProvider(provider)).toBe(false)
    })
  })

  describe('isClassProvider', () => {
    it('should return true for ClassProvider', () => {
      const provider: Provider = defineClassProvider({
        provide: 'test-token',
        useClass: TestService,
      })

      expect(isClassProvider(provider)).toBe(true)
    })

    it('should return false for ValueProvider', () => {
      const provider: Provider = defineValueProvider({
        provide: 'test-token',
        useValue: new TestService(),
      })

      expect(isClassProvider(provider)).toBe(false)
    })

    it('should return false for FactoryProvider', () => {
      const provider: Provider = defineFactoryProvider({
        provide: 'test-token',
        useFactory: () => new TestService(),
      })

      expect(isClassProvider(provider)).toBe(false)
    })

    it('should return false for Constructor provider', () => {
      const provider: Provider = TestService

      expect(isClassProvider(provider)).toBe(false)
    })
  })

  describe('isFactoryProvider', () => {
    it('should return true for FactoryProvider', () => {
      const provider: Provider = defineFactoryProvider({
        provide: 'test-token',
        useFactory: () => new TestService(),
      })

      expect(isFactoryProvider(provider)).toBe(true)
    })

    it('should return false for ValueProvider', () => {
      const provider: Provider = defineValueProvider({
        provide: 'test-token',
        useValue: new TestService(),
      })

      expect(isFactoryProvider(provider)).toBe(false)
    })

    it('should return false for ClassProvider', () => {
      const provider: Provider = defineClassProvider({
        provide: 'test-token',
        useClass: TestService,
      })

      expect(isFactoryProvider(provider)).toBe(false)
    })

    it('should return false for Constructor provider', () => {
      const provider: Provider = TestService

      expect(isFactoryProvider(provider)).toBe(false)
    })
  })

  describe('isConstructorProvider', () => {
    it('should return true for Constructor provider', () => {
      const provider: Provider = TestService

      expect(isConstructorProvider(provider)).toBe(true)
    })

    it('should return true for another Constructor provider', () => {
      const provider: Provider = AnotherService

      expect(isConstructorProvider(provider)).toBe(true)
    })

    it('should return false for ValueProvider', () => {
      const provider: Provider = defineValueProvider({
        provide: 'test-token',
        useValue: new TestService(),
      })

      expect(isConstructorProvider(provider)).toBe(false)
    })

    it('should return false for ClassProvider', () => {
      const provider: Provider = defineClassProvider({
        provide: 'test-token',
        useClass: TestService,
      })

      expect(isConstructorProvider(provider)).toBe(false)
    })

    it('should return false for FactoryProvider', () => {
      const provider: Provider = defineFactoryProvider({
        provide: 'test-token',
        useFactory: () => new TestService(),
      })

      expect(isConstructorProvider(provider)).toBe(false)
    })
  })

  describe('Provider type', () => {
    it('should accept ValueProvider', () => {
      const provider: Provider = defineValueProvider({
        provide: 'test-token',
        useValue: new TestService(),
      })

      expect(provider).toBeDefined()
    })

    it('should accept ClassProvider', () => {
      const provider: Provider = defineClassProvider({
        provide: 'test-token',
        useClass: TestService,
      })

      expect(provider).toBeDefined()
    })

    it('should accept FactoryProvider', () => {
      const provider: Provider = defineFactoryProvider({
        provide: 'test-token',
        useFactory: () => new TestService(),
      })

      expect(provider).toBeDefined()
    })

    it('should accept Constructor', () => {
      const provider: Provider = TestService

      expect(provider).toBeDefined()
    })
  })
})
