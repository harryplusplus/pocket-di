import type { Key } from './types/token.ts'

export class CircularDependencyChecker {
  chain = new Set<Key>()

  push(key: Key): void {
    if (this.chain.has(key)) {
      const chain = [...this.chain.values(), key].join(' -> ')

      throw new Error(`Circular dependency detected: ${chain}`)
    }

    this.chain.add(key)
  }
}
