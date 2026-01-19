import type { ContainerImpl, Providers } from '../container.ts'
import { type Providable, providableToProvider } from '../types/providable.ts'
import { validateProvider } from './validate-provider.ts'

export function parseProviders(input: {
  parent: ContainerImpl | null
  override: boolean
  inputProviders: Providable[]
}): Providers {
  const { parent, override, inputProviders } = input

  const providers: Providers = new Map()
  for (const providable of inputProviders) {
    const provider = providableToProvider(providable)
    const token = provider.provide

    validateProvider({
      providers,
      parent,
      token,
      override,
    })

    providers.set(token, provider)
  }

  return providers
}
