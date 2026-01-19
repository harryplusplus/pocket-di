import { type InjectionToken, tokenToString } from './types/token.ts'

export interface CircularDependencyChecker {
  push(token: InjectionToken): void
}

class CircularDependencyCheckerImpl implements CircularDependencyChecker {
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

export function createCircularDependencyChecker(): CircularDependencyChecker {
  return new CircularDependencyCheckerImpl()
}
