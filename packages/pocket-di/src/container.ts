/**
 * @file Public container API
 */

import { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { InjectionToken } from './token.ts'

export interface CreateChildOptions {
  /**
   * Registers providers to be used in child container
   */
  providers: Provider[]

  /**
   * Defines whether to override parent's provider
   * If false and same token exists in parent, throws error
   * @default false
   * @todo
   */
  override?: boolean
}

export interface Container {
  /**
   * Destroy this container and all its children
   */
  destroy(): Promise<void>

  /**
   * Create a child container
   */
  createChild(options: CreateChildOptions): Container

  /**
   * Resolve and return injectable instance
   * Reuses existing singleton if provider is singleton
   * Creates new instance on every resolve if provider is transient
   * Dependencies are also resolved recursively
   */
  resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I>

  /**
   * Resolve and return injectable instance synchronously
   * If class instance has postConstruct, calls it (throws if returns Promise)
   * If factory provider's useFactory returns Promise, throws error
   * All dependencies must also be synchronously resolved (not return Promise)
   */
  resolveSync<I extends Injectable>(token: InjectionToken<I>): I

  /**
   * Check if singleton instance exists
   */
  hasSingleton(token: InjectionToken): boolean

  /**
   * Return singleton instance, throw if not found
   */
  get<I extends Injectable>(token: InjectionToken<I>): I
}

export interface CreateContainerOptions {
  /**
   * Registers providers to be used in container
   */
  providers: Provider[]
}

/**
 * Create a new DI container
 */
export function createContainer(options: CreateContainerOptions): Container {
  return new ContainerImpl(options)
}
