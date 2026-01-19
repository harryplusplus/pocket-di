import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { InjectDeclarationItem } from '../types/inject-declaration.ts'
import { type InjectionToken, tokenToString } from '../types/token.ts'
import type { FindProvider } from './find-provider.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

export function validateDeclarationItem(input: {
  item: InjectDeclarationItem
  findProvider: FindProvider
  token: InjectionToken
  className: string | null
  checker: CircularDependencyChecker
}): void {
  const { item, findProvider, checker, token, className } = input

  const provider = findProvider(item)
  if (!provider) {
    const tokenName = tokenToString(token)
    const classInfo = className ? ` (class "${className}")` : ''
    const dependencyToken = tokenToString(item)

    throw new Error(
      `Cannot register token "${tokenName}"${classInfo}: dependency "${dependencyToken}" is not registered.`,
    )
  }

  checker.push(item)

  validateDeclarationRecursive({
    provider,
    findProvider,
    checker,
  })
}
