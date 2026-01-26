import { ContainerImpl } from '../container/impl.ts'
import { Registry } from '../registry.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { InjectionToken } from './token.ts'

/**
 * Container context holding registries and parent/child relationships
 */
export interface ContainerContext {
  readonly providerRegistry: Registry<InjectionToken, Provider>
  readonly singletonRegistry: Registry<InjectionToken, Injectable>
  readonly parent?: ContainerImpl
  readonly children: Set<ContainerImpl>
}

/**
 * Main Container interface
 */
export interface Container {
  /**
   * Destroy the container and all singletons
   */
  destroy(): Promise<void>

  /**
   * Create a child container with additional providers
   * Child inherits parent's singletons
   */
  createChild(options: { providers: Provider[]; override?: boolean }): Container

  /**
   * Resolve a dependency asynchronously
   * Handles both sync and async factories
   */
  resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I>

  /**
   * Resolve a dependency synchronously
   * Throws if the provider requires async operations
   */
  resolveSync<I extends Injectable>(token: InjectionToken<I>): I

  /**
   * Check if a singleton instance exists for the token
   */
  hasSingleton(token: InjectionToken): boolean

  /**
   * Get an existing singleton instance
   * Throws if not found
   */
  get<I extends Injectable>(token: InjectionToken<I>): I
}

/**
 * Options for creating a container (public API)
 */
export interface CreateContainerOptions {
  providers: Provider[]
}

/**
 * Create a new DI container
 */
export function createContainer(options: CreateContainerOptions): Container {
  return new ContainerImpl(options)
}
