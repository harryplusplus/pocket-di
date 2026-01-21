import { describe, expect, it } from 'vitest'

import { createContainer } from './container.ts'
import { inject, postConstruct, preDestroy } from './types/symbols.ts'
import { token } from './types/token.ts'

describe('createContainer', () => {
  it('should create container with providers', () => {
    const container = createContainer({ providers: [] })

    expect(container).toBeDefined()
  })
})

describe('Container resolve', () => {
  it('should resolve value provider', async () => {
    const value = { data: 'test' }

    const container = createContainer({
      providers: [{ provide: 'test', useValue: value }],
    })

    const result = await container.resolve('test')

    expect(result).toBe(value)
  })

  it('should resolve class provider', async () => {
    class TestClass {
      value = 'test'
    }

    const container = createContainer({ providers: [TestClass] })

    const result = await container.resolve(TestClass)

    expect(result).toBeInstanceOf(TestClass)
  })

  it('should resolve with dependencies', async () => {
    const dep = { value: 'dep' }

    class TestClass {
      static [inject] = { dep: token('dep') }
      deps: unknown[]
      constructor(deps: unknown[]) {
        this.deps = deps
      }
    }

    const container = createContainer({
      providers: [{ provide: token('dep'), useValue: dep }, TestClass],
    })

    const result = await container.resolve(TestClass)

    expect(result.deps).toEqual({ dep })
  })
})

describe('Container resolveSync', () => {
  it('should resolve synchronously', () => {
    const value = { data: 'test' }

    const container = createContainer({
      providers: [{ provide: 'test', useValue: value }],
    })

    const result = container.resolveSync('test')

    expect(result).toBe(value)
  })

  it('should throw error for async postConstruct', () => {
    class TestClass {
      async [postConstruct]() {
        await Promise.resolve()
      }
    }

    const container = createContainer({ providers: [TestClass] })

    expect(() => container.resolveSync(TestClass)).toThrow(
      'synchronously: postConstruct returns Promise',
    )
  })
})

describe('Container destroy', () => {
  it('should destroy container', async () => {
    const container = createContainer({ providers: [] })

    await container.destroy()

    await expect(container.resolve('test')).rejects.toThrow(
      'Container is destroyed',
    )
  })

  it('should call preDestroy on singletons', async () => {
    let called = false

    class TestClass {
      [preDestroy]() {
        called = true
      }
    }

    const container = createContainer({ providers: [TestClass] })

    await container.resolve(TestClass)
    await container.destroy()

    expect(called).toBe(true)
  })

  it('should be idempotent', async () => {
    const container = createContainer({ providers: [] })

    await container.destroy()
    await container.destroy()

    await expect(container.resolve('test')).rejects.toThrow(
      'Container is destroyed',
    )
  })

  it('should handle concurrent destroy calls', async () => {
    const container = createContainer({ providers: [] })

    await Promise.all([container.destroy(), container.destroy()])

    await expect(container.resolve('test')).rejects.toThrow(
      'Container is destroyed',
    )
  })
})

describe('Container createChild', () => {
  it('should create child container', () => {
    const parent = createContainer({
      providers: [{ provide: 'parent', useValue: 'parent' }],
    })

    const child = parent.createChild({
      providers: [{ provide: 'child', useValue: 'child' }],
    })

    expect(child).toBeDefined()
  })

  it('should resolve parent providers from child', async () => {
    const parentValue = { data: 'parent' }

    const parent = createContainer({
      providers: [{ provide: 'parent', useValue: parentValue }],
    })

    const child = parent.createChild({ providers: [] })

    const result = await child.resolve('parent')

    expect(result).toBe(parentValue)
  })

  it('should override parent provider with override option', async () => {
    const parent = createContainer({
      providers: [{ provide: 'test', useValue: 'parent' }],
    })

    const child = parent.createChild({
      providers: [{ provide: 'test', useValue: 'child' }],
      override: true,
    })

    const result = await child.resolve('test')

    expect(result).toBe('child')
  })

  it('should throw error after parent destroyed', async () => {
    const parent = createContainer({ providers: [] })

    await parent.destroy()

    expect(() => parent.createChild({ providers: [] })).toThrow(
      'Container is destroyed',
    )
  })
})

describe('Container singleton caching', () => {
  it('should cache singleton instances', async () => {
    class TestClass {}

    const container = createContainer({ providers: [TestClass] })

    const instance1 = await container.resolve(TestClass)
    const instance2 = await container.resolve(TestClass)

    expect(instance1).toBe(instance2)
  })

  it('should not cache transient instances', async () => {
    class TestClass {}

    const container = createContainer({
      providers: [
        { provide: TestClass, useClass: TestClass, scope: 'transient' },
      ],
    })

    const instance1 = await container.resolve(TestClass)
    const instance2 = await container.resolve(TestClass)

    expect(instance1).not.toBe(instance2)
  })
})
