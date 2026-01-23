import { AsyncLock } from './async-lock.ts'
import { AsyncResolver } from './async-resolver.ts'
import { ContainerDestroyer } from './container-destroyer.ts'
import { ContainerHandler } from './container-handler.ts'
import { ContainerInitializer } from './container-initializer.ts'
import { createContainerProxy } from './container-proxy.ts'
import { Registry } from './registry.ts'
import { SyncResolver } from './sync-resolver.ts'
import type {
  Container,
  ContainerType,
  ExtractContainerType,
} from './types/container.ts'
import type {
  ContainerContext,
  HasSingletonOptions,
} from './types/container-context.ts'
import {
  type ChildContainerOptions,
  type ContainerImplOptions,
  fillContainerImplOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import type { Provider, Providers } from './types/provider.ts'
import type { Key } from './types/token.ts'

export class ContainerImpl<T extends ContainerType = ContainerType> {
  private readonly lock = new AsyncLock()
  private destroyCalled = false

  private readonly _context: ContainerContext
  get context(): ContainerContext {
    return this._context
  }

  private readonly _type = undefined as unknown as T

  constructor(options: ContainerImplOptions) {
    const filledOptions = fillContainerImplOptions(options)
    const { parent } = filledOptions

    this._context = {
      children: new Set(),
      parent: parent ?? null,
      validKeySet: new Set(),
      providerRegistry: new Registry<string, Provider>(
        parent?.context.providerRegistry,
      ),
      handlerRegistry: new Registry<string, ContainerHandler>(
        parent?.context.handlerRegistry,
      ),
      singletonRegistry: new Registry<string, Injectable>(
        parent?.context.singletonRegistry,
      ),
      asyncResolver: new AsyncResolver(this),
      syncResolver: new SyncResolver(this),
    }

    new ContainerInitializer(this, filledOptions).init()
  }

  async $destroy(): Promise<void> {
    if (this.destroyCalled) {
      return
    }

    await this.lock.acquire(async () => {
      if (this.destroyCalled) {
        return
      }

      this.destroyCalled = true

      await new ContainerDestroyer(this).destroy()
    })
  }

  $createChild<const Ps extends Providers>(
    options: ChildContainerOptions<Ps>,
  ): Container<T & ExtractContainerType<Ps>> {
    this.$ensureNotDestroyed()

    const child = new ContainerImpl<T & ExtractContainerType<Ps>>(options)

    this.context.children.add(child)

    return createContainerProxy(child)
  }

  async $resolve<K extends Key, I extends Injectable>(key: K): Promise<I> {
    this.$ensureNotDestroyed()

    const instance = await this.context.asyncResolver.resolve(key)

    return instance as I
  }

  $resolveSync<K extends Key, I extends Injectable>(key: K): I {
    this.$ensureNotDestroyed()

    const instance = this.context.syncResolver.resolve(key)

    return instance as I
  }

  $get<K extends Key, I extends Injectable>(key: K): I {
    this.$ensureNotDestroyed()

    const singleton = this.context.singletonRegistry.find(key)
    if (!singleton) {
      throw new Error(`No singleton found for key "${key}".`)
    }

    return singleton as I
  }

  $hasSingleton<K extends Key>(key: K, options?: HasSingletonOptions): boolean {
    this.$ensureNotDestroyed()

    return this.context.singletonRegistry.find(key, options) !== undefined
  }

  $getOrCreateHandler<K extends Key, I extends Injectable>(
    key: K,
  ): ContainerHandler<I> | undefined {
    this.$ensureNotDestroyed()

    const found = this.context.handlerRegistry.find(key)
    if (found) {
      return found as ContainerHandler<I>
    }

    if (!this.context.validKeySet.has(key)) {
      return undefined
    }

    const handler = new ContainerHandler<I>(this, key)

    this.context.handlerRegistry.set(key, handler)

    return handler
  }

  $ensureNotDestroyed(): void {
    if (this.destroyCalled) {
      throw new Error('Container is destroyed.')
    }
  }
}
