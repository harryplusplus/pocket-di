import { describe, expect, it } from 'vitest'

import { ContainerContext, createContainer } from './container-context.ts'
import { inject, postConstruct, preDestroy } from './types/symbols.ts'
import { token } from './types/token.ts'

describe('container-context', () => {
  describe('createContainer', () => {
    it('should create container', () => {
      const container = createContainer({
        providers: [],
      })

      expect(container).toBeDefined()
    })

    it('should create container with providers', () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'value',
          },
        ],
      })

      expect(container).toBeDefined()
    })
  })

  describe('destroy', () => {
    it('should destroy container', async () => {
      const container = createContainer({
        providers: [],
      })

      await container.destroy()

      await expect(container.resolve('test')).rejects.toThrow(
        'Container is destroyed.',
      )
    })

    it('should be idempotent', async () => {
      const container = createContainer({
        providers: [],
      })

      await container.destroy()
      await container.destroy()

      await expect(container.resolve('test')).rejects.toThrow(
        'Container is destroyed.',
      )
    })

    it('should destroy children', async () => {
      const parent = createContainer({
        providers: [],
      })

      const child = parent.createChild({
        providers: [],
      })

      await parent.destroy()

      await expect(child.resolve('test')).rejects.toThrow(
        'Container is destroyed.',
      )
    })

    it('should call preDestroy on singletons', async () => {
      let preDestroyCalled = false

      class TestClass {
        [preDestroy]() {
          preDestroyCalled = true
        }
      }

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)
      await container.destroy()

      expect(preDestroyCalled).toBe(true)
    })

    it('should call preDestroy on factory singletons', async () => {
      let preDestroyCalled = false

      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useFactory: () => ({}),
            preDestroy: () => {
              preDestroyCalled = true
            },
          },
        ],
      })

      await container.resolve('test')
      await container.destroy()

      expect(preDestroyCalled).toBe(true)
    })

    it('should ignore errors during preDestroy', async () => {
      class TestClass {
        [preDestroy]() {
          throw new Error('preDestroy error')
        }
      }

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)

      await expect(container.destroy()).resolves.not.toThrow()
    })

    it('should ignore errors during child destroy', async () => {
      const parent = createContainer({
        providers: [],
      })

      const child = parent.createChild({
        providers: [],
      })

      // Destroy child first to cause error on parent destroy
      await child.destroy()
      await child.destroy() // Second destroy will be no-op

      await expect(parent.destroy()).resolves.not.toThrow()
    })

    it('should clear singletons in reverse order', async () => {
      const destroyOrder: string[] = []

      class FirstClass {
        [preDestroy]() {
          destroyOrder.push('first')
        }
      }

      class SecondClass {
        [preDestroy]() {
          destroyOrder.push('second')
        }
      }

      const container = createContainer({
        providers: [FirstClass, SecondClass],
      })

      await container.resolve(FirstClass)
      await container.resolve(SecondClass)
      await container.destroy()

      expect(destroyOrder).toEqual(['second', 'first'])
    })

    it('should not call preDestroy on value providers', async () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: { value: 'test' },
          },
        ],
      })

      await container.resolve('test')

      await expect(container.destroy()).resolves.not.toThrow()
    })

    it('should ignore async preDestroy errors', async () => {
      class TestClass {
        async [preDestroy]() {
          await Promise.resolve()
          throw new Error('async preDestroy error')
        }
      }

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)

      await expect(container.destroy()).resolves.not.toThrow()
    })

    it('should ignore async factory preDestroy errors', async () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useFactory: () => ({}),
            preDestroy: async () => {
              await Promise.resolve()
              throw new Error('async preDestroy error')
            },
          },
        ],
      })

      await container.resolve('test')

      await expect(container.destroy()).resolves.not.toThrow()
    })

    it('should handle concurrent destroy calls', async () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'value',
          },
        ],
      })

      await Promise.all([
        container.destroy(),
        container.destroy(),
        container.destroy(),
      ])

      await expect(container.resolve('test')).rejects.toThrow(
        'Container is destroyed.',
      )
    })

    it('should throw when singleton provider not found during cleanup', async () => {
      class TestClass {}

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)
      ;(container as ContainerContext).providers.clear()
      ;(container as ContainerContext).parent = null

      await expect(container.destroy()).rejects.toThrow(
        'Internal error: provider for token "TestClass" not found during cleanup.',
      )
    })

    it('should handle class without preDestroy', async () => {
      class TestClass {}

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)
      await container.destroy()

      // Should not throw
    })
  })

  describe('resolve', () => {
    it('should resolve value provider', async () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'value',
          },
        ],
      })

      const result = await container.resolve('test')

      expect(result).toBe('value')
    })

    it('should resolve class provider', async () => {
      class TestClass {}

      const container = createContainer({
        providers: [TestClass],
      })

      const result = await container.resolve(TestClass)

      expect(result).toBeInstanceOf(TestClass)
    })

    it('should resolve factory provider', async () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useFactory: () => ({ value: 'test' }),
          },
        ],
      })

      const result = await container.resolve('test')

      expect(result).toEqual({ value: 'test' })
    })

    it('should throw when container is destroyed', async () => {
      const container = createContainer({
        providers: [],
      })

      await container.destroy()

      await expect(container.resolve('test')).rejects.toThrow(
        'Container is destroyed.',
      )
    })

    it('should return singleton instance', async () => {
      class TestClass {}

      const container = createContainer({
        providers: [TestClass],
      })

      const first = await container.resolve(TestClass)
      const second = await container.resolve(TestClass)

      expect(first).toBe(second)
    })

    it('should resolve with tuple dependencies', async () => {
      const depToken = token<{ value: string }>('dep')

      class TestClass {
        static [inject] = [depToken] as const

        deps: [{ value: string }]

        constructor(deps: [{ value: string }]) {
          this.deps = deps
        }
      }

      const container = createContainer({
        providers: [
          {
            provide: depToken,
            useValue: { value: 'dep' },
          },
          TestClass,
        ],
      })

      const result = await container.resolve(TestClass)

      expect(result.deps[0].value).toBe('dep')
    })

    it('should resolve with record dependencies', async () => {
      const depToken = token<{ value: string }>('dep')

      class TestClass {
        static [inject] = { dep: depToken }

        deps: { dep: { value: string } }

        constructor(deps: { dep: { value: string } }) {
          this.deps = deps
        }
      }

      const container = createContainer({
        providers: [
          {
            provide: depToken,
            useValue: { value: 'dep' },
          },
          TestClass,
        ],
      })

      const result = await container.resolve(TestClass)

      expect(result.deps.dep.value).toBe('dep')
    })

    it('should call postConstruct', async () => {
      let postConstructCalled = false

      class TestClass {
        [postConstruct]() {
          postConstructCalled = true
        }
      }

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)

      expect(postConstructCalled).toBe(true)
    })

    it('should wait for async postConstruct', async () => {
      let postConstructCalled = false

      class TestClass {
        async [postConstruct]() {
          await new Promise((resolve) => setTimeout(resolve, 10))
          postConstructCalled = true
        }
      }

      const container = createContainer({
        providers: [TestClass],
      })

      await container.resolve(TestClass)

      expect(postConstructCalled).toBe(true)
    })

    it('should resolve async factory', async () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useFactory: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10))
              return { value: 'test' }
            },
          },
        ],
      })

      const result = await container.resolve('test')

      expect(result).toEqual({ value: 'test' })
    })

    it('should create new instance for transient scope', async () => {
      class TestClass {}

      const container = createContainer({
        providers: [
          {
            provide: TestClass,
            useClass: TestClass,
            scope: 'transient',
          },
        ],
      })

      const first = await container.resolve(TestClass)
      const second = await container.resolve(TestClass)

      expect(first).not.toBe(second)
    })

    it('should resolve from parent container', async () => {
      const parent = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'parent-value',
          },
        ],
      })

      const child = parent.createChild({
        providers: [],
      })

      const result = await child.resolve('test')

      expect(result).toBe('parent-value')
    })

    it('should prioritize child provider over parent', async () => {
      const parent = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'parent-value',
          },
        ],
      })

      const child = parent.createChild({
        providers: [
          {
            provide: 'test',
            useValue: 'child-value',
          },
        ],
        override: true,
      })

      const result = await child.resolve('test')

      expect(result).toBe('child-value')
    })

    it('should resolve singleton from parent', async () => {
      class TestClass {}

      const parent = createContainer({
        providers: [TestClass],
      })

      const parentInstance = await parent.resolve(TestClass)

      const child = parent.createChild({
        providers: [],
      })

      const childInstance = await child.resolve(TestClass)

      expect(childInstance).toBe(parentInstance)
    })
  })

  describe('resolveSync', () => {
    it('should resolve value provider', () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'value',
          },
        ],
      })

      const result = container.resolveSync('test')

      expect(result).toBe('value')
    })

    it('should resolve class provider', () => {
      class TestClass {}

      const container = createContainer({
        providers: [TestClass],
      })

      const result = container.resolveSync(TestClass)

      expect(result).toBeInstanceOf(TestClass)
    })

    it('should throw when resolving non-existent provider', () => {
      const container = createContainer({
        providers: [],
      })

      expect(() => container.resolveSync('test')).toThrow(
        'Internal error: provider for token "test" not found during resolve.',
      )
    })

    it('should throw for async factory', () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useFactory: async () => {
              await Promise.resolve()
              return { value: 'test' }
            },
          },
        ],
      })

      expect(() => container.resolveSync('test')).toThrow(
        'Cannot resolve "test" synchronously: useFactory returns Promise.',
      )
    })

    it('should throw for async postConstruct', () => {
      class TestClass {
        async [postConstruct]() {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      const container = createContainer({
        providers: [TestClass],
      })

      expect(() => container.resolveSync(TestClass)).toThrow(
        'Cannot resolve "TestClass" (TestClass) synchronously: postConstruct returns Promise.',
      )
    })

    it('should throw for async tuple dependency', () => {
      const depToken = token<{ value: string }>('dep')

      class TestClass {
        static [inject] = [depToken] as const

        deps: [{ value: string }]

        constructor(deps: [{ value: string }]) {
          this.deps = deps
        }
      }

      const container = createContainer({
        providers: [
          {
            provide: depToken,
            useFactory: async () => {
              await Promise.resolve()
              return { value: 'dep' }
            },
          },
          TestClass,
        ],
      })

      expect(() => container.resolveSync(TestClass)).toThrow(
        'Cannot resolve "dep" synchronously: useFactory returns Promise.',
      )
    })

    it('should throw for async record dependency', () => {
      const depToken = token<{ value: string }>('dep')

      class TestClass {
        static [inject] = { dep: depToken }

        deps: { dep: { value: string } }

        constructor(deps: { dep: { value: string } }) {
          this.deps = deps
        }
      }

      const container = createContainer({
        providers: [
          {
            provide: depToken,
            useFactory: async () => {
              await Promise.resolve()
              return { value: 'dep' }
            },
          },
          TestClass,
        ],
      })

      expect(() => container.resolveSync(TestClass)).toThrow(
        'Cannot resolve "dep" synchronously: useFactory returns Promise.',
      )
    })

    it('should return singleton instance', () => {
      class TestClass {}

      const container = createContainer({
        providers: [TestClass],
      })

      const first = container.resolveSync(TestClass)
      const second = container.resolveSync(TestClass)

      expect(first).toBe(second)
    })

    it('should resolveSync with tuple dependencies', () => {
      const depToken = token<{ value: string }>('dep')

      class TestClass {
        static [inject] = [depToken] as const

        deps: [{ value: string }]

        constructor(deps: [{ value: string }]) {
          this.deps = deps
        }
      }

      const container = createContainer({
        providers: [
          {
            provide: depToken,
            useValue: { value: 'dep' },
          },
          TestClass,
        ],
      })

      const result = container.resolveSync(TestClass)

      expect(result.deps[0].value).toBe('dep')
    })
  })

  describe('createChild', () => {
    it('should create child container', () => {
      const parent = createContainer({
        providers: [],
      })

      const child = parent.createChild({
        providers: [],
      })

      expect(child).toBeDefined()
    })

    it('should throw when parent is destroyed', async () => {
      const parent = createContainer({
        providers: [],
      })

      await parent.destroy()

      expect(() =>
        parent.createChild({
          providers: [],
        }),
      ).toThrow('Container is destroyed.')
    })
  })

  describe('hasProvider', () => {
    it('should return true when provider exists', () => {
      const container = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'value',
          },
        ],
      })

      expect((container as ContainerContext).hasProvider('test')).toBe(true)
    })

    it('should return false when provider does not exist', () => {
      const container = createContainer({
        providers: [],
      })

      expect((container as ContainerContext).hasProvider('test')).toBe(false)
    })

    it('should return true when provider exists in parent', () => {
      const parent = createContainer({
        providers: [
          {
            provide: 'test',
            useValue: 'value',
          },
        ],
      })

      const child = parent.createChild({
        providers: [],
      })

      expect((child as ContainerContext).hasProvider('test')).toBe(true)
    })

    it('should throw when container is destroyed', async () => {
      const container = createContainer({
        providers: [],
      })

      await container.destroy()

      expect(() => (container as ContainerContext).hasProvider('test')).toThrow(
        'Container is destroyed.',
      )
    })
  })
})
