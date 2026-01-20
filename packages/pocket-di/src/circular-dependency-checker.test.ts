import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import { token } from './types/token.ts'

describe('CircularDependencyChecker', () => {
  it('should add token to chain', () => {
    const checker = new CircularDependencyChecker()
    const tokenA = token('A')

    expect(() => checker.push(tokenA)).not.toThrow()
  })

  it('should detect circular dependency with same token', () => {
    const checker = new CircularDependencyChecker()
    const tokenA = token('A')

    checker.push(tokenA)

    expect(() => checker.push(tokenA)).toThrow(
      'Circular dependency detected: A -> A',
    )
  })

  it('should detect circular dependency with multiple tokens', () => {
    const checker = new CircularDependencyChecker()
    const tokenA = token('A')
    const tokenB = token('B')
    const tokenC = token('C')

    checker.push(tokenA)
    checker.push(tokenB)
    checker.push(tokenC)

    expect(() => checker.push(tokenA)).toThrow(
      'Circular dependency detected: A -> B -> C -> A',
    )
  })

  it('should work with class tokens', () => {
    const checker = new CircularDependencyChecker()

    class ServiceA {}

    checker.push(ServiceA)

    expect(() => checker.push(ServiceA)).toThrow(
      'Circular dependency detected: ServiceA -> ServiceA',
    )
  })
})
