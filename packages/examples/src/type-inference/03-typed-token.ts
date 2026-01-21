import {
  defineClassProvider,
  type InferDependencies,
  inject,
  token,
} from 'pocket-di'

interface Foo {
  fooFoo(): void
}

// injection token 정의시 $type을 binging함
const fooToken = token<Foo>('foo')
/** type: TypedToken<Foo> */

type BarDeps = InferDependencies<typeof Bar>
/** type: { foo: Foo } */

class Bar {
  // static inject symbol 정의시 { $name: $token, ... } 형태로 정의
  static [inject] = { foo: fooToken }

  constructor({ foo }: BarDeps) {
    // type safely dependency instance를 사용
    foo.fooFoo()
  }
}

//////////////////////////////

class RealFoo {
  fooFoo() {}
}

const a = defineClassProvider({ provide: fooToken, useClass: RealFoo })
/** type: classProvider<Foo, RealFoo> */
