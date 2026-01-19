import { type InjectionToken, tokenToString } from '../types/token.ts'

export function validateDeclarationName(input: {
  token: InjectionToken
  className: string | null
  name: string
}): void {
  const { token, className, name } = input

  if (
    !name ||
    name === '__proto__' ||
    name === 'constructor' ||
    name === 'prototype'
  ) {
    const tokenName = tokenToString(token)
    const classInfo = className ? ` (class "${className}")` : ''

    throw new Error(
      `Cannot register token "${tokenName}"${classInfo}: invalid dependency property name "${name}".`,
    )
  }
}
