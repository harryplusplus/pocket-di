import { describe, expect, it } from 'vitest'

import type { Providers } from '../container-context.ts'
import { ContainerContext } from '../container-context.ts'
import { validateProvider } from './validate-provider.ts'

describe('validate-provider', () => {
  it('should not throw when provider is new', () => {
    const providers: Providers = new Map()
    const token = 'test-token'

    expect(() =>
      validateProvider({
        providers,
        parent: null,
        token,
        override: false,
      }),
    ).not.toThrow()
  })

  it('should throw when duplicate in same container', () => {
    const providers: Providers = new Map()
    const token = 'test-token'

    providers.set(token, {
      provide: token,
      useValue: 'value',
    })

    expect(() =>
      validateProvider({
        providers,
        parent: null,
        token,
        override: false,
      }),
    ).toThrow(
      'Cannot register token "test-token": duplicate registration in same container.',
    )
  })

  it('should throw when exists in parent without override', () => {
    const parent = new ContainerContext({
      providers: [
        {
          provide: 'test-token',
          useValue: 'parent-value',
        },
      ],
    })

    const providers: Providers = new Map()
    const token = 'test-token'

    expect(() =>
      validateProvider({
        providers,
        parent,
        token,
        override: false,
      }),
    ).toThrow(
      'Cannot register token "test-token": already exists in parent container. Use override option to replace.',
    )
  })

  it('should not throw when exists in parent with override', () => {
    const parent = new ContainerContext({
      providers: [
        {
          provide: 'test-token',
          useValue: 'parent-value',
        },
      ],
    })

    const providers: Providers = new Map()
    const token = 'test-token'

    expect(() =>
      validateProvider({
        providers,
        parent,
        token,
        override: true,
      }),
    ).not.toThrow()
  })

  it('should work with class tokens', () => {
    class TestClass {}

    const providers: Providers = new Map()

    expect(() =>
      validateProvider({
        providers,
        parent: null,
        token: TestClass,
        override: false,
      }),
    ).not.toThrow()
  })
})
