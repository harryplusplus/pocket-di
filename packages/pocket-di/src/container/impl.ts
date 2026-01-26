import { AsyncLock } from '../async-lock.ts'
import { Registry } from '../registry.ts'
import type {
  Container,
  ContainerContext,
  CreateContainerOptions,
} from '../types/container.ts'
import type { Injectable } from '../types/injectable.ts'
import type { Provider } from '../types/provider.ts'
import type { InjectionToken } from '../types/token.ts'
import { isPlainToken } from '../types/token.ts'
import { ContainerDestroyer } from './destroyer.ts'

/**
 * Internal options for creating a container
 */
interface ContainerImplOptions {
  providers: Provider[]
  parent?: ContainerImpl
}

export class ContainerImpl implements Container {
  readonly lock = new AsyncLock()
  readonly context: ContainerContext
  private destroyed = false

  constructor(options: ContainerImplOptions) {
    const { providers, parent } = options

    this.context = {
      providerRegistry: new Registry(parent?.context.providerRegistry),
      singletonRegistry: new Registry(parent?.context.singletonRegistry),
      parent,
      children: new Set(),
    }

    // Register this as a child of parent
    parent?.context.children.add(this)

    // TODO: initialization
  }

  async destroy(): Promise<void> {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    await new ContainerDestroyer(this).destroy()

    // Destroy all children first
    for (const child of this.context.children) {
      await child.destroy()
    }

    // Call preDestroy hooks for all singletons
    for (const [token, instance] of Array.from(
      this.context.singletonRegistry.entries(),
    )) {
      const provider = this.context.providerRegistry.find(token)
      if (provider && 'preDestroy' in provider && provider.preDestroy) {
        await provider.preDestroy(instance as any)
      }
    }

    // Clear registries
    this.context.singletonRegistry.clear()
    this.context.providerRegistry.clear()
    this.context.children.clear()

    // Remove from parent
    if (this.context.parent) {
      const parentContext = this.context.parent.getContext()
      parentContext.children.delete(this)
    }
  }

  createChild(options: { providers: Provider[] }): Container {
    return new ContainerImpl({ providers: options.providers, parent: this })
  }

  async resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    if (this.destroyed) {
      throw new Error('Container has been destroyed')
    }

    const normalizedToken = this.normalizeToken(token)

    // Check singleton cache
    const cached = this.context.singletonRegistry.find(normalizedToken)
    if (cached) {
      return cached as I
    }

    const provider = this.context.providerRegistry.find(normalizedToken)
    if (!provider) {
      throw new Error(`No provider found for token: ${String(normalizedToken)}`)
    }

    const instance = await this.createInstance(provider, normalizedToken)

    // Cache if singleton
    if (this.isSingleton(provider)) {
      this.context.singletonRegistry.set(normalizedToken, instance as any)
    }

    return instance as I
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    if (this.destroyed) {
      throw new Error('Container has been destroyed')
    }

    const normalizedToken = this.normalizeToken(token)

    // Check singleton cache
    const cached = this.context.singletonRegistry.find(normalizedToken)
    if (cached) {
      return cached as I
    }

    const provider = this.context.providerRegistry.find(normalizedToken)
    if (!provider) {
      throw new Error(`No provider found for token: ${String(normalizedToken)}`)
    }

    const instance = this.createInstanceSync(provider, normalizedToken)

    // Cache if singleton
    if (this.isSingleton(provider)) {
      this.context.singletonRegistry.set(normalizedToken, instance as any)
    }

    return instance as I
  }

  hasSingleton(token: InjectionToken): boolean {
    const normalizedToken = this.normalizeToken(token)
    const provider = this.context.providerRegistry.find(normalizedToken)
    return provider !== undefined && this.isSingleton(provider)
  }

  get<I extends Injectable>(token: InjectionToken<I>): I {
    const normalizedToken = this.normalizeToken(token)
    const instance = this.context.singletonRegistry.find(normalizedToken)

    if (!instance) {
      throw new Error(
        `No singleton found for token: ${String(normalizedToken)}`,
      )
    }

    return instance as I
  }

  private normalizeToken(token: InjectionToken): InjectionToken {
    // For plain tokens (string | symbol), use as-is
    if (isPlainToken(token)) {
      return token
    }

    // It's a HasTypeToken or InjectableConstructor
    if (typeof token === 'object' && token !== null && 'token' in token) {
      return token.token
    }

    // It's a constructor, use it directly
    return token
  }

  private isSingleton(
    provider: Provider,
  ): provider is Provider & { scope: 'singleton' } {
    return 'scope' in provider ? provider.scope === 'singleton' : true
  }

  private async createInstance(
    provider: Provider,
    token: InjectionToken,
  ): Promise<unknown> {
    if ('useValue' in provider) {
      return provider.useValue
    }

    if ('useClass' in provider) {
      // TODO: Resolve constructor dependencies
      const Instance = provider.useClass
      return new Instance()
    }

    if ('useFactory' in provider) {
      // TODO: Resolve factory dependencies
      const deps = {} as any
      return provider.useFactory(deps)
    }

    throw new Error(`Invalid provider for token: ${String(token)}`)
  }

  private createInstanceSync(
    provider: Provider,
    token: InjectionToken,
  ): unknown {
    if ('useValue' in provider) {
      return provider.useValue
    }

    if ('useClass' in provider) {
      // TODO: Resolve constructor dependencies
      const Instance = provider.useClass
      return new Instance()
    }

    if ('useFactory' in provider) {
      // TODO: Resolve factory dependencies
      const deps = {} as any
      const result = provider.useFactory(deps)
      if (result instanceof Promise) {
        throw new Error(
          `Async factory detected for token: ${String(token)}. Use resolve() instead of resolveSync()`,
        )
      }
      return result
    }

    throw new Error(`Invalid provider for token: ${String(token)}`)
  }
}
