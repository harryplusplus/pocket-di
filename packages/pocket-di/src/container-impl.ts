/**
 * @file Internal container implementation
 */

import { AsyncLock } from './async-lock.ts'
import { AsyncResolver } from './async-resolver.ts'
import type { Container, CreateChildOptions } from './container.ts'
import type { ContainerContext } from './container-context.ts'
import { ContainerInitializer } from './container-initializer.ts'
import { Destroyer } from './destroyer.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import { SyncResolver } from './sync-resolver.ts'
import type { InjectionToken } from './token.ts'

/**
 * Internal options for creating a container
 */
interface ContainerImplOptions {
  providers: Provider[]
  parent?: ContainerImpl
}

/**
 * ContainerImpl implements the Container interface
 * All methods delegate behavior to specialized classes
 */
export class ContainerImpl implements Container {
  readonly lock = new AsyncLock()
  private destroyed = false
  readonly context!: ContainerContext

  // Lazy initialization of resolvers and destroyer
  private _asyncResolver?: AsyncResolver
  private _syncResolver?: SyncResolver
  private _destroyer?: Destroyer

  constructor(options: ContainerImplOptions) {
    const initializer = new ContainerInitializer(this, options)
    this.context = initializer.initialize()
  }

  /**
   * Get async resolver instance (lazy initialization)
   */
  private get asyncResolver(): AsyncResolver {
    if (!this._asyncResolver) {
      this._asyncResolver = new AsyncResolver(this)
    }
    return this._asyncResolver
  }

  /**
   * Get sync resolver instance (lazy initialization)
   */
  private get syncResolver(): SyncResolver {
    if (!this._syncResolver) {
      this._syncResolver = new SyncResolver(this)
    }
    return this._syncResolver
  }

  /**
   * Get destroyer instance (lazy initialization)
   */
  private get destroyer(): Destroyer {
    if (!this._destroyer) {
      this._destroyer = new Destroyer(this)
    }
    return this._destroyer
  }

  /**
   * Check if container is destroyed
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('Container has been destroyed')
    }
  }

  async destroy(): Promise<void> {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    await this.lock.acquire(async () => {
      if (this.destroyed) {
        return
      }

      await this.destroyer.destroy()
    })
  }

  createChild(options: CreateChildOptions): Container {
    return new ContainerImpl({ ...options, parent: this })
  }

  async resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    this.checkDestroyed()
    return this.asyncResolver.resolve(token)
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    this.checkDestroyed()
    return this.syncResolver.resolve(token)
  }

  hasSingleton(token: InjectionToken): boolean {
    this.checkDestroyed()
    return this.context.singletonMap.has(token)
  }

  get<I extends Injectable>(token: InjectionToken<I>): I {
    this.checkDestroyed()
    const instance = this.context.singletonMap.get(token)
    if (instance === undefined) {
      throw new Error(
        `Cannot get singleton for token "${String(token)}": instance not found.`,
      )
    }
    return instance as I
  }
}
