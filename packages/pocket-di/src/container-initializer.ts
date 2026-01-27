/**
 * @file Handles container initialization, provider registration, and validation
 */

import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { ContainerContext } from './container-context.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Provider } from './provider.ts'
import { isValueProvider } from './provider.ts'
import type { ProviderWithDependencies } from './provider-utils.ts'
import {
  findProvider,
  getProviderDependencies,
  normalizeProvider,
} from './provider-utils.ts'
import type { HasTypeToken, InjectionToken, KeyToken } from './token.ts'
import { tokenToString, toKeyToken } from './token.ts'

export interface ContainerInitializerOptions {
  providers: Provider[]
  parent?: ContainerImpl
}

export class ContainerInitializer {
  private readonly container: ContainerImpl
  private readonly options: ContainerInitializerOptions

  constructor(container: ContainerImpl, options: ContainerInitializerOptions) {
    this.container = container
    this.options = options
  }

  initialize(): ContainerContext {
    const context = this.createContext()
    this.registerWithParent(context)
    this.registerProviders(context)
    this.validateDependencies(context)
    return context
  }

  private createContext(): ContainerContext {
    return {
      parent: this.options.parent,
      children: new Set(),
      providerMap: new Map(),
      singletonMap: new Map(),
    }
  }

  private registerWithParent(context: ContainerContext): void {
    const parent = context.parent
    if (parent) {
      parent.context.children.add(this.container)
    }
  }

  private registerProviders(context: ContainerContext): void {
    for (const provider of this.options.providers) {
      const normalized = normalizeProvider(provider)
      const key = toKeyToken(normalized.provide)
      this.validateTokenUniqueness(key, normalized.provide, context)
      context.providerMap.set(key, normalized)
    }
  }

  private validateTokenUniqueness(
    key: KeyToken,
    token: InjectionToken,
    context: ContainerContext,
  ): void {
    // Check parent first
    const parentProvider =
      context.parent && findProvider(key, context.parent?.context)
    if (parentProvider) {
      throw new Error(
        `Cannot register token "${tokenToString(token)}": already exists in parent container.`,
      )
    }

    // Then check current container
    if (context.providerMap.has(key)) {
      throw new Error(
        `Cannot register token "${tokenToString(token)}": already registered in this container.`,
      )
    }
  }

  private validateDependencies(context: ContainerContext): void {
    const checker = new CircularDependencyChecker()

    for (const [key, provider] of context.providerMap) {
      checker.push(key)
      // Only validate providers that can have dependencies
      if (!isValueProvider(provider)) {
        this.validateProviderDependencies(
          provider as ProviderWithDependencies,
          checker,
          context,
        )
      }
      checker.pop(key)
    }
  }

  private validateProviderDependencies(
    provider: ProviderWithDependencies,
    checker: CircularDependencyChecker,
    context: ContainerContext,
  ): void {
    const deps = getProviderDependencies(provider)

    for (const [depName, depToken] of Object.entries(deps)) {
      this.validateDependencyName(depName, provider)
      this.validateDependencyToken(depToken, provider, checker, context)
    }
  }

  private validateDependencyName(
    name: string,
    provider: ProviderWithDependencies,
  ): void {
    if (
      !name ||
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype'
    ) {
      throw new Error(
        `Cannot register provider "${tokenToString(provider.provide)}": invalid dependency name "${name}".`,
      )
    }
  }

  private validateDependencyToken(
    depToken: HasTypeToken,
    provider: ProviderWithDependencies,
    checker: CircularDependencyChecker,
    context: ContainerContext,
  ): void {
    const depKey = toKeyToken(depToken)

    const depProvider = findProvider(depKey, context)
    if (!depProvider) {
      throw new Error(
        `Cannot register provider "${tokenToString(provider.provide)}": dependency "${tokenToString(depToken)}" is not registered.`,
      )
    }

    // Only validate providers that can have dependencies
    if (!isValueProvider(depProvider)) {
      checker.push(depKey)
      this.validateProviderDependencies(
        depProvider as ProviderWithDependencies,
        checker,
        context,
      )
      checker.pop(depKey)
    }
  }
}
