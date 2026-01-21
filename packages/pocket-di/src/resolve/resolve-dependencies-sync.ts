import {
  type DependencyRecord,
  type ProviderHasDependencies,
  type ProviderRegistry,
  providerToDeclaration,
  type SingletonRegistry,
} from '../types/compositions.ts'
import { resolveRecursiveSync } from './resolve-recursive-sync.ts'

export function resolveDependenciesSync(
  context: { singletonRegistry: SingletonRegistry },
  input: {
    providerRegistry: ProviderRegistry
    provider: ProviderHasDependencies
  },
): DependencyRecord {
  const { singletonRegistry } = context
  const { provider, providerRegistry } = input

  const declaration = providerToDeclaration(provider)
  const dependencyRecord: DependencyRecord = {}
  for (const [name, item] of Object.entries(declaration)) {
    const instance = resolveRecursiveSync(
      { singletonRegistry },
      { token: item, providerRegistry },
    )

    dependencyRecord[name] = instance
  }

  return dependencyRecord
}
