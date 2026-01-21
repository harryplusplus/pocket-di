import { Registry } from '../registry.ts'
import {
  type ProviderRegistry,
  tokenToRegistryKey,
} from '../types/compositions.ts'
import { type Providable, providableToProvider } from '../types/providable.ts'
import { validateProvider } from './validate-provider.ts'

export function parseProviderRegistry(input: {
  parentProviderRegistry: ProviderRegistry | null
  override: boolean
  providables: Providable[]
}): ProviderRegistry {
  const { override, providables, parentProviderRegistry } = input

  const providerRegistry = new Registry(parentProviderRegistry)
  for (const providable of providables) {
    const provider = providableToProvider(providable)
    const token = provider.provide

    validateProvider({ providerRegistry, token, override })

    const key = tokenToRegistryKey(token)
    providerRegistry.map.set(key, provider)
  }

  return providerRegistry
}
