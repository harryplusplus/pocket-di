/**
 * @file Class for checking circular dependencies
 */

import type { InjectionToken } from './token.ts'

export class CircularDependencyChecker {
  readonly chain = new Set<InjectionToken>()

  push(token: InjectionToken): void {
    if (this.chain.has(token)) {
      const chainArray = [...this.chain.values(), token]
      const chainStr = chainArray.map(String).join(' -> ')
      throw new Error(`Circular dependency detected: ${chainStr}`)
    }
    this.chain.add(token)
  }

  pop(token: InjectionToken): void {
    this.chain.delete(token)
  }
}
