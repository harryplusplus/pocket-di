import {
  type DependencyRecord,
  type ProviderHasDependencies,
  type ProviderRegistry,
  providerToDeclaration,
  type SingletonRegistry,
} from '../types/compositions.ts'
import { resolveRecursiveAsync } from './resolve-recursive-async.ts'

export async function resolveDependenciesAsync(
  context: { singletonRegistry: SingletonRegistry },
  input: {
    providerRegistry: ProviderRegistry
    provider: ProviderHasDependencies
  },
): Promise<DependencyRecord> {
  const { singletonRegistry } = context
  const { provider, providerRegistry } = input

  const declaration = providerToDeclaration(provider)
  const dependencyRecord: DependencyRecord = {}
  for (const [name, item] of Object.entries(declaration)) {
    const instance = await resolveRecursiveAsync(
      { singletonRegistry },
      { token: item, providerRegistry },
    )

    dependencyRecord[name] = instance
  }

  return dependencyRecord
}
