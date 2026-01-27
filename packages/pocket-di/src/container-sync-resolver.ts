/**
 * @file Synchronous instance resolution logic
 */

import {
  ContainerCommonResolver,
  getProviderDependencies,
  type ProviderWithDependencies,
} from './container-common-resolver.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import { isPostConstructable } from './lifecycle-events.ts'
import { isClassProvider } from './provider.ts'
import { postConstruct } from './symbols.ts'
import type { InjectionToken } from './token.ts'
import { tokenToString } from './token.ts'

/**
 * ContainerSyncResolver handles synchronous instance resolution
 */
export class ContainerSyncResolver {
  private readonly common: ContainerCommonResolver

  constructor(container: ContainerImpl) {
    this.common = new ContainerCommonResolver(container)
  }

  /**
   * Resolve instance for token synchronously
   */
  resolve<I extends Injectable>(token: InjectionToken<I>): I {
    const output = this.common.resolveInstanceOrProvider(token)

    // Return cached instance if available
    if (output.kind === 'instance') {
      return output.instance as I
    }

    // Create instance from provider
    const { provider } = output
    const dependencies = this.resolveDependencies(provider)
    const instance = this.resolveInstance(provider, dependencies)

    // Store in singleton registry if scope is singleton
    this.common.updateSingletonRegistry({ provider, instance })

    return instance as I
  }

  /**
   * Resolve provider dependencies synchronously
   */
  private resolveDependencies(
    provider: ProviderWithDependencies,
  ): Record<string, Injectable> {
    const deps = getProviderDependencies(provider)
    const resolved: Record<string, Injectable> = {}

    for (const [name, depToken] of Object.entries(deps)) {
      resolved[name] = this.resolve(depToken)
    }

    return resolved
  }

  /**
   * Create instance from provider and call postConstruct
   */
  private resolveInstance(
    provider: ProviderWithDependencies,
    dependencies: Record<string, Injectable>,
  ): Injectable {
    let instance: Injectable

    if (isClassProvider(provider)) {
      // Create via class constructor
      const ctor = provider.useClass
      instance = new ctor(dependencies)
    } else {
      // Create via factory
      const result = provider.useFactory(dependencies)

      // Throw error if factory returns Promise
      if (result instanceof Promise) {
        throw new Error(
          `Cannot resolve "${tokenToString(provider.provide)}" synchronously: factory returns Promise.`,
        )
      }

      instance = result
    }

    // Call postConstruct
    this.callPostConstruct(instance)

    return instance
  }

  /**
   * Call postConstruct on instance
   * Throws error if postConstruct returns Promise
   */
  private callPostConstruct(instance: Injectable): void {
    if (isPostConstructable(instance)) {
      const result = instance[postConstruct]()

      // Throw error if postConstruct returns Promise
      if (result instanceof Promise) {
        throw new Error(
          `Cannot call postConstruct on ${instance.constructor.name}: method returns Promise.`,
        )
      }
    }
  }
}
