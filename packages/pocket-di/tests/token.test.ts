import { describe, expect, it } from 'vitest'

import {
  isConstructorToken,
  isPlainToken,
  isTokenWithTypeToken,
  type TokenWithType,
  tokenWithType,
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
      const token = tokenWithType<TestService>('my-token')
      expect(isPlainToken(token)).toBe(false)
    })
  })

  describe('tokenWithType', () => {
    it('should create token with type from string', () => {
      const token = tokenWithType<TestService>('service-token')

      expect(token.token).toBe('service-token')
    })

    it('should create token with type from symbol', () => {
      const symbol = Symbol('service-symbol')
      const token = tokenWithType<TestService>(symbol)

      expect(token.token).toBe(symbol)
    })

    it('should preserve type information', () => {
      const token = tokenWithType<TestService>('test-token')

      // Type assertion to verify type is preserved
      const typed: TokenWithType<TestService> = token
      expect(typed.token).toBe('test-token')
    })
  })

  describe('isTokenWithTypeToken', () => {
    it('should return true for token with type symbol', () => {
      const token = tokenWithType<TestService>('test-token')
      expect(isTokenWithTypeToken(token)).toBe(true)
    })

    it('should return false for string tokens', () => {
      expect(isTokenWithTypeToken('my-token')).toBe(false)
    })

    it('should return false for symbol tokens', () => {
      expect(isTokenWithTypeToken(Symbol('my-symbol'))).toBe(false)
    })

    it('should return false for constructor tokens', () => {
      expect(isTokenWithTypeToken(TestService)).toBe(false)
    })

    it('should return false for plain objects', () => {
      expect(isTokenWithTypeToken({} as any)).toBe(false)
      expect(isTokenWithTypeToken({ token: 'test' } as any)).toBe(false)
    })

    it('should return false for objects without type symbol', () => {
      const obj = { token: 'test', other: 'value' }
      expect(isTokenWithTypeToken(obj as any)).toBe(false)
    })
  })

  describe('isConstructorToken', () => {
    it('should return true for constructor functions', () => {
      expect(isConstructorToken(TestService)).toBe(true)

      class AnotherService {
        value = 42
      }
      expect(isConstructorToken(AnotherService)).toBe(true)
    })

    it('should return false for string tokens', () => {
      expect(isConstructorToken('my-token')).toBe(false)
    })

    it('should return false for symbol tokens', () => {
      expect(isConstructorToken(Symbol('my-symbol'))).toBe(false)
    })

    it('should return false for object tokens', () => {
      const token = tokenWithType<TestService>('test-token')
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
