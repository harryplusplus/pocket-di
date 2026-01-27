/**
 * @file Container destruction and resource cleanup logic
 */

import type { ContainerContext } from './container-context.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { NormalizedProvider } from './normalized-provider.ts'
import { preDestroy } from './symbols.ts'

/**
 * Destroyer handles container destruction and resource cleanup
 */
export class Destroyer {
  private readonly container: ContainerImpl
  private readonly context: ContainerContext

  constructor(container: ContainerImpl) {
    this.container = container
    this.context = container.context
  }

  /**
   * Destroy container and all resources
   * 1. Destroy children in reverse order
   * 2. Destroy singletons with preDestroy
   * 3. Clear all maps
   * 4. Remove from parent
   */
  async destroy(): Promise<void> {
    await this.destroyChildren()
    await this.destroySingletons()

    // Clear all maps
    this.context.singletonMap.clear()
    this.context.providerMap.clear()
    this.context.children.clear()

    // Remove from parent
    if (this.context.parent) {
      this.context.parent.context.children.delete(this.container)
    }
  }

  /**
   * Destroy all child containers in reverse order
   */
  private async destroyChildren(): Promise<void> {
    const children = [...this.context.children]
    children.reverse()

    for (const child of children) {
      try {
        await child.destroy()
      } catch {
        // Ignore errors during child destruction
      }
    }
  }

  /**
   * Destroy all singleton instances in reverse order
   * Calls preDestroy before destroying each instance
   */
  private async destroySingletons(): Promise<void> {
    const entries = [...this.context.singletonMap.entries()]
    entries.reverse()

    for (const [token, instance] of entries) {
      const provider = this.findProvider(token)
      if (provider) {
        await this.callPreDestroy(provider, instance)
      }
    }
  }

  /**
   * Call preDestroy on instance if provider has preDestroy hook
   * or if instance has preDestroy method
   */
  private async callPreDestroy(
    provider: NormalizedProvider,
    instance: Injectable,
  ): Promise<void> {
    // Try provider's preDestroy hook
    if (provider.preDestroy) {
      try {
        await provider.preDestroy(instance)
      } catch {
        // Ignore errors during preDestroy
      }
      return
    }

    // Try instance's preDestroy method
    if (this.isPreDestroyable(instance)) {
      try {
        await instance[preDestroy]()
      } catch {
        // Ignore errors during preDestroy
      }
    }
  }

  /**
   * Check if instance has preDestroy method
   */
  private isPreDestroyable(
    instance: Injectable,
  ): instance is Injectable & { [preDestroy]: () => void | Promise<void> } {
    return (
      typeof instance === 'object' &&
      instance !== null &&
      preDestroy in instance &&
      typeof (instance as any)[preDestroy] === 'function'
    )
  }

  /**
   * Find provider for token in current or parent containers
   */
  private findProvider(token: InjectionToken): NormalizedProvider | undefined {
    const provider = this.context.providerMap.get(token)
    if (provider) {
      return provider
    }

    const parent = this.context.parent
    if (parent) {
      return parent.context.providerMap.get(token) ?? undefined
    }

    return undefined
  }
}

// Import InjectionToken at the bottom to avoid circular dependency
import type { InjectionToken } from './token.ts'
