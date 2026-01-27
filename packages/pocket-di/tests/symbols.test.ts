import { describe, expect, it } from 'vitest'

import {
  inject,
  postConstruct,
  preDestroy,
  type,
} from '../src/symbols.ts'

describe('symbols', () => {
  describe('symbol uniqueness', () => {
    it('should have unique symbols', () => {
      const symbols = [inject, postConstruct, preDestroy, type]

      const uniqueSymbols = new Set(symbols)
      expect(uniqueSymbols.size).toBe(4)
    })

    it('should not be equal to each other', () => {
      expect(inject).not.toBe(postConstruct)
      expect(inject).not.toBe(preDestroy)
      expect(inject).not.toBe(type)
      expect(postConstruct).not.toBe(preDestroy)
      expect(postConstruct).not.toBe(type)
      expect(preDestroy).not.toBe(type)
    })
  })

  describe('symbol types', () => {
    it('should be of type symbol', () => {
      expect(typeof inject).toBe('symbol')
      expect(typeof postConstruct).toBe('symbol')
      expect(typeof preDestroy).toBe('symbol')
      expect(typeof type).toBe('symbol')
    })
  })

  describe('symbol descriptions', () => {
    it('should have correct namespace prefix', () => {
      expect(inject.toString()).toContain('pocket-di:')
      expect(postConstruct.toString()).toContain('pocket-di:')
      expect(preDestroy.toString()).toContain('pocket-di:')
      expect(type.toString()).toContain('pocket-di:')
    })

    it('should have correct symbol names', () => {
      expect(inject.toString()).toBe('Symbol(pocket-di:inject)')
      expect(postConstruct.toString()).toBe('Symbol(pocket-di:postConstruct)')
      expect(preDestroy.toString()).toBe('Symbol(pocket-di:preDestroy)')
      expect(type.toString()).toBe('Symbol(pocket-di:type)')
    })
  })
})
