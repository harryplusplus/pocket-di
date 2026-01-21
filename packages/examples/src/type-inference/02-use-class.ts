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
 * Redefine a class with a different name.
 ******************************************************************************/

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

const container = createContainer({ providers: [barProvider, Baz] })

const bar = await container.resolve(barToken)
bar.fooFoo() // [Foo] fooFoo()

await container.resolve(Baz)
// [Baz] Constructor
// [Foo] fooFoo()

await container.destroy()
