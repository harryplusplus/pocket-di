import { createAsyncLock } from './async-lock.ts'
import { destroyContainer } from './destroy/destroy-container.ts'
import { parse } from './init/parse.ts'
import {
  fillContainerImplOptions,
  type ChildContainerOptions,
  type ContainerImplOptions,
  type ContainerOptions,
} from './types/container-options.ts'
import {
  isTupleInjectDeclaration,
  type RecordInjectDeclaration,
  type TupleInjectDeclaration,
} from './types/inject-declaration.ts'
import type { Injectable } from './types/injectable.ts'
import { isPostConstructable } from './types/lifecycle-events.ts'
import {
  type ClassProvider,
  classProviderToDeclaration,
  type FactoryProvider,
  factoryProviderToDeclaration,
  isClassProvider,
  isValueProvider,
  type Provider,
} from './types/provider.ts'
import { postConstruct } from './types/symbols.ts'
import { type InjectionToken, tokenToString } from './types/token.ts'
import type { MaybePromise } from './types/utils.ts'

export type Providers = Map<InjectionToken, Provider>

export type Singletons = Map<InjectionToken, Injectable>

export type DependencyMaybePromises = MaybePromise<Injectable>[]

export type DependencyMaybePromiseRecord = Record<
  string,
  MaybePromise<Injectable>
>

export class ContainerImpl {
  lock = createAsyncLock()
  children: ContainerImpl[] = []
  singletons: Singletons = new Map()
  providers: Providers
  parent: ContainerImpl | null
  destroyed = false

  constructor(options: ContainerImplOptions) {
    const opts = fillContainerImplOptions(options)

    const { providers, parent } = parse({
      providers: opts.providers,
      parent: opts.parent,
      override: opts.override,
    })

    this.providers = providers
    this.parent = parent
  }

  async destroy(): Promise<void> {
    if (this.destroyed) {
      return
    }

    await this.lock.acquire(async () => {
      if (this.destroyed) {
        return
      }

      this.destroyed = true

      await destroyContainer({ container: this })

      this.children.length = 0
      this.singletons.clear()
      this.providers.clear()
      this.parent = null
    })
  }

  async resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    this.ensureNotDestroyed()

    const instance = await this.lock.acquire(async () => {
      this.ensureNotDestroyed()

      return await this.resolveRecursive({
        token,
        sync: false,
      })
    })

    return instance as I
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    this.ensureNotDestroyed()

    const instance = this.resolveRecursive({
      token,
      sync: true,
    })

    return instance as I
  }

  createChild(options: ChildContainerOptions): Container {
    this.ensureNotDestroyed()

    const child = new ContainerImpl({
      ...options,
      parent: this,
    })

    this.children.push(child)

    return child
  }

  ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('Container is destroyed.')
    }
  }

  hasProvider(token: InjectionToken): boolean {
    this.ensureNotDestroyed()

    const provider = this.providers.get(token)
    if (provider) {
      return true
    }

    return this.parent?.hasProvider(token) ?? false
  }

  findProvider(token: InjectionToken): Provider | null {
    this.ensureNotDestroyed()

    const provider = this.providers.get(token)
    if (provider) {
      return provider
    }

    return this.parent?.findProvider(token) ?? null
  }

  findSingleton(token: InjectionToken): Injectable | null {
    this.ensureNotDestroyed()

    const singleton = this.singletons.get(token)
    if (singleton) {
      return singleton
    }

    return this.parent?.findSingleton(token) ?? null
  }

  resolveRecursive(input: {
    token: InjectionToken
    sync: boolean
  }): MaybePromise<Injectable> {
    this.ensureNotDestroyed()

    const { token, sync } = input

    const singleton = this.findSingleton(token)
    if (singleton) {
      return singleton
    }

    const provider = this.findProvider(token)
    if (!provider) {
      throw new Error(
        `Internal error: provider for token "${tokenToString(token)}" not found during resolve.`,
      )
    }

    if (isValueProvider(provider)) {
      return provider.useValue
    }

    return this.resolveDependentProvider({
      token,
      provider,
      sync,
    })
  }

  resolveDependentProvider(input: {
    token: InjectionToken
    provider: ClassProvider | FactoryProvider
    sync: boolean
  }): MaybePromise<Injectable> {
    this.ensureNotDestroyed()

    const { token, provider, sync } = input

    const declaration = isClassProvider(provider)
      ? classProviderToDeclaration(provider)
      : factoryProviderToDeclaration(provider)

    if (isTupleInjectDeclaration(declaration)) {
      return this.resolveTupleDeclaration({
        token,
        declaration,
        provider,
        sync,
      })
    }

    return this.resolveRecordDeclaration({
      token,
      declaration,
      provider,
      sync,
    })
  }

  resolveTupleDeclaration(input: {
    token: InjectionToken
    declaration: TupleInjectDeclaration
    provider: ClassProvider | FactoryProvider
    sync: boolean
  }): MaybePromise<Injectable> {
    this.ensureNotDestroyed()

    const { token, provider, declaration, sync } = input

    const maybePromises: DependencyMaybePromises = []
    for (const item of declaration) {
      maybePromises.push(
        this.resolveRecursive({
          token: item,
          sync,
        }),
      )
    }

    if (sync) {
      return this.resolveDependenciesSync({
        token,
        provider,
        maybePromises,
      })
    }

    return this.resolveDependenciesAsync({
      token,
      provider,
      maybePromises,
    })
  }

  resolveRecordDeclaration(input: {
    token: InjectionToken
    declaration: RecordInjectDeclaration
    provider: ClassProvider | FactoryProvider
    sync: boolean
  }): MaybePromise<Injectable> {
    this.ensureNotDestroyed()

    const { declaration, sync, provider, token } = input

    const maybePromiseRecord: DependencyMaybePromiseRecord = {}
    for (const [name, item] of Object.entries(declaration)) {
      maybePromiseRecord[name] = this.resolveRecursive({
        token: item,
        sync,
      })
    }

    if (sync) {
      return this.resolveDependencyRecordSync({
        token,
        provider,
        maybePromiseRecord,
      })
    }

    return this.resolveDependencyRecordAsync({
      maybePromiseRecord,
      provider,
      token,
    })
  }

  async resolveDependenciesAsync(input: {
    token: InjectionToken
    maybePromises: DependencyMaybePromises
    provider: ClassProvider | FactoryProvider
  }): Promise<Injectable> {
    this.ensureNotDestroyed()

    const { maybePromises, token, provider } = input

    const dependencies = await Promise.all(
      maybePromises.map((x) => Promise.resolve(x)),
    )

    const instance = await this.resolveInstance({
      token,
      provider,
      dependencies,
      sync: false,
    })

    return this.resolveSingleton({
      token,
      provider,
      instance,
    })
  }

  resolveDependenciesSync(input: {
    token: InjectionToken
    provider: ClassProvider | FactoryProvider
    maybePromises: DependencyMaybePromises
  }): Injectable {
    this.ensureNotDestroyed()

    const { token, provider, maybePromises } = input

    const dependencies = maybePromises as Injectable[]

    const instance = this.resolveInstance({
      token,
      provider,
      dependencies,
      sync: true,
    })

    return this.resolveSingleton({
      token,
      provider,
      instance,
    })
  }

  async resolveDependencyRecordAsync(input: {
    token: InjectionToken
    provider: ClassProvider | FactoryProvider
    maybePromiseRecord: DependencyMaybePromiseRecord
  }): Promise<Injectable> {
    this.ensureNotDestroyed()

    const { token, provider, maybePromiseRecord } = input

    const entries = await Promise.all(
      Object.entries(maybePromiseRecord).map(async ([name, maybePromise]) => {
        return [name, await maybePromise] as const
      }),
    )

    const dependencies = Object.fromEntries(entries)

    const instance = await this.resolveInstance({
      token,
      provider,
      dependencies,
      sync: false,
    })

    return this.resolveSingleton({
      token,
      provider,
      instance,
    })
  }

  resolveDependencyRecordSync(input: {
    token: InjectionToken
    provider: ClassProvider | FactoryProvider
    maybePromiseRecord: DependencyMaybePromiseRecord
  }): Injectable {
    this.ensureNotDestroyed()

    const { token, provider, maybePromiseRecord } = input

    const dependencies = maybePromiseRecord as Record<string, Injectable>

    const instance = this.resolveInstance({
      token,
      provider,
      dependencies,
      sync: true,
    })

    return this.resolveSingleton({
      token,
      provider,
      instance,
    })
  }

  resolveInstance(input: {
    token: InjectionToken
    provider: ClassProvider | FactoryProvider
    dependencies: Injectable[] | Record<string, Injectable>
    sync: boolean
  }): MaybePromise<Injectable> {
    this.ensureNotDestroyed()

    const { token, provider, dependencies, sync } = input

    if (isClassProvider(provider)) {
      const { useClass } = provider
      const instance = new useClass(dependencies)

      let postConstructResult: MaybePromise<void> | null = null
      if (isPostConstructable(instance)) {
        postConstructResult = instance[postConstruct]()
      }

      if (postConstructResult instanceof Promise) {
        if (sync) {
          throw new Error(
            `Cannot resolve "${tokenToString(token)}" (${useClass.name}) synchronously: postConstruct returns Promise.`,
          )
        }

        return postConstructResult.then(() => instance)
      }

      return instance
    }

    const { useFactory } = provider
    const instance = useFactory(dependencies)

    if (instance instanceof Promise && sync) {
      throw new Error(
        `Cannot resolve "${tokenToString(token)}" synchronously: useFactory returns Promise.`,
      )
    }

    return instance
  }

  resolveSingleton(input: {
    token: InjectionToken
    provider: ClassProvider | FactoryProvider
    instance: Injectable
  }): Injectable {
    this.ensureNotDestroyed()

    const { token, provider, instance } = input

    const { scope = 'singleton' } = provider

    if (scope === 'singleton') {
      this.singletons.set(token, instance)
    }

    return instance
  }
}

export type Container = Pick<
  ContainerImpl,
  'resolve' | 'resolveSync' | 'destroy' | 'createChild'
>

export function createContainer(options: ContainerOptions): Container {
  return new ContainerImpl(options)
}
