import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import { isPreDestroyable } from '../types/lifecycle-events.ts'
import { isClassProvider, isFactoryProvider } from '../types/provider.ts'
import { preDestroy } from '../types/symbols.ts'
import { tokenToString } from '../types/token.ts'

export async function destroySingletonRegistry(
  context: { singletonRegistry: SingletonRegistry },
  input: { providerRegistry: ProviderRegistry },
): Promise<void> {
  const { singletonRegistry } = context
  const { providerRegistry } = input

  const copiedSingletons = [...singletonRegistry.map.entries()]
  copiedSingletons.reverse()

  for (const [token, singleton] of copiedSingletons) {
    const provider = providerRegistry.find(token)
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

  singletonRegistry.clear()
}
