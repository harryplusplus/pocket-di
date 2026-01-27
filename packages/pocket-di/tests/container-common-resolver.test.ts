import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { ContainerImpl } from '../src/container-impl.ts'
import { inject } from '../src/symbols.ts'
import { defineValueProvider } from '../src/value-provider.ts'

describe('ContainerCommonResolver', () => {
  describe('resolveInstanceOrProvider', () => {
    it('should return cached singleton from singletonMap', () => {
      class TestService {}
      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      // Resolve once to cache
      const instance1 = container.resolveSync(TestService)

      const { context } = container
      const singleton = context.singletonMap.get(TestService)
      expect(singleton).toBe(instance1)
    })

    it('should return value provider instance directly', () => {
      const value = { test: 'value' }
      class TestService {}
      const container = new ContainerImpl({
        providers: [
          defineValueProvider({ provide: TestService, useValue: value }),
        ],
      })

      const instance = container.resolveSync(TestService)
      expect(instance).toBe(value)
    })
  })

  describe('getProviderDependencies', () => {
    it('should extract dependencies from class with inject metadata', () => {
      class Dependency {}
      class TestService {
        static [inject] = { dep: Dependency as any }
        dep: any
        constructor(deps: any) {
          this.dep = deps.dep
        }
      }

      const container = new ContainerImpl({
        providers: [
          defineValueProvider({
            provide: Dependency,
            useValue: new Dependency(),
          }),
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      const instance = container.resolveSync(TestService)
      expect(instance).toBeInstanceOf(TestService)
      expect(instance.dep).toBeInstanceOf(Dependency)
    })

    it('should return empty object for class without inject metadata', () => {
      class TestService {}
      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      const instance = container.resolveSync(TestService)
      expect(instance).toBeInstanceOf(TestService)
    })
  })

  describe('singleton scope', () => {
    it('should store singleton instances in singletonMap', () => {
      class TestService {}
      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      const instance1 = container.resolveSync(TestService)
      const instance2 = container.resolveSync(TestService)

      expect(instance1).toBe(instance2)
      expect(container.context.singletonMap.has(TestService)).toBe(true)
    })

    it('should not store transient instances in singletonMap', () => {
      class TestService {}
      const scope = 'transient'
      const container = new ContainerImpl({
        providers: [
          defineClassProvider({
            provide: TestService,
            useClass: TestService,
            scope,
          } as any),
        ],
      })

      const instance1 = container.resolveSync(TestService)
      const instance2 = container.resolveSync(TestService)

      expect(instance1).not.toBe(instance2)
    })
  })
})
