import type { ProviderRegistry } from '../types/compositions.ts'
import { type InjectionToken, tokenToString } from '../types/token.ts'

export function validateProvider(input: {
  providerRegistry: ProviderRegistry
  token: InjectionToken
  override: boolean
}): void {
  const { providerRegistry, token, override } = input

  const parentFound = providerRegistry.parent?.find(token)
  if (parentFound && !override) {
    throw new Error(
      `Cannot register token "${tokenToString(token)}": already exists in parent container. Use override option to replace.`,
    )
  }

  const localFound = providerRegistry.find(token, { localOnly: true })
  if (localFound) {
    throw new Error(
      `Cannot register token "${tokenToString(token)}": duplicate registration in same container.`,
    )
  }
}
