import { describe, expect, it } from 'vitest'

import { Registry } from '../registry.ts'
import type { ClassProvider } from '../types/class-provider.ts'
import type { SingletonRegistry } from '../types/compositions.ts'
import type { FactoryProvider } from '../types/factory-provider.ts'
import { token } from '../types/token.ts'
import { updateSingletonRegistry } from './update-singleton-registry.ts'

describe('updateSingletonRegistry with singleton scope', () => {
  it('should add instance to registry for class provider', () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
      scope: 'singleton',
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const instance = new TestClass()

    updateSingletonRegistry(
      { singletonRegistry },
      { token: 'test', provider, instance },
    )

    expect(singletonRegistry.map.get('test')).toBe(instance)
  })

  it('should add instance to registry for factory provider', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => ({}),
      scope: 'singleton',
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const instance = {}

    updateSingletonRegistry(
      { singletonRegistry },
      { token: 'test', provider, instance },
    )

    expect(singletonRegistry.map.get('test')).toBe(instance)
  })

  it('should add instance when scope is undefined (default)', () => {
    const provider: ClassProvider = {
      provide: token('test'),
      useClass: class {},
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const instance = {}

    updateSingletonRegistry(
      { singletonRegistry },
      { token: 'test', provider, instance },
    )

    expect(singletonRegistry.map.get('test')).toBe(instance)
  })
})

describe('updateSingletonRegistry with transient scope', () => {
  it('should not add instance to registry', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => ({}),
      scope: 'transient',
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const instance = {}

    updateSingletonRegistry(
      { singletonRegistry },
      { token: 'test', provider, instance },
    )

    expect(singletonRegistry.map.get('test')).toBeUndefined()
  })
})
