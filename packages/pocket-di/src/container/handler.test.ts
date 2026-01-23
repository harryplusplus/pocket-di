// packages/pocket-di/src/container/handler.test.ts
import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { createContainer } from './proxy.ts'

describe('handler - get method', () => {
  it('should get singleton instance directly without resolving', async () => {
    class Service {
      value = 42
    }

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    // Resolve first to create singleton
    await container.service.resolve()

    // Get should return the same instance without resolving again
    const instance = container.service.get()

    expect(instance).toBeInstanceOf(Service)
    expect(instance.value).toBe(42)
  })

  it('should throw error when no singleton exists', () => {
    class Service {}

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
      scope: 'transient',
    })

    const container = createContainer({ providers: [serviceProvider] })

    expect(() => container.service.get()).toThrow(
      'No singleton found for key "service".',
    )
  })
})

describe('handler - hasSingleton method', () => {
  it('should return true when singleton exists', async () => {
    class Service {}

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    expect(container.service.hasSingleton()).toBe(false)

    await container.service.resolve()

    expect(container.service.hasSingleton()).toBe(true)
  })

  it('should return false when singleton does not exist', () => {
    class Service {}

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    expect(container.service.hasSingleton()).toBe(false)
  })

  it('should respect options when checking singleton existence', async () => {
    class Service {}

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    await container.service.resolve()

    // Should find singleton by default (searches parent)
    expect(container.service.hasSingleton()).toBe(true)

    // With searchParent: false, should only search current container
    expect(container.service.hasSingleton({ searchParent: false })).toBe(true)
  })
})

describe('handler - resolveSync method', () => {
  it('should resolve instance synchronously', () => {
    class Service {
      value = 42
    }

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    const instance = container.service.resolveSync()

    expect(instance).toBeInstanceOf(Service)
    expect(instance.value).toBe(42)
  })
})
