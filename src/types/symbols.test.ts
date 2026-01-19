import { describe, expect, it } from 'vitest'

import {
  inject,
  postConstruct,
  preDestroy,
  type as typeSymbol,
} from './symbols.ts'

describe('symbols', () => {
  it('should create unique symbols', () => {
    expect(typeof inject).toBe('symbol')
    expect(typeof typeSymbol).toBe('symbol')
    expect(typeof postConstruct).toBe('symbol')
    expect(typeof preDestroy).toBe('symbol')
  })

  it('should have descriptive symbol descriptions', () => {
    expect(inject.description).toBe('pocket-di:inject')
    expect(typeSymbol.description).toBe('pocket-di:type')
    expect(postConstruct.description).toBe('pocket-di:postConstruct')
    expect(preDestroy.description).toBe('pocket-di:preDestroy')
  })

  it('should be unique symbols', () => {
    expect(inject).not.toBe(typeSymbol)
    expect(inject).not.toBe(postConstruct)
    expect(inject).not.toBe(preDestroy)
    expect(typeSymbol).not.toBe(postConstruct)
    expect(typeSymbol).not.toBe(preDestroy)
    expect(postConstruct).not.toBe(preDestroy)
  })
})
