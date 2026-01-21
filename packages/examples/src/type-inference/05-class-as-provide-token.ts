// packages/examples/src/type-inference/05-class-as-provide-token.ts

import {
  createContainer,
  defineClassProvider,
  type InferConstructorParams,
  inject,
} from 'pocket-di'

class Foo {
  fooFoo() {}
}

class Bar {
  fooFoo() {
    console.log('[Bar] fooFoo()')
  }
  barBar() {}
}

const fooProvider = defineClassProvider({ provide: Foo, useClass: Bar })
/** type: ClassProvider<typeof Foo, Foo, Bar, DependencyDeclaration> */

const fooToken = fooProvider.provide
/** type: typeof Foo */

type BazParams = InferConstructorParams<typeof Baz>

class Baz {
  static [inject] = { foo: fooToken }

  constructor({ foo }: BazParams) {
    console.log(`[Baz] Constructor`)
    foo.fooFoo()
  }
}

const container = createContainer({ providers: [fooProvider, Baz] })

await container.resolve(Baz)
// [Baz] Constructor
// [Foo] fooFoo()

await container.destroy()
