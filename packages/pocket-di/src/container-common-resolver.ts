/**
 * @file Common resolution logic shared between async/sync resolvers
 */

import type { ContainerContext } from './container-context.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import { isValueProvider } from './provider.ts'
import type {
  ConcreteProvider,
  ProviderWithDependencies,
} from './provider-utils.ts'
import { findProvider, getProviderDependencies } from './provider-utils.ts'
import type { InjectionToken } from './token.ts'
import { tokenToString, toKeyToken } from './token.ts'

export type ResolveInstanceOrProviderOutput =
  | { kind: 'instance'; instance: Injectable }
  | { kind: 'provider'; provider: ProviderWithDependencies }

/**
 * ContainerCommonResolver handles shared logic between async/sync resolvers
 */
export class ContainerCommonResolver {
  private readonly context: ContainerContext

  constructor(container: ContainerImpl) {
    this.context = container.context
  }

  /**
   * Get instance or provider for token
   * 1. Check singletonMap for cached instance
   * 2. Find provider from providerMap
   * 3. Return instance for value provider
   * 4. Return provider for class/factory provider
   */
  resolveInstanceOrProvider(
    token: InjectionToken,
  ): ResolveInstanceOrProviderOutput {
    const key = toKeyToken(token)

    // Return cached singleton if available
    const singleton = this.context.singletonMap.get(key)
    if (singleton !== undefined) {
      return { kind: 'instance', instance: singleton }
    }

    // Find provider
    const provider = findProvider(key, this.context)
    if (!provider) {
      throw new Error(
        `Cannot resolve token "${tokenToString(token)}": provider not found.`,
      )
    }

    // Return instance for value provider
    if (isValueProvider(provider)) {
      const value = provider.useValue
      if (value === undefined) {
        throw new Error(
          `Cannot resolve token "${tokenToString(token)}": value provider has undefined value.`,
        )
      }
      return { kind: 'instance', instance: value }
    }

    // Return provider for class/factory provider
    return { kind: 'provider', provider: provider }
  }

  /**
   * Store singleton-scoped instance in singletonMap
   */
  updateSingletonRegistry(input: {
    provider: ConcreteProvider
    instance: Injectable
  }): void {
    const { provider, instance } = input

    // ValueProvider doesn't have scope, always cache as value
    if (isValueProvider(provider)) {
      const key = toKeyToken(provider.provide)
      this.context.singletonMap.set(key, instance)
      return
    }

    // ClassProvider and FactoryProvider have scope
    if (provider.scope === 'singleton') {
      const key = toKeyToken(provider.provide)
      this.context.singletonMap.set(key, instance)
    }
  }
}

export { getProviderDependencies, type ProviderWithDependencies }
