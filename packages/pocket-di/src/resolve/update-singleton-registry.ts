import type {
  ProviderHasDependencies,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import type { InjectionToken } from '../types/token.ts'

export function updateSingletonRegistry(
  context: { singletonRegistry: SingletonRegistry },
  input: {
    token: InjectionToken
    provider: ProviderHasDependencies
    instance: Injectable
  },
) {
  const { singletonRegistry } = context
  const { token, provider, instance } = input

  const { scope = 'singleton' } = provider

  if (scope === 'singleton') {
    singletonRegistry.map.set(token, instance)
  }
}
