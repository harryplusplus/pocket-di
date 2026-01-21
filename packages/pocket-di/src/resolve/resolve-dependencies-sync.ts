import {
  type DependencyRecord,
  type DependencyTuple,
  type DependencyTupleOrRecord,
  type ProviderHasDependencies,
  type ProviderRegistry,
  providerToDeclaration,
  type SingletonRegistry,
} from '../types/compositions.ts'
import { isTupleDependencyDeclaration } from '../types/dependency-declaration.ts'
import { resolveRecursiveSync } from './resolve-recursive-sync.ts'

export function resolveDependenciesSync(
  context: { singletonRegistry: SingletonRegistry },
  input: {
    providerRegistry: ProviderRegistry
    provider: ProviderHasDependencies
  },
): DependencyTupleOrRecord {
  const { singletonRegistry } = context
  const { provider, providerRegistry } = input

  const declaration = providerToDeclaration(provider)
  if (isTupleDependencyDeclaration(declaration)) {
    const dependencyTuple: DependencyTuple = []
    for (const item of declaration) {
      const instance = resolveRecursiveSync(
        { singletonRegistry },
        { token: item, providerRegistry },
      )

      dependencyTuple.push(instance)
    }

    return dependencyTuple
  }

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
