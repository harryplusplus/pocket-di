import type { ContainerImpl, Providers, Singletons } from '../container.ts'
import { isPreDestroyable } from '../types/lifecycle-events.ts'
import { isClassProvider, isFactoryProvider } from '../types/provider.ts'
import { preDestroy } from '../types/symbols.ts'
import { tokenToString } from '../types/token.ts'

export async function destroySingletons(input: {
  singletons: Singletons
  providers: Providers
  parent: ContainerImpl | null
}): Promise<void> {
  const { singletons, providers, parent } = input

  const copiedSingletons = [...singletons.entries()]
  copiedSingletons.reverse()

  for (const [token, singleton] of copiedSingletons) {
    const provider =
      providers.get(token) ?? parent?.providers.get(token) ?? null

    if (!provider) {
      throw new Error(
        `Internal error: provider for token "${tokenToString(token)}" not found during cleanup.`,
      )
    }

    if (isClassProvider(provider) && isPreDestroyable(singleton)) {
      try {
        await singleton[preDestroy]()
      } catch (_e) {
        // noop
      }
    } else if (isFactoryProvider(provider)) {
      try {
        await provider.preDestroy?.(singleton)
      } catch (_e) {
        // noop
      }
    }
  }
}
