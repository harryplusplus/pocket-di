import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import { type InjectionToken } from '../types/token.ts'
import { resolveDependenciesSync } from './resolve-dependencies-sync.ts'
import { resolveInstanceSync } from './resolve-instance-sync.ts'
import { resolveInstanceOrProvider } from './resolve-singleton-or-value.ts'
import { updateSingletonRegistry } from './update-singleton-registry.ts'

export function resolveRecursiveSync(
  context: { singletonRegistry: SingletonRegistry },
  input: { providerRegistry: ProviderRegistry; token: InjectionToken },
): Injectable {
  const { singletonRegistry } = context
  const { token, providerRegistry } = input

  const output = resolveInstanceOrProvider({
    singletonRegistry,
    providerRegistry,
    token,
  })

  if (output.kind === 'instance') {
    return output.instance
  }

  const { provider } = output

  const dependencies = resolveDependenciesSync(
    { singletonRegistry },
    { providerRegistry, provider },
  )

  const instance = resolveInstanceSync({ token, provider, dependencies })

  updateSingletonRegistry({ singletonRegistry }, { token, provider, instance })

  return instance
}
