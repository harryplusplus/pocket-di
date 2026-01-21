import { describe, expect, it } from 'vitest'

import { Registry } from '../registry.ts'
import type { ClassProvider } from '../types/class-provider.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import { token } from '../types/token.ts'
import type { ValueProvider } from '../types/value-provider.ts'
import { parseProviderRegistry } from './parse-provider-registry.ts'

describe('parseProviderRegistry basic', () => {
  it('should parse provider providable', () => {
    const provider: ValueProvider = { provide: token('test'), useValue: {} }

    const result = parseProviderRegistry({
      parentProviderRegistry: null,
      override: false,
      providables: [provider],
    })

    expect(result.map.get('test')).toBe(provider)
  })

  it('should parse injectable constructor providable', () => {
    class TestClass {}

    const result = parseProviderRegistry({
      parentProviderRegistry: null,
      override: false,
      providables: [TestClass],
    })

    const registered = result.map.get(TestClass) as ClassProvider

    expect(registered.provide).toBe(TestClass)
    expect(registered.useClass).toBe(TestClass)
  })

  it('should parse multiple providables', () => {
    const provider1: ValueProvider = { provide: token('test1'), useValue: {} }

    class TestClass {}

    const result = parseProviderRegistry({
      parentProviderRegistry: null,
      override: false,
      providables: [provider1, TestClass],
    })

    expect(result.map.get('test1')).toBe(provider1)
    expect(result.map.get(TestClass)).toBeDefined()
  })
})

describe('parseProviderRegistry with parent', () => {
  it('should set parent registry', () => {
    const parent: ProviderRegistry = new Registry(null)

    const result = parseProviderRegistry({
      parentProviderRegistry: parent,
      override: false,
      providables: [],
    })

    expect(result.parent).toBe(parent)
  })

  it('should throw error for duplicate without override', () => {
    const parent: ProviderRegistry = new Registry(null)
    const parentProvider: ValueProvider = {
      provide: token('test'),
      useValue: {},
    }
    parent.map.set('test', parentProvider)

    const newProvider: ValueProvider = { provide: token('test'), useValue: {} }

    expect(() =>
      parseProviderRegistry({
        parentProviderRegistry: parent,
        override: false,
        providables: [newProvider],
      }),
    ).toThrow('already exists in parent container')
  })

  it('should allow override with override option', () => {
    const parent: ProviderRegistry = new Registry(null)
    const parentProvider: ValueProvider = {
      provide: token('test'),
      useValue: 'old',
    }
    parent.map.set('test', parentProvider)

    const newProvider: ValueProvider = {
      provide: token('test'),
      useValue: 'new',
    }

    const result = parseProviderRegistry({
      parentProviderRegistry: parent,
      override: true,
      providables: [newProvider],
    })

    expect(result.map.get('test')).toBe(newProvider)
  })
})
