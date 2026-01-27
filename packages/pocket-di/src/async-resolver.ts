/**
 * @file Asynchronous instance resolution logic
 */

import { postConstruct } from './symbols.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { InjectionToken } from './token.ts'
import {
  CommonResolver,
  getProviderDependencies,
  type ProviderHasDependencies,
} from './common-resolver.ts'

/**
 * AsyncResolver handles asynchronous instance resolution
 */
export class AsyncResolver {
  private readonly common: CommonResolver

  constructor(container: ContainerImpl) {
    this.common = new CommonResolver(container)
  }

  /**
   * Resolve instance for token asynchronously
   */
  async resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    const output = this.common.resolveInstanceOrProvider(token)

    // Return cached instance if available
    if (output.kind === 'instance') {
      return output.instance as I
    }

    // Create instance from provider
    const { provider } = output
    const dependencies = await this.resolveDependencies(provider)
    const instance = await this.resolveInstance(provider, dependencies)

    // Store in singleton registry if scope is singleton
    this.common.updateSingletonRegistry({ provider, instance })

    return instance as I
  }

  /**
   * Resolve provider dependencies asynchronously
   */
  private async resolveDependencies(
    provider: ProviderHasDependencies,
  ): Promise<Record<string, Injectable>> {
    const deps = getProviderDependencies(provider)
    const resolved: Record<string, Injectable> = {}

    for (const [name, depToken] of Object.entries(deps)) {
      resolved[name] = await this.resolve(depToken)
    }

    return resolved
  }

  /**
   * Create instance from provider and call postConstruct
   */
  private async resolveInstance(
    provider: ProviderHasDependencies,
    dependencies: Record<string, Injectable>,
  ): Promise<Injectable> {
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
      instance = await factory(dependencies)
    }

    // Call postConstruct
    await this.callPostConstruct(instance)

    return instance
  }

  /**
   * Call postConstruct on instance
   */
  private async callPostConstruct(instance: Injectable): Promise<void> {
    if (this.isPostConstructable(instance)) {
      await instance[postConstruct]()
    }
  }

  /**
   * Check if instance has postConstruct method
   */
  private isPostConstructable(
    instance: Injectable,
  ): instance is Injectable & {
    [postConstruct]: () => void | Promise<void>
  } {
    return (
      typeof instance === 'object' &&
      instance !== null &&
      postConstruct in instance &&
      typeof (instance as any)[postConstruct] === 'function'
    )
  }
}
