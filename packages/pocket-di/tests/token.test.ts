import { describe, expect, it } from 'vitest'

import {
  defineToken,
  isConstructorToken,
  isPlainToken,
  isTypedToken,
  type TypedToken,
} from '../src/token.ts'

class TestService {}

describe('token', () => {
  describe('isPlainToken', () => {
    it('should return true for string tokens', () => {
      expect(isPlainToken('my-token')).toBe(true)
      expect(isPlainToken('')).toBe(true)
    })

    it('should return true for symbol tokens', () => {
      const symbol = Symbol('my-symbol')
      expect(isPlainToken(symbol)).toBe(true)
      expect(isPlainToken(Symbol())).toBe(true)
    })

    it('should return false for constructor tokens', () => {
      expect(isPlainToken(TestService)).toBe(false)
    })

    it('should return false for object tokens', () => {
      const token = defineToken<TestService>('my-token')
      expect(isPlainToken(token)).toBe(false)
    })
  })

  describe('defineToken', () => {
    it('should create token with type from string', () => {
      const token = defineToken<TestService>('service-token')

      expect(token.token).toBe('service-token')
    })

    it('should create token with type from symbol', () => {
      const symbol = Symbol('service-symbol')
      const token = defineToken<TestService>(symbol)

      expect(token.token).toBe(symbol)
    })

    it('should preserve type information', () => {
      const token = defineToken<TestService>('test-token')

      // Type assertion to verify type is preserved
      const typed: TypedToken<TestService> = token
      expect(typed.token).toBe('test-token')
    })
  })

  describe('isTypedToken', () => {
    it('should return true for token with type symbol', () => {
      const token = defineToken<TestService>('test-token')
      expect(isTypedToken(token)).toBe(true)
    })

    it('should return false for string tokens', () => {
      expect(isTypedToken('my-token')).toBe(false)
    })

    it('should return false for symbol tokens', () => {
      expect(isTypedToken(Symbol('my-symbol'))).toBe(false)
    })

    it('should return false for constructor tokens', () => {
      expect(isTypedToken(TestService)).toBe(false)
    })

    it('should return false for plain objects', () => {
      expect(isTypedToken({} as any)).toBe(false)
      expect(isTypedToken({ token: 'test' } as any)).toBe(false)
    })

    it('should return false for objects without type symbol', () => {
      const obj = { token: 'test', other: 'value' }
      expect(isTypedToken(obj as any)).toBe(false)
    })
  })

  describe('isConstructorToken', () => {
    it('should return true for constructor functions', () => {
      expect(isConstructorToken(TestService)).toBe(true)

      class AnotherService {}
      expect(isConstructorToken(AnotherService)).toBe(true)
    })

    it('should return false for string tokens', () => {
      expect(isConstructorToken('my-token')).toBe(false)
    })

    it('should return false for symbol tokens', () => {
      expect(isConstructorToken(Symbol('my-symbol'))).toBe(false)
    })

    it('should return false for object tokens', () => {
      const token = defineToken<TestService>('test-token')
      expect(isConstructorToken(token)).toBe(false)
    })

    it('should return false for objects', () => {
      expect(isConstructorToken({} as any)).toBe(false)
    })

    it('should return false for null and undefined', () => {
      expect(isConstructorToken(null as any)).toBe(false)
      expect(isConstructorToken(undefined as any)).toBe(false)
    })
  })
})
