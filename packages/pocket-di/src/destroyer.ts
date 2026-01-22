import type { ContainerContext } from './container-context.ts'
import { isPreDestroyable } from './types/lifecycle-events.ts'
import { isClassProvider, isFactoryProvider } from './types/provider.ts'
import { preDestroy } from './types/symbols.ts'

export class Destroyer {
  context: ContainerContext

  constructor(context: ContainerContext) {
    this.context = context
  }

  async destroy(): Promise<void> {
    const { context } = this

    if (context.destroyCalled) {
      return
    }

    await context.lock.acquire(async () => {
      if (context.destroyCalled) {
        return
      }

      context.destroyCalled = true

      await this.destroyChildren()
      await this.destroySingletonRegistry()

      context.handlerRegistry.clear()
      context.providerRegistry.clear()
      context.keySet.clear()
    })
  }

  async destroyChildren(): Promise<void> {
    const { children } = this.context

    for (let i = children.length - 1; i >= 0; i--) {
      try {
        await children[i].$destroy()
      } catch (_e) {
        // noop
      }
    }

    children.length = 0
  }

  async destroySingletonRegistry(): Promise<void> {
    const { singletonRegistry, providerRegistry } = this.context

    const copiedSingletons = [...singletonRegistry.map.entries()]
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
