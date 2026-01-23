// packages/pocket-di/src/container/common-resolver.test.ts
import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { createContainer } from './proxy.ts'

describe('common-resolver - provider not found error', () => {
  it('should throw error when provider is not found during resolve', async () => {
    class Service {}

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
      scope: 'transient',
    })

    const container = createContainer({ providers: [serviceProvider] })

    // Corrupt the provider registry to simulate missing provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const impl = container as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    impl.$context.providerRegistry.clear()

    await expect(container.service.resolve()).rejects.toThrow(
      'Internal error: provider for token "service" not found during resolve.',
    )
  })

  it('should throw error when provider is not found during resolveSync', () => {
    class Service {}

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
      scope: 'transient',
    })

    const container = createContainer({ providers: [serviceProvider] })

    // Corrupt the provider registry
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const impl = container as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    impl.$context.providerRegistry.clear()

    expect(() => container.service.resolveSync()).toThrow(
      'Internal error: provider for token "service" not found during resolve.',
    )
  })
})
