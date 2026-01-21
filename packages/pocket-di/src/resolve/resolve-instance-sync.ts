import type {
  DependencyRecord,
  ProviderHasDependencies,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import { isPostConstructable } from '../types/lifecycle-events.ts'
import { isClassProvider } from '../types/provider.ts'
import { postConstruct } from '../types/symbols.ts'
import { type InjectionToken, tokenToString } from '../types/token.ts'

export function resolveInstanceSync(input: {
  token: InjectionToken
  provider: ProviderHasDependencies
  dependencies: DependencyRecord
}): Injectable {
  const { token, provider, dependencies } = input

  if (isClassProvider(provider)) {
    const { useClass } = provider
    const instance = new useClass(dependencies)

    if (isPostConstructable(instance)) {
      const output = instance[postConstruct]()
      if (output instanceof Promise) {
        throw new Error(
          `Cannot resolve "${tokenToString(token)}" (${useClass.name}) synchronously: postConstruct returns Promise.`,
        )
      }
    }

    return instance
  }

  const { useFactory } = provider
  const instance = useFactory(dependencies)
  if (instance instanceof Promise) {
    throw new Error(
      `Cannot resolve "${tokenToString(token)}" synchronously: useFactory returns Promise.`,
    )
  }

  return instance
}
