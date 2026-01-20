import { describe, expect, it } from 'vitest'

import { Registry } from './registry.ts'

describe('Registry constructor', () => {
  it('should create registry without parent', () => {
    const registry = new Registry<string, string>(null)

    expect(registry.parent).toBeNull()
    expect(registry.map.size).toBe(0)
  })

  it('should create registry with parent', () => {
    const parent = new Registry<string, string>(null)
    const child = new Registry<string, string>(parent)

    expect(child.parent).toBe(parent)
  })
})

describe('Registry clear', () => {
  it('should clear map and set parent to null', () => {
    const parent = new Registry<string, string>(null)
    const registry = new Registry<string, string>(parent)
    registry.map.set('key', 'value')

    registry.clear()

    expect(registry.map.size).toBe(0)
    expect(registry.parent).toBeNull()
  })
})

describe('Registry find', () => {
  it('should find value in current registry', () => {
    const registry = new Registry<string, string>(null)
    registry.map.set('key', 'value')

    const result = registry.find('key')

    expect(result).toBe('value')
  })

  it('should return null when key not found and no parent', () => {
    const registry = new Registry<string, string>(null)

    const result = registry.find('key')

    expect(result).toBeNull()
  })

  it('should find value in parent registry', () => {
    const parent = new Registry<string, string>(null)
    parent.map.set('key', 'parent-value')

    const child = new Registry<string, string>(parent)

    const result = child.find('key')

    expect(result).toBe('parent-value')
  })

  it('should prioritize current registry over parent', () => {
    const parent = new Registry<string, string>(null)
    parent.map.set('key', 'parent-value')

    const child = new Registry<string, string>(parent)
    child.map.set('key', 'child-value')

    const result = child.find('key')

    expect(result).toBe('child-value')
  })

  it('should return null with localOnly when not found locally', () => {
    const parent = new Registry<string, string>(null)
    parent.map.set('key', 'parent-value')

    const child = new Registry<string, string>(parent)

    const result = child.find('key', { localOnly: true })

    expect(result).toBeNull()
  })

  it('should find local value with localOnly option', () => {
    const parent = new Registry<string, string>(null)
    const child = new Registry<string, string>(parent)
    child.map.set('key', 'child-value')

    const result = child.find('key', { localOnly: true })

    expect(result).toBe('child-value')
  })
})
