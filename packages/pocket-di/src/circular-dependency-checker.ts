import type { RegistryKey } from './types/compositions.ts'
import { type InjectionToken, tokenToString } from './types/token.ts'

export class CircularDependencyChecker {
  chain = new Set<InjectionToken>()

  push(key: RegistryKey): void {
    if (this.chain.has(key)) {
      const chain = [...this.chain.values(), key]
        .map((x) => tokenToString(x))
        .join(' -> ')

      throw new Error(`Circular dependency detected: ${chain}`)
    }

    this.chain.add(key)
  }
}
