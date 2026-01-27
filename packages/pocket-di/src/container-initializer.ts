/**
 * @file Container 초기화, provider 등록 및 검증을 담당하는 클래스입니다.
 */

import { CircularDependencyChecker } from './circular-dependency-checker.ts'
import type { ContainerContext } from './container-context.ts'
import type { ContainerImpl } from './container-impl.ts'
import {
  normalizeProvider,
  normalizeToken,
  type NormalizedProvider,
} from './normalized-provider.ts'
import type { HasTypeToken, InjectionToken } from './token.ts'
import type { Provider } from './provider.ts'

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
      this.validateTokenUniqueness(normalized.token, context)
      context.providerMap.set(normalized.token, normalized)
    }
  }

  private validateTokenUniqueness(
    token: InjectionToken,
    context: ContainerContext,
  ): void {
    if (context.providerMap.has(token)) {
      throw new Error(
        `Cannot register token "${String(token)}": already registered in this container.`,
      )
    }

    const parentProvider = this.findProviderInParents(token, context)
    if (parentProvider) {
      throw new Error(
        `Cannot register token "${String(token)}": already exists in parent container.`,
      )
    }
  }

  private validateDependencies(context: ContainerContext): void {
    const checker = new CircularDependencyChecker()

    for (const [token, provider] of context.providerMap) {
      checker.push(token)
      this.validateProviderDependencies(provider, checker, context)
      checker.pop(token)
    }
  }

  private validateProviderDependencies(
    provider: NormalizedProvider,
    checker: CircularDependencyChecker,
    context: ContainerContext,
  ): void {
    const deps = provider.inject ?? {}

    for (const [depName, depToken] of Object.entries(deps)) {
      this.validateDependencyName(depName, provider.token)
      this.validateDependencyToken(depToken, provider.token, checker, context)
    }
  }

  private validateDependencyName(name: string, providerToken: InjectionToken): void {
    if (
      !name ||
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype'
    ) {
      throw new Error(
        `Cannot register provider "${String(providerToken)}": invalid dependency name "${name}".`,
      )
    }
  }

  private validateDependencyToken(
    depToken: HasTypeToken,
    providerToken: InjectionToken,
    checker: CircularDependencyChecker,
    context: ContainerContext,
  ): void {
    const normalizedDepToken = normalizeToken(depToken)

    const depProvider = this.findProvider(normalizedDepToken, context)
    if (!depProvider) {
      throw new Error(
        `Cannot register provider "${String(providerToken)}": dependency "${String(normalizedDepToken)}" is not registered.`,
      )
    }

    checker.push(normalizedDepToken)
    this.validateProviderDependencies(depProvider, checker, context)
    checker.pop(normalizedDepToken)
  }

  private findProvider(
    token: InjectionToken,
    context: ContainerContext,
  ): NormalizedProvider | undefined {
    if (context.providerMap.has(token)) {
      return context.providerMap.get(token)!
    }

    return this.findProviderInParents(token, context)
  }

  private findProviderInParents(
    token: InjectionToken,
    context: ContainerContext,
  ): NormalizedProvider | undefined {
    const parent = context.parent
    if (!parent) {
      return undefined
    }

    if (parent.context.providerMap.has(token)) {
      return parent.context.providerMap.get(token)!
    }

    return this.findProviderInParents(token, parent.context)
  }
}
