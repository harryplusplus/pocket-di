/**
 * @file Utility functions for providers
 */

import type { ClassProvider } from './class-provider.ts'
import { defineClassProvider } from './class-provider.ts'
import type { ContainerContext } from './container-context.ts'
import type { DependencyDeclaration } from './dependency-declaration.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { Provider } from './provider.ts'
import { isConstructorProvider, isFactoryProvider } from './provider.ts'
import { inject } from './symbols.ts'
import type { KeyToken } from './token.ts'
import type { ValueProvider } from './value-provider.ts'

/**
 * Concrete provider type after normalization.
 * InjectableConstructor is converted to ClassProvider.
 */
export type ConcreteProvider = ValueProvider | ClassProvider | FactoryProvider

/**
 * Provider that can have dependencies (ClassProvider or FactoryProvider)
 */
export type ProviderWithDependencies = ClassProvider | FactoryProvider

/**
 * Normalize a provider to a concrete provider type
 * - Converts InjectableConstructor to ClassProvider
 * - Passes through other providers as-is
 */
export function normalizeProvider(provider: Provider): ConcreteProvider {
  if (isConstructorProvider(provider)) {
    return defineClassProvider({ provide: provider, useClass: provider })
  }

  return provider
}

/**
 * Extract dependency declaration from provider
 */
export function getProviderDependencies(
  provider: ProviderWithDependencies,
): DependencyDeclaration {
  if (isFactoryProvider(provider)) {
    return provider.inject ?? {}
  }

  // ClassProvider
  const ctor = provider.useClass
  return ctor[inject] ?? {}
}

/**
 * Find provider in current or parent containers
 * Searches recursively through parent chain
 */
export function findProvider(
  key: KeyToken,
  context: ContainerContext,
): ConcreteProvider | undefined {
  // Search in current container
  const provider = context.providerMap.get(key)
  if (provider) {
    return provider
  }

  // Search in parent container (recursive)
  const parent = context.parent
  if (parent) {
    return findProvider(key, parent.context)
  }

  return undefined
}
