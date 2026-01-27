import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from '../src/circular-dependency-checker.ts'

describe('circular-dependency-checker', () => {
  it('should not throw for non-circular dependencies', () => {
    const checker = new CircularDependencyChecker()

    expect(() => {
      checker.push('a')
      checker.push('b')
      checker.push('c')
    }).not.toThrow()
  })

  it('should throw for circular dependencies', () => {
    const checker = new CircularDependencyChecker()

    checker.push('a')
    checker.push('b')
    checker.push('c')

    expect(() => {
      checker.push('a')
    }).toThrow('Circular dependency detected: a -> b -> c -> a')
  })

  it('should throw for direct circular dependency', () => {
    const checker = new CircularDependencyChecker()

    checker.push('service')

    expect(() => {
      checker.push('service')
    }).toThrow('Circular dependency detected: service -> service')
  })

  it('should show full chain in error message', () => {
    const checker = new CircularDependencyChecker()

    checker.push('A')
    checker.push('B')
    checker.push('C')
    checker.push('D')

    expect(() => {
      checker.push('B')
    }).toThrow('Circular dependency detected: A -> B -> C -> D -> B')
  })
})
