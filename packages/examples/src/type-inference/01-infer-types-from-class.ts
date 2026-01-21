import { createContainer, type InferConstructorParams, inject } from 'pocket-di'

// Dependency class.
class Foo {
  fooFoo() {
    console.log('[Foo] fooFoo()')
  }
}

/******************************************************************************
 * Use class as a injection token and use it in a class using object
 * destructuring.
 ******************************************************************************/

// Infer dependency types from the static inject declaration.
type BarDeps = InferConstructorParams<typeof Bar>
/** type: { foo: Foo } */

class Bar {
  // Define a static inject symbol variable as a {<name>:<class>} declaration
  // object.
  static [inject] = { foo: Foo }

  constructor({ foo }: BarDeps) {
    console.log('[Bar] Constructor')

    // Use the dependency object type safely.
    foo.fooFoo()
  }
}

/******************************************************************************
 * Use class as a injection token and use it in a class as a property.
 ******************************************************************************/

// Infer dependency types from the static inject declaration as a Context for
// the instance.
type BazContext = InferConstructorParams<typeof Baz>
/** type: { foo: Foo } */

class Baz {
  static [inject] = { foo: Foo }

  c: BazContext

  constructor(c: BazContext) {
    // Assign to a property without using object destructuring.
    this.c = c
  }

  fooFoo() {
    console.log('[Baz] fooFoo')

    // Use the dependency object type safely.
    this.c.foo.fooFoo()
  }
}

const container = createContainer({ providers: [Foo, Bar, Baz] })

await container.resolve(Bar)
// [Bar] Constructor
// [Foo] fooFoo()

const baz = await container.resolve(Baz)
baz.fooFoo()
// [Baz] fooFoo
// [Foo] fooFoo()

await container.destroy()
