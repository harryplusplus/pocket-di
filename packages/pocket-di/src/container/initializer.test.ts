// packages/pocket-di/src/container/initializer.test.ts
import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { defineFactoryProvider } from '../types/factory-provider.ts'
import { inject } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import { createContainer } from './proxy.ts'

describe('initializer - missing dependency error', () => {
  it('should throw error when dependency is not registered', () => {
    const missingToken = token<{ value: number }>()('missing')

    class Service {
      static [inject] = { dep: missingToken }

      constructor(_deps: object) {}
    }

    expect(() =>
      createContainer({
        providers: [
          defineClassProvider({ provide: 'service', useClass: Service }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service" (class "Service"): dependency "missing" is not registered.',
    )
  })

  it('should throw error when factory dependency is not registered', () => {
    const missingToken = token<{ value: number }>()('missing')

    expect(() =>
      createContainer({
        providers: [
          defineFactoryProvider({
            provide: 'service',
            useFactory: () => ({ value: 42 }),
            inject: { dep: missingToken },
          }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service": dependency "missing" is not registered.',
    )
  })
})

describe('initializer - invalid dependency name error', () => {
  it('should throw error for __proto__ dependency name in factory', () => {
    const depToken = token<{ value: number }>()('dep')

    const injectMetadata: Record<string, unknown> = {}
    Object.defineProperty(injectMetadata, '__proto__', {
      value: depToken,
      enumerable: true,
    })

    expect(() =>
      createContainer({
        providers: [
          defineClassProvider({ provide: depToken, useClass: class {} }),
          defineFactoryProvider({
            provide: 'service',
            useFactory: () => ({ value: 42 }),
            inject: injectMetadata,
          }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service": invalid dependency property name "__proto__".',
    )
  })

  it('should throw error for __proto__ dependency name in class', () => {
    const depToken = token<{ value: number }>()('dep')

    class Service {
      constructor(_deps: object) {}
    }

    // Use Object.defineProperty to set __proto__ in inject metadata
    const injectMetadata: Record<string, unknown> = {}
    Object.defineProperty(injectMetadata, '__proto__', {
      value: depToken,
      enumerable: true,
    })
    Object.defineProperty(Service, inject, {
      value: injectMetadata,
      writable: true,
      configurable: true,
    })

    expect(() =>
      createContainer({
        providers: [
          defineClassProvider({ provide: depToken, useClass: class {} }),
          defineClassProvider({ provide: 'service', useClass: Service }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service" (class "Service"): invalid dependency property name "__proto__".',
    )
  })

  it('should throw error for constructor dependency name', () => {
    const depToken = token<{ value: number }>()('dep')

    class Service {
      static [inject] = { constructor: depToken }

      constructor(_deps: object) {}
    }

    expect(() =>
      createContainer({
        providers: [
          defineClassProvider({ provide: depToken, useClass: class {} }),
          defineClassProvider({ provide: 'service', useClass: Service }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service" (class "Service"): invalid dependency property name "constructor".',
    )
  })

  it('should throw error for prototype dependency name', () => {
    const depToken = token<{ value: number }>()('dep')

    class Service {
      static [inject] = { prototype: depToken }

      constructor(_deps: object) {}
    }

    expect(() =>
      createContainer({
        providers: [
          defineClassProvider({ provide: depToken, useClass: class {} }),
          defineClassProvider({ provide: 'service', useClass: Service }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service" (class "Service"): invalid dependency property name "prototype".',
    )
  })

  it('should throw error for empty string dependency name', () => {
    const depToken = token<{ value: number }>()('dep')

    class Service {
      static [inject] = { '': depToken }

      constructor(_deps: object) {}
    }

    expect(() =>
      createContainer({
        providers: [
          defineClassProvider({ provide: depToken, useClass: class {} }),
          defineClassProvider({ provide: 'service', useClass: Service }),
        ],
      }),
    ).toThrow(
      'Cannot register key "service" (class "Service"): invalid dependency property name "".',
    )
  })
})
