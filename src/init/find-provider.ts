import type { ContainerContext, Providers } from '../container-context.ts'
import type { Provider } from '../types/provider.ts'
import type { InjectionToken } from '../types/token.ts'

export interface FindProvider {
  (token: InjectionToken): Provider | null
}

export function createFindProvider(input: {
  providers: Providers
  parent: ContainerContext | null
}): FindProvider {
  const { providers, parent } = input

  return (token: InjectionToken) => findProvider({ providers, parent, token })
}

export function findProvider(input: {
  providers: Providers
  parent: ContainerContext | null
  token: InjectionToken
}): Provider | null {
  const { providers, parent, token } = input

  const provider = providers.get(token)
  if (provider) {
    return provider
  }

  return parent?.providers.get(token) ?? null
}
