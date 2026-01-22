//#region Internals

const NAMESPACE = 'pocket-di'

function desc(x: string): string {
  return `${NAMESPACE}:${x}`
}

//#endregion Internal

export const inject: unique symbol = Symbol(desc('inject'))

export const postConstruct: unique symbol = Symbol(desc('postConstruct'))

export const preDestroy: unique symbol = Symbol(desc('preDestroy'))
