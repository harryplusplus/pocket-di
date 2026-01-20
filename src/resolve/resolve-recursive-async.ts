import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import { type InjectionToken } from '../types/token.ts'
import { resolveDependenciesAsync } from './resolve-dependencies-async.ts'
import { resolveInstanceAsync } from './resolve-instance-async.ts'
import { resolveInstanceOrProvider } from './resolve-singleton-or-value.ts'
import { updateSingletonRegistry } from './update-singleton-registry.ts'

export async function resolveRecursiveAsync(
  context: { singletonRegistry: SingletonRegistry },
  input: { providerRegistry: ProviderRegistry; token: InjectionToken },
): Promise<Injectable> {
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

  const dependencies = await resolveDependenciesAsync(
    { singletonRegistry },
    { providerRegistry, provider },
  )

  const instance = await resolveInstanceAsync({ provider, dependencies })

  updateSingletonRegistry({ singletonRegistry }, { token, provider, instance })

  return instance
}
