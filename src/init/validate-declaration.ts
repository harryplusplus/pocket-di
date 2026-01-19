import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import {
  type InjectDeclaration,
  isTupleInjectDeclaration,
} from '../types/inject-declaration.ts'
import type { InjectionToken } from '../types/token.ts'
import type { FindProvider } from './find-provider.ts'
import { validateDeclarationItem } from './validate-declaration-item.ts'
import { validateDeclarationName } from './validate-declaration-name.ts'

export function validateDeclaration(input: {
  token: InjectionToken
  declaration: InjectDeclaration
  findProvider: FindProvider
  checker: CircularDependencyChecker
  className: string | null
}): void {
  const { token, declaration, findProvider, checker, className } = input

  if (isTupleInjectDeclaration(declaration)) {
    for (const item of declaration) {
      validateDeclarationItem({
        item,
        findProvider,
        checker,
        token,
        className,
      })
    }

    return
  }

  for (const [name, item] of Object.entries(declaration)) {
    validateDeclarationName({
      token,
      className,
      name,
    })

    validateDeclarationItem({
      item,
      findProvider,
      checker,
      token,
      className,
    })
  }
}
