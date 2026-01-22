import { AsyncLock } from './async-lock.ts'
import { createContainerProxy } from './container-proxy.ts'
import { Registry } from './registry.ts'
import type { Container } from './types/container.ts'
import type {
  ChildContainerOptions,
  ContainerImplOptions,
} from './types/container-options.ts'
import type { Handler, HasSingletonOptions } from './types/handler.ts'
import type { Injectable } from './types/injectable.ts'
import type { ExtractTypeInfo, Providers } from './types/provider.ts'
import type { Key, TypeInfo } from './types/token.ts'

export type Keys = Set<string>
export type Handlers = Registry<string, Handler>
export type Singletons = Registry<string, Injectable>

export class ContainerImpl<T extends TypeInfo = TypeInfo> {
  lock = new AsyncLock()
  children: ContainerImpl[] = []
  keys: Keys
  handlers: Handlers
  singletons: Singletons
  destroyCalled = false
  _type = undefined as unknown as T

  constructor(options: ContainerImplOptions) {
    const { providers, parent, override = false } = options

    this.keys = new Set(providers.map((p) => p.token.key as string))
    this.handlers = new Registry<string, Handler>(parent?.handlers)
    this.singletons = new Registry<string, Injectable>(parent?.singletons)
  }

  $destroy(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  $createChild<const Ps extends Providers>(
    options: ChildContainerOptions<Ps>,
  ): Container<T & ExtractTypeInfo<Ps>> {
    this.$ensureNotDestroyed()

    const child = new ContainerImpl<T & ExtractTypeInfo<Ps>>(options)

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

    throw new Error('Method not implemented.')
  }

  $hasSingleton<K extends Key>(key: K, options?: HasSingletonOptions): boolean {
    this.$ensureNotDestroyed()

    return this.singletons.find(key, options) !== undefined
  }

  $getOrCreateHandler<K extends Key, I extends Injectable>(
    key: K,
  ): Handler<I> | undefined {
    this.$ensureNotDestroyed()

    const found = this.handlers.find(key)
    if (found) {
      return found as Handler<I>
    }

    if (!this.keys.has(key)) {
      return undefined
    }

    const handler: Handler<I> = {
      resolve: () => this.$resolve(key),
      resolveSync: () => this.$resolveSync(key),
      get: () => this.$get(key),
      hasSingleton: (options) => this.$hasSingleton(key, options),
    }

    this.handlers.set(key, handler)

    return handler
  }

  $ensureNotDestroyed(): void {
    if (this.destroyCalled) {
      throw new Error('Container is destroyed.')
    }
  }
}
