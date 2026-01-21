import {
  defineClassProvider,
  type InferDependencies,
  inject,
  token,
} from 'pocket-di'

// Dependency interface.
interface Foo {
  fooFoo(): void
}

// Bind the interface to an injection token.
const fooToken = token<Foo>('foo')
/** type: TypedToken<Foo> */

type BarDeps = InferDependencies<typeof Bar>

export class Bar {
  static [inject] = { foo: fooToken }

  constructor({ foo }: BarDeps) {
    foo.fooFoo()
  }
}

// A class compatible with the Foo interface.
class RealFoo {
  fooFoo() {}
}

export const fooProvider = defineClassProvider({
  provide: fooToken,
  useClass: RealFoo,
})
/** type: ClassProvider<Foo, RealFoo> */

export class NoFoo {
  // No fooFoo() method.
}

/**
 * The NoFoo class is not compatible with the Foo interface of fooToken,
 * resulting in a type error.
 */

// defineClassProvider({ provide: fooToken, useClass: NoFoo })

/**
 * Type 'typeof NoFoo' is not assignable to type
 * 'InjectableConstructor<Foo, InjectDeclaration>'.
 * Property 'fooFoo' is missing in type 'NoFoo' but required in type
 * 'Foo'.ts(2322)
 */
