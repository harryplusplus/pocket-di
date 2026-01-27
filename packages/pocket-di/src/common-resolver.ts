/**
 * @file Common resolution logic shared between async/sync resolvers
 */

import { inject } from './symbols.ts'
import type { ContainerContext } from './container-context.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { NormalizedProvider } from './normalized-provider.ts'
import type { InjectionToken } from './token.ts'

export type ProviderHasDependencies = NormalizedProvider & {
  type: 'class' | 'factory'
}

export type ResolveInstanceOrProviderOutput =
  | { kind: 'instance'; instance: Injectable }
  | { kind: 'provider'; provider: ProviderHasDependencies }

/**
 * CommonResolver handles shared logic between async/sync resolvers
 */
export class CommonResolver {
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
    // Return cached singleton if available
    const singleton = this.context.singletonMap.get(token)
    if (singleton !== undefined) {
      return { kind: 'instance', instance: singleton }
    }

    // Find provider
    const provider = this.findProvider(token)
    if (!provider) {
      throw new Error(
        `Cannot resolve token "${String(token)}": provider not found.`,
      )
    }

    // Return instance for value provider
    if (provider.type === 'value') {
      const value = provider.value
      if (value === undefined) {
        throw new Error(
          `Cannot resolve token "${String(token)}": value provider has undefined value.`,
        )
      }
      return { kind: 'instance', instance: value }
    }

    // Return provider for class/factory provider
    return { kind: 'provider', provider: provider as ProviderHasDependencies }
  }

  /**
   * Store singleton-scoped instance in singletonMap
   */
  updateSingletonRegistry(input: {
    provider: NormalizedProvider
    instance: Injectable
  }): void {
    const { provider, instance } = input

    if (provider.scope === 'singleton') {
      this.context.singletonMap.set(provider.token, instance)
    }
  }

  /**
   * Find provider in current or parent containers
   */
  private findProvider(
    token: InjectionToken,
  ): NormalizedProvider | undefined {
    // Search in current container
    const provider = this.context.providerMap.get(token)
    if (provider) {
      return provider
    }

    // Search in parent container
    const parent = this.context.parent
    if (parent) {
      return parent.context.providerMap.get(token) ?? undefined
    }

    return undefined
  }
}

/**
 * Extract dependency declaration from provider
 */
export function getProviderDependencies(
  provider: ProviderHasDependencies,
): Record<string, InjectionToken> {
  if (provider.type === 'class' && provider.classConstructor) {
    const ctor = provider.classConstructor
    // Use inject static symbol if available, otherwise empty object
    const injectMetadata = (ctor as any)[inject]
    if (injectMetadata && typeof injectMetadata === 'object') {
      return injectMetadata
    }
    return {}
  }

  // factory type
  return provider.inject ?? {}
}
