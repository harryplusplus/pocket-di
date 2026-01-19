import type { ContainerImpl, Providers } from '../container.ts'
import { type InjectionToken, tokenToString } from '../types/token.ts'

export function validateProvider(input: {
  providers: Providers
  parent: ContainerImpl | null
  token: InjectionToken
  override: boolean
}): void {
  const { providers, parent, token, override } = input

  if (parent?.hasProvider(token) && !override) {
    throw new Error(
      `Cannot register token "${tokenToString(token)}": already exists in parent container. Use override option to replace.`,
    )
  }

  if (providers.has(token)) {
    throw new Error(
      `Cannot register token "${tokenToString(token)}": duplicate registration in same container.`,
    )
  }
}
