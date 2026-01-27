/**
 * @file Container destruction and resource cleanup logic
 */

import type { ContainerContext } from './container-context.ts'
import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import { isPreDestroyable } from './lifecycle-events.ts'
import { isFactoryProvider } from './provider.ts'
import type { ConcreteProvider } from './provider-utils.ts'
import { findProvider } from './provider-utils.ts'
import { preDestroy } from './symbols.ts'

/**
 * ContainerDestroyer handles container destruction and resource cleanup
 */
export class ContainerDestroyer {
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

    for (const [key, instance] of entries) {
      const provider = findProvider(key, this.context)
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
    provider: ConcreteProvider,
    instance: Injectable,
  ): Promise<void> {
    // Try provider's preDestroy hook (only FactoryProvider has preDestroy)
    if (isFactoryProvider(provider) && provider.preDestroy) {
      try {
        await provider.preDestroy(instance)
      } catch {
        // Ignore errors during preDestroy
      }
      return
    }

    // Try instance's preDestroy method
    if (isPreDestroyable(instance)) {
      try {
        await instance[preDestroy]()
      } catch {
        // Ignore errors during preDestroy
      }
    }
  }
}
