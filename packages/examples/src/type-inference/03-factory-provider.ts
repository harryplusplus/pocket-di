import { createContainer, defineFactoryProvider, token } from 'pocket-di'

// Dependency class.
class Foo {
  fooFoo() {
    console.log('[Foo] fooFoo()')
  }
}

/******************************************************************************
 * Infer types from a factory to create a type-bound injection provider and
 * token.
 ******************************************************************************/

const barProvider = defineFactoryProvider({
  // When using a plain string as the injection token, the type is inferred
  // from the useFactory return type.
  provide: 'bar',

  // Define the dependency declaration object.
  inject: { foo: Foo },

  useFactory: async ({ foo }) => {
    /* type: { foo: Foo } */

    const bar = {
      fooFoo: () => {
        console.log('[Bar] fooFoo()')
        foo.fooFoo()
      },
      close: () => {
        console.log('[Bar] close()')
      },
    }

    // Simulate async initialization.
    await Promise.resolve()

    return bar
  },

  // Called in container.destroy().
  preDestroy: (instance) => {
    instance.close()
  },
})

const barToken = barProvider.provide
/** type: TypedToken<{ fooFoo: () => void; close: () => void }> */

const container = createContainer({ providers: [barProvider, Foo] })

const bar = await container.resolve(barToken)
bar.fooFoo()
// [Bar] fooFoo()
// [Foo] fooFoo()

await container.destroy()
// [Bar] close()

/******************************************************************************
 * Validate the provided factory type using a type-bound token.
 ******************************************************************************/

interface Baz {
  bazBaz(): void
}

const _bazToken = token<Baz>('baz')
/** type: TypedToken<Baz> */

// When using an inferable token (typed token or class) in provide, the
// useFactory return type is validated.

// const bazProvider = defineFactoryProvider({
//   provide: _bazToken,
//   useFactory: () => {
//     // const baz: Baz = {
//     //   bazBaz: () => {
//     //     console.log('[Baz] bazBaz()')
//     //   },
//     // }
//     // return baz
//     return {}
//   },
// })

/*
No overload matches this call.
  Overload 1 of 2, '(provider: FactoryProviderInput<PlainToken, {}, {}, 
  InjectDeclaration>): FactoryProvider<TypedToken<{}>, {}, {}, 
  InjectDeclaration>', gave the following error.
    Type 'TypedToken<Baz>' is not assignable to type 'PlainToken'.
  Overload 2 of 2, '(provider: FactoryProviderInput<TypedToken<Baz>, Baz, Baz, 
  InjectDeclaration>): FactoryProvider<TypedToken<Baz>, Baz, Baz, 
  InjectDeclaration>', gave the following error.
    Type '() => {}' is not assignable to type 
    '((dependencies: Dependencies<InjectDeclaration>) => MaybePromise<Baz>) | 
    ((dependencies: Dependencies<InjectDeclaration>) => MaybePromise<...>)'.
      Type '() => {}' is not assignable to type 
      '(dependencies: Dependencies<InjectDeclaration>) => MaybePromise<Baz>'.
        Type '{}' is not assignable to type 'MaybePromise<Baz>'.ts(2769)
*/
