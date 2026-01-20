import {
  providerToDeclaration,
  type DependencyRecord,
  type DependencyTuple,
  type DependencyTupleOrRecord,
  type ProviderHasDependencies,
  type ProviderRegistry,
  type SingletonRegistry,
} from '../types/compositions.ts'
import { isTupleInjectDeclaration } from '../types/inject-declaration.ts'
import { resolveRecursiveAsync } from './resolve-recursive-async.ts'

export async function resolveDependenciesAsync(
  context: { singletonRegistry: SingletonRegistry },
  input: {
    providerRegistry: ProviderRegistry
    provider: ProviderHasDependencies
  },
): Promise<DependencyTupleOrRecord> {
  const { singletonRegistry } = context
  const { provider, providerRegistry } = input

  const declaration = providerToDeclaration(provider)
  if (isTupleInjectDeclaration(declaration)) {
    const dependencyTuple: DependencyTuple = []
    for (const item of declaration) {
      const instance = await resolveRecursiveAsync(
        { singletonRegistry },
        { token: item, providerRegistry },
      )

      dependencyTuple.push(instance)
    }

    return dependencyTuple
  }

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
