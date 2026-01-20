import { type InjectionToken, tokenToString } from './types/token.ts'

export class CircularDependencyChecker {
  chain = new Set<InjectionToken>()

  push(token: InjectionToken): void {
    if (this.chain.has(token)) {
      const chain = [...this.chain.values(), token]
        .map((x) => tokenToString(x))
        .join(' -> ')

      throw new Error(`Circular dependency detected: ${chain}`)
    }

    this.chain.add(token)
  }
}
