/**
 * @file pocket-di에서 사용할 symbol들을 정의합니다.
 */

//#region Internals

const NAMESPACE = 'pocket-di'

function desc(x: string): string {
  return `${NAMESPACE}:${x}`
}

//#endregion Internals

export const inject: unique symbol = Symbol(desc('inject'))

export const postConstruct: unique symbol = Symbol(desc('postConstruct'))

export const preDestroy: unique symbol = Symbol(desc('preDestroy'))

export const type: unique symbol = Symbol(desc('type'))
