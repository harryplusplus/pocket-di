import {
  type ProviderHasDependencies,
  type ProviderRegistry,
  type SingletonRegistry,
  tokenToRegistryKey,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import { isValueProvider } from '../types/provider.ts'
import { type InjectionToken, tokenToString } from '../types/token.ts'

export type ResolveInstanceOrProviderOutput =
  | { kind: 'instance'; instance: Injectable }
  | { kind: 'provider'; provider: ProviderHasDependencies }

export function resolveInstanceOrProvider(input: {
  singletonRegistry: SingletonRegistry
  providerRegistry: ProviderRegistry
  token: InjectionToken
}): ResolveInstanceOrProviderOutput {
  const { singletonRegistry, providerRegistry, token } = input

  const key = tokenToRegistryKey(token)
  const singleton = singletonRegistry.find(key)
  if (singleton) {
    return { kind: 'instance', instance: singleton }
  }

  const provider = providerRegistry.find(key)
  if (!provider) {
    throw new Error(
      `Internal error: provider for token "${tokenToString(token)}" not found during resolve.`,
    )
  }

  if (isValueProvider(provider)) {
    return { kind: 'instance', instance: provider.useValue }
  }

  return { kind: 'provider', provider }
}
