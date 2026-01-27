/**
 * @file Asynchronous instance resolution logic
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

/**
 * ContainerAsyncResolver handles asynchronous instance resolution
 */
export class ContainerAsyncResolver {
  private readonly common: ContainerCommonResolver

  constructor(container: ContainerImpl) {
    this.common = new ContainerCommonResolver(container)
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
    provider: ProviderWithDependencies,
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
    provider: ProviderWithDependencies,
    dependencies: Record<string, Injectable>,
  ): Promise<Injectable> {
    let instance: Injectable

    if (isClassProvider(provider)) {
      // Create via class constructor
      instance = new provider.useClass(dependencies)
    } else {
      // Create via factory
      instance = await provider.useFactory(dependencies)
    }

    // Call postConstruct
    await this.callPostConstruct(instance)

    return instance
  }

  /**
   * Call postConstruct on instance
   */
  private async callPostConstruct(instance: Injectable): Promise<void> {
    if (isPostConstructable(instance)) {
      await instance[postConstruct]()
    }
  }
}
