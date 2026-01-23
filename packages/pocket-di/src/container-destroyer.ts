import type { ContainerImpl } from './container-impl.ts'
import { isPreDestroyable } from './types/lifecycle-events.ts'
import { isClassProvider, isFactoryProvider } from './types/provider.ts'
import { preDestroy } from './types/symbols.ts'

export class ContainerDestroyer {
  private readonly impl: ContainerImpl

  constructor(impl: ContainerImpl) {
    this.impl = impl
  }

  async destroy(): Promise<void> {
    const { context } = this.impl

    await this.destroyChildren()
    await this.destroySingletonRegistry()

    context.handlerRegistry.clear()
    context.providerRegistry.clear()
    context.validKeySet.clear()

    context.parent?.context.children.delete(this.impl)
    context.parent = null
  }

  async destroyChildren(): Promise<void> {
    const { children } = this.impl.context

    const copiedChildren = [...children]
    copiedChildren.reverse()
    children.clear()

    for (const child of copiedChildren) {
      try {
        await child.$destroy()
      } catch (_e) {
        // noop
      }
    }
  }

  async destroySingletonRegistry(): Promise<void> {
    const { singletonRegistry, providerRegistry } = this.impl.context

    const copiedSingletons = [...singletonRegistry.entries()]
    copiedSingletons.reverse()

    for (const [key, singleton] of copiedSingletons) {
      const provider = providerRegistry.find(key)
      if (!provider) {
        throw new Error(
          `Internal error: provider for key "${key}" not found during cleanup.`,
        )
      }

      if (isClassProvider(provider) && isPreDestroyable(singleton)) {
        try {
          await singleton[preDestroy]()
        } catch (_e) {
          // noop
        }
      } else if (isFactoryProvider(provider) && provider.preDestroy) {
        try {
          await provider.preDestroy(singleton)
        } catch (_e) {
          // noop
        }
      }
    }

    singletonRegistry.clear()
  }
}
