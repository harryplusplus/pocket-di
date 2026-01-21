import {
  createContainer,
  defineClassProvider,
  type InferDependencies,
  inject,
} from 'pocket-di'

// Dependency class.
class Foo {
  fooFoo() {
    console.log('[Foo] fooFoo()')
  }
}

/******************************************************************************
 * Infer types from a class to create a type-bound injection provider and token.
 ******************************************************************************/

// When using a plain string for provide, the type is inferred from the class
// provided to useClass.
const barProvider = defineClassProvider({ provide: 'bar', useClass: Foo })
/** type: ClassProvider<Foo, Foo, InjectDeclaration> */

// The type is bound to the token.
const barToken = barProvider.provide
/** type: InjectionToken<Foo> */

console.log('barToken:', barToken) // 'bar'

type BazDeps = InferDependencies<typeof Baz>
/** type: { bar: Foo } */

class Baz {
  // Define dependency injection using the type-bound token.
  static [inject] = { bar: barToken }

  constructor({ bar }: BazDeps) {
    console.log('[Baz] Constructor')

    // Use the dependency instance with type safety.
    bar.fooFoo()
  }
}

{
  const container = createContainer({ providers: [barProvider, Baz] })

  const bar = await container.resolve(barToken)
  bar.fooFoo() // [Foo] fooFoo()

  await container.resolve(Baz)
  // [Baz] Constructor
  // [Foo] fooFoo()

  await container.destroy()
}

/******************************************************************************
 * Validate the injected class type using a type-bound token.
 ******************************************************************************/

class Qux {
  fooFoo() {}
}

// When using a type-bound token, the type of the class provided to useClass is
// validated.
// The Qux class passes validation because it implements the interface
// { fooFoo(): void } of the Foo class.
const _validBarProvider = defineClassProvider({
  provide: barToken,
  useClass: Qux,
})
/** type: ClassProvider<Foo, Qux, InjectDeclaration> */

export class Quux {
  // no fooFoo() method
  // fooFoo() {}
}

// Type errors occur because you either want to infer the type by using a plain
// string for provide, or want the concrete class to satisfy the interface by
// using a type-bound token for provide.

// const _invalidBarProvider = defineClassProvider({
//   provide: barToken,
//   useClass: Quux,
// })

/**
 * No overload matches this call.
  Overload 1 of 2, '(provider: ClassProviderInput<Quux, InjectDeclaration>): 
    ClassProvider<Quux, Quux, InjectDeclaration>', gave the following error.
    Type 'InjectionToken<Foo>' is not assignable to type 'string | symbol'.
      Type 'InjectableConstructor<Foo, InjectDeclaration>' is not assignable to 
        type 'string | symbol'.
  Overload 2 of 2, '(provider: ClassProvider<Foo, Foo, InjectDeclaration>): 
    ClassProvider<Foo, Foo, InjectDeclaration>', gave the following error.
    Type 'typeof Quux' is not assignable to type 
      'InjectableConstructor<Foo, InjectDeclaration>'.
      Property 'fooFoo' is missing in type 'Quux' but required in type 
        'Foo'.ts(2769)
 */
