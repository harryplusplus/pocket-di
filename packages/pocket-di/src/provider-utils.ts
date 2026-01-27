/**
 * @file Utility functions for providers
 */

import type { ClassProvider } from './class-provider.ts'
import { defineClassProvider } from './class-provider.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { Provider } from './provider.ts'
import { isConstructorProvider } from './provider.ts'
import type { ValueProvider } from './value-provider.ts'

/**
 * Normalize a provider to a concrete provider type
 * - Converts InjectableConstructor to ClassProvider
 * - Passes through other providers as-is
 */
export function normalizeProvider(
  provider: Provider,
): ValueProvider | ClassProvider | FactoryProvider {
  if (isConstructorProvider(provider)) {
    return defineClassProvider({ provide: provider, useClass: provider })
  }

  return provider
}
