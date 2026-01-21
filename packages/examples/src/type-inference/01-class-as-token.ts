import { type InferDependencies, inject } from 'pocket-di'

// Dependency class.
class Foo {
  fooFoo() {}
}

// Infer dependency types from the static inject declaration.
type BarDeps = InferDependencies<typeof Bar>
/** type: { foo: Foo } */

export class Bar {
  // Define a static inject symbol variable as a {<name>:<class>} declaration
  // object.
  static [inject] = { foo: Foo }

  constructor({ foo }: BarDeps) {
    // Use the dependency object type safely.
    foo.fooFoo()
  }
}

// Infer dependency types from the static inject declaration as a Context for
// the instance.
type BazContext = InferDependencies<typeof Baz>
/** type: { foo: Foo } */

export class Baz {
  static [inject] = { foo: Foo }

  c: BazContext

  constructor(c: BazContext) {
    // Assign to a property without using object destructuring.
    this.c = c
  }

  fooFoo() {
    // Use the dependency object type safely.
    this.c.foo.fooFoo()
  }
}
