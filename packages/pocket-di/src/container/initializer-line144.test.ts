// packages/pocket-di/src/container/initializer-line144.test.ts
// This test directly manipulates internal state to trigger line 144 defensive check

import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { token } from '../types/token.ts'
import { ContainerInitializer } from './initializer.ts'
import { ContainerImpl } from './impl.ts'

describe('initializer - line 144 defensive check', () => {
  it('should throw error when local registry has key but validKeySet does not', () => {
    const serviceToken = token<{ value: number }>()('service')

    const provider = defineClassProvider({
      provide: serviceToken,
      useClass: class {
        constructor(_deps: object) {}
      },
    })

    // Create empty container
    const impl = new ContainerImpl({ providers: [] })

    // Manually add provider to registry WITHOUT going through normal flow
    impl.$context.providerRegistry.set('service', provider)
    // Note: validKeySet does NOT have 'service' yet

    // Now try to initialize with the same provider
    // This creates the inconsistent state that line 144 protects against
    const initializer = new ContainerInitializer(impl, {
      providers: [provider],
      override: false,
      parent: null,
    })

    expect(() => initializer.init()).toThrow(
      'Cannot register key "service": duplicate registration in same container.',
    )
  })
})
