/**
 * @file Synchronous instance resolution logic
 */

import {
  CommonResolver,
  getProviderDependencies,
  type ProviderHasDependencies,
} from './common-resolver.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import { postConstruct } from './symbols.ts'
import type { InjectionToken } from './token.ts'

/**
 * SyncResolver handles synchronous instance resolution
 */
export class SyncResolver {
  private readonly common: CommonResolver

  constructor(container: ContainerImpl) {
    this.common = new CommonResolver(container)
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
    provider: ProviderHasDependencies,
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
    provider: ProviderHasDependencies,
    dependencies: Record<string, Injectable>,
  ): Injectable {
    let instance: Injectable

    if (provider.type === 'class') {
      // Create via class constructor
      const ctor = provider.classConstructor
      if (!ctor) {
        throw new Error(
          `Cannot resolve "${String(provider.token)}": class constructor is missing.`,
        )
      }
      instance = new ctor(dependencies)
    } else {
      // Create via factory
      const factory = provider.factory
      if (!factory) {
        throw new Error(
          `Cannot resolve "${String(provider.token)}": factory is missing.`,
        )
      }
      const result = factory(dependencies)

      // Throw error if factory returns Promise
      if (result instanceof Promise) {
        throw new Error(
          `Cannot resolve "${String(provider.token)}" synchronously: factory returns Promise.`,
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
    if (this.isPostConstructable(instance)) {
      const result = instance[postConstruct]()

      // Throw error if postConstruct returns Promise
      if (result instanceof Promise) {
        throw new Error(
          `Cannot call postConstruct on ${instance.constructor.name}: method returns Promise.`,
        )
      }
    }
  }

  /**
   * Check if instance has postConstruct method
   */
  private isPostConstructable(
    instance: Injectable,
  ): instance is Injectable & { [postConstruct]: () => void | Promise<void> } {
    return (
      typeof instance === 'object' &&
      instance !== null &&
      postConstruct in instance &&
      typeof (instance as any)[postConstruct] === 'function'
    )
  }
}
