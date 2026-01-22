import { AsyncLock } from './async-lock.ts'
import { createContainerProxy } from './container-proxy.ts'
import { Destroyer } from './destroyer.ts'
import { Handler } from './handler.ts'
import { Initializer } from './initializer.ts'
import { Registry, type RegistryFindOptions } from './registry.ts'
import type { Container } from './types/container.ts'
import {
  type ChildContainerOptions,
  type ContextOptions,
  fillContextOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import type { ExtractTypeInfo, Provider, Providers } from './types/provider.ts'
import type { Key, TypeInfo } from './types/token.ts'

export type KeySet = Set<Key>
export type HandlerRegistry = Registry<Key, Handler>
export type SingletonRegistry = Registry<Key, Injectable>
export type ProviderRegistry = Registry<Key, Provider>
export type HasSingletonOptions = RegistryFindOptions

export class ContainerContext<T extends TypeInfo = TypeInfo> {
  lock = new AsyncLock()
  children: ContainerContext[] = []
  keySet: KeySet
  providerRegistry: ProviderRegistry
  handlerRegistry: HandlerRegistry
  singletonRegistry: SingletonRegistry
  destroyCalled = false
  _type = undefined as unknown as T

  constructor(options: ContextOptions) {
    const filledOptions = fillContextOptions(options)
    const { providers, parent } = filledOptions

    this.keySet = new Set(providers.map((p) => p.token.key))
    this.providerRegistry = new Registry<string, Provider>(
      parent?.providerRegistry,
    )
    this.handlerRegistry = new Registry<string, Handler>(
      parent?.handlerRegistry,
    )
    this.singletonRegistry = new Registry<string, Injectable>(
      parent?.singletonRegistry,
    )

    const initializer = new Initializer(this, filledOptions)
    initializer.init()
  }

  async $destroy(): Promise<void> {
    await new Destroyer(this).destroy()
  }

  $createChild<const Ps extends Providers>(
    options: ChildContainerOptions<Ps>,
  ): Container<T & ExtractTypeInfo<Ps>> {
    this.$ensureNotDestroyed()

    const child = new ContainerContext<T & ExtractTypeInfo<Ps>>(options)

    this.children.push(child)

    return createContainerProxy(child)
  }

  $resolve<K extends Key, I extends Injectable>(key: K): Promise<I> {
    this.$ensureNotDestroyed()

    throw new Error('Method not implemented.')
  }

  $resolveSync<K extends Key, I extends Injectable>(key: K): I {
    this.$ensureNotDestroyed()

    throw new Error('Method not implemented.')
  }

  $get<K extends Key, I extends Injectable>(key: K): I {
    this.$ensureNotDestroyed()

    const singleton = this.singletonRegistry.find(key)
    if (!singleton) {
      throw new Error(`No singleton found for key "${key}".`)
    }

    return singleton as I
  }

  $hasSingleton<K extends Key>(key: K, options?: HasSingletonOptions): boolean {
    this.$ensureNotDestroyed()

    return this.singletonRegistry.find(key, options) !== undefined
  }

  $getOrCreateHandler<K extends Key, I extends Injectable>(
    key: K,
  ): Handler<I> | undefined {
    this.$ensureNotDestroyed()

    const found = this.handlerRegistry.find(key)
    if (found) {
      return found as Handler<I>
    }

    if (!this.keySet.has(key)) {
      return undefined
    }

    const handler = new Handler<I>(this, key)

    this.handlerRegistry.map.set(key, handler)

    return handler
  }

  $ensureNotDestroyed(): void {
    if (this.destroyCalled) {
      throw new Error('Container is destroyed.')
    }
  }
}
