import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { ContainerImpl } from '../src/container-impl.ts'
import { inject, postConstruct } from '../src/symbols.ts'

describe('ContainerSyncResolver', () => {
  describe('resolve with postConstruct', () => {
    it('should call postConstruct after instance creation', () => {
      let called = false

      class TestService {
        [postConstruct]() {
          called = true
        }
      }

      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      container.resolveSync(TestService)
      expect(called).toBe(true)
    })

    it('should throw error if postConstruct returns Promise', () => {
      class TestService {
        async [postConstruct]() {
          await Promise.resolve()
        }
      }

      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      expect(() => container.resolveSync(TestService)).toThrow(
        'Cannot call postConstruct',
      )
    })
  })

  describe('resolve with class dependencies', () => {
    it('should resolve dependencies recursively', () => {
      class DeepDependency {
        value = 'deep'
      }

      class Dependency {
        static [inject] = { deep: DeepDependency as any }
        deep: any
        constructor(deps: any) {
          this.deep = deps.deep
        }
      }

      class TestService {
        static [inject] = { dep: Dependency as any }
        dep: any
        constructor(deps: any) {
          this.dep = deps.dep
        }
      }

      const container = new ContainerImpl({
        providers: [
          defineClassProvider({
            provide: DeepDependency,
            useClass: DeepDependency,
          }),
          defineClassProvider({ provide: Dependency, useClass: Dependency }),
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      const instance = container.resolveSync(TestService)
      expect(instance).toBeInstanceOf(TestService)
      expect(instance.dep).toBeInstanceOf(Dependency)
      expect(instance.dep.deep).toBeInstanceOf(DeepDependency)
    })

    it('should reuse singleton dependencies', () => {
      class Dependency {
        value = 'dep'
      }

      class Service1 {
        static [inject] = { dep: Dependency as any }
        dep: any
        constructor(deps: any) {
          this.dep = deps.dep
        }
      }

      class Service2 {
        static [inject] = { dep: Dependency as any }
        dep: any
        constructor(deps: any) {
          this.dep = deps.dep
        }
      }

      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: Dependency, useClass: Dependency }),
          defineClassProvider({ provide: Service1, useClass: Service1 }),
          defineClassProvider({ provide: Service2, useClass: Service2 }),
        ],
      })

      const service1 = container.resolveSync(Service1)
      const service2 = container.resolveSync(Service2)

      // Get the dependency singleton directly from container
      const dep = container.get(Dependency)
      expect(service1.dep).toBe(dep)
      expect(service2.dep).toBe(dep)
    })
  })

  describe('error handling', () => {
    it('should throw error at init time if dependency not found', () => {
      class MissingDep {}
      class TestService {
        static [inject] = { dep: MissingDep as any }
        dep: any
        constructor(dep: any) {
          this.dep = dep
        }
      }

      expect(
        () =>
          new ContainerImpl({
            providers: [
              defineClassProvider({
                provide: TestService,
                useClass: TestService,
              }),
            ],
          }),
      ).toThrow('is not registered')
    })

    it('should throw error if class constructor is missing', () => {
      class TestService {}
      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      // Manually corrupt the provider
      const provider = (container as any).context.providerMap.get(TestService)
      provider.classConstructor = null

      expect(() => container.resolveSync(TestService)).toThrow(
        'class constructor is missing',
      )
    })

    it('should throw error when accessing destroyed container', () => {
      class TestService {}
      const container = new ContainerImpl({
        providers: [
          defineClassProvider({ provide: TestService, useClass: TestService }),
        ],
      })

      // Destroy the container
      container.destroy().then(() => {
        expect(() => container.resolveSync(TestService)).toThrow(
          'has been destroyed',
        )
      })
    })
  })
})
