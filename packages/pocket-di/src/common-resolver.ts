import type { ClassProvider } from '../types/class-provider.ts'
import type { DependencyDeclaration } from '../types/dependency-declaration.ts'
import type { FactoryProvider } from '../types/factory-provider.ts'
import type { Injectable } from '../types/injectable.ts'
import { isClassProvider, isValueProvider } from '../types/provider.ts'
import { inject } from '../types/symbols.ts'
import type { Key } from '../types/token.ts'
import type { ContainerImpl } from './impl.ts'

export type ProviderHasDependencies = ClassProvider | FactoryProvider

export function providerToDeclaration(
  provider: ProviderHasDependencies,
): DependencyDeclaration {
  return isClassProvider(provider)
    ? (provider.useClass[inject] ?? {})
    : provider.inject
}

export type ResolveInstanceOrProviderOutput =
  | { kind: 'instance'; instance: Injectable }
  | { kind: 'provider'; provider: ProviderHasDependencies }

export class CommonResolver {
  private readonly impl: ContainerImpl

  constructor(impl: ContainerImpl) {
    this.impl = impl
  }

  resolveInstanceOrProvider(key: Key): ResolveInstanceOrProviderOutput {
    const { singletonRegistry, providerRegistry } = this.impl.$context

    const singleton = singletonRegistry.find(key)
    if (singleton) {
      return { kind: 'instance', instance: singleton }
    }

    const provider = providerRegistry.find(key)
    if (!provider) {
      throw new Error(
        `Internal error: provider for token "${key}" not found during resolve.`,
      )
    }

    if (isValueProvider(provider)) {
      return { kind: 'instance', instance: provider.useValue }
    }

    return { kind: 'provider', provider }
  }

  updateSingletonRegistry(input: {
    provider: ProviderHasDependencies
    instance: Injectable
  }): void {
    const { singletonRegistry } = this.impl.$context
    const { provider, instance } = input

    const { scope = 'singleton' } = provider

    if (scope === 'singleton') {
      singletonRegistry.set(provider.token.key, instance)
    }
  }
}
