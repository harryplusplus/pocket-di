import { describe, expect, it } from 'vitest'

import { Registry } from '../registry.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import { token } from '../types/token.ts'
import type { ValueProvider } from '../types/value-provider.ts'
import { validateProvider } from './validate-provider.ts'

describe('validateProvider with parent', () => {
  it('should throw error when token exists in parent without override', () => {
    const parent: ProviderRegistry = new Registry(null)
    const parentProvider: ValueProvider = {
      provide: token('test'),
      useValue: {},
    }
    parent.map.set('test', parentProvider)

    const providerRegistry: ProviderRegistry = new Registry(parent)

    expect(() =>
      validateProvider({ providerRegistry, token: 'test', override: false }),
    ).toThrow(
      'Cannot register token "test": already exists in parent container. Use override option to replace',
    )
  })

  it('should not throw when token exists in parent with override', () => {
    const parent: ProviderRegistry = new Registry(null)
    const parentProvider: ValueProvider = {
      provide: token('test'),
      useValue: {},
    }
    parent.map.set('test', parentProvider)

    const providerRegistry: ProviderRegistry = new Registry(parent)

    expect(() =>
      validateProvider({ providerRegistry, token: 'test', override: true }),
    ).not.toThrow()
  })
})

describe('validateProvider local duplicate', () => {
  it('should throw error when token exists in same container', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)
    const localProvider: ValueProvider = {
      provide: token('test'),
      useValue: {},
    }
    providerRegistry.map.set('test', localProvider)

    expect(() =>
      validateProvider({ providerRegistry, token: 'test', override: false }),
    ).toThrow(
      'Cannot register token "test": duplicate registration in same container',
    )
  })

  it('should throw error even with override for local duplicate', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)
    const localProvider: ValueProvider = {
      provide: token('test'),
      useValue: {},
    }
    providerRegistry.map.set('test', localProvider)

    expect(() =>
      validateProvider({ providerRegistry, token: 'test', override: true }),
    ).toThrow(
      'Cannot register token "test": duplicate registration in same container',
    )
  })

  it('should not throw for new token', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)

    expect(() =>
      validateProvider({ providerRegistry, token: 'test', override: false }),
    ).not.toThrow()
  })
})
