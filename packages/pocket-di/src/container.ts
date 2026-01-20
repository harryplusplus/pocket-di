import { AsyncLock } from './async-lock.ts'
import { destroyContainer } from './destroy/destroy-container.ts'
import { parse } from './init/parse.ts'
import { Registry } from './registry.ts'
import { resolveRecursiveAsync } from './resolve/resolve-recursive-async.ts'
import { resolveRecursiveSync } from './resolve/resolve-recursive-sync.ts'
import type {
  ProviderRegistry,
  SingletonRegistry,
} from './types/compositions.ts'
import {
  type ChildContainerOptions,
  type ContainerImplOptions,
  type ContainerOptions,
  fillContainerImplOptions,
} from './types/container-options.ts'
import type { Injectable } from './types/injectable.ts'
import { type InjectionToken } from './types/token.ts'

export class ContainerImpl {
  lock = new AsyncLock()
  children: ContainerImpl[] = []
  singletonRegistry: SingletonRegistry = new Registry(null)
  providerRegistry: ProviderRegistry
  destroyCalled = false

  constructor(options: ContainerImplOptions) {
    const opts = fillContainerImplOptions(options)

    const providerRegistry = parse({
      providables: opts.providers,
      parentProviderRegistry: opts.parent?.providerRegistry ?? null,
      override: opts.override,
    })

    this.providerRegistry = providerRegistry
    this.singletonRegistry = new Registry(
      opts.parent?.singletonRegistry ?? null,
    )
  }

  async destroy(): Promise<void> {
    if (this.destroyCalled) {
      return
    }

    await this.lock.acquire(async () => {
      if (this.destroyCalled) {
        return
      }

      this.destroyCalled = true

      await destroyContainer({ container: this })
    })
  }

  async resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    this.ensureNotDestroyed()

    const instance = await this.lock.acquire(async () => {
      this.ensureNotDestroyed()

      return await resolveRecursiveAsync(
        { singletonRegistry: this.singletonRegistry },
        { token, providerRegistry: this.providerRegistry },
      )
    })

    return instance as I
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    this.ensureNotDestroyed()

    const instance = resolveRecursiveSync(
      { singletonRegistry: this.singletonRegistry },
      { token, providerRegistry: this.providerRegistry },
    )

    return instance as I
  }

  createChild(options: ChildContainerOptions): Container {
    this.ensureNotDestroyed()

    const child = new ContainerImpl({ ...options, parent: this })

    this.children.push(child)

    return child
  }

  ensureNotDestroyed(): void {
    if (this.destroyCalled) {
      throw new Error('Container is destroyed.')
    }
  }
}

export type Container = Pick<
  ContainerImpl,
  'resolve' | 'resolveSync' | 'destroy' | 'createChild'
>

export function createContainer(options: ContainerOptions): Container {
  return new ContainerImpl(options)
}
