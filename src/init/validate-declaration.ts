import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import {
  type InjectDeclaration,
  isTupleInjectDeclaration,
} from '../types/inject-declaration.ts'
import type { InjectionToken } from '../types/token.ts'
import { validateDeclarationItem } from './validate-declaration-item.ts'
import { validateDeclarationName } from './validate-declaration-name.ts'

export function validateDeclaration(input: {
  token: InjectionToken
  declaration: InjectDeclaration
  providerRegistry: ProviderRegistry
  checker: CircularDependencyChecker
  className: string | null
}): void {
  const { token, declaration, providerRegistry, checker, className } = input

  if (isTupleInjectDeclaration(declaration)) {
    for (const item of declaration) {
      validateDeclarationItem({
        item,
        providerRegistry,
        checker,
        token,
        className,
      })
    }

    return
  }

  for (const [name, item] of Object.entries(declaration)) {
    validateDeclarationName({ token, className, name })

    validateDeclarationItem({
      item,
      providerRegistry,
      checker,
      token,
      className,
    })
  }
}
