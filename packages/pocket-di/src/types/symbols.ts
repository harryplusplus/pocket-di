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
