import { createContainer, type InferDependencies, inject } from 'pocket-di'

// dependency class
class Foo {
  fooFoo() {}
}

class Bar {
  // inject symbol을 사용해서 static variable에 { $name: $type, ... } 형태로
  // dependency object를 정의
  static [inject] = { foo: Foo }

  // InferDependencies<typeof $self>을 사용해 class의 constructor parameter를
  // inject symbol로부터 추론
  constructor(dependencies: InferDependencies<typeof Bar>) {
    // type safely dependency instance를 사용
    dependencies.foo.fooFoo()
  }
}

// InferDependencies가 장황할 경우 type alias를 정의
type BazDeps = InferDependencies<typeof Baz>

class Baz {
  static [inject] = { foo: Foo }

  // type alias를 사용해 class의 constructor parameter를 inject symbol로부터 추론
  constructor(deps: BazDeps) {
    // type safely dependency instance를 사용
    deps.foo.fooFoo()
  }
}

class Qux {
  static [inject] = { foo: Foo }

  // object destructuring을 사용해 class의 constructor parameter의 이름 참조없이 직접
  // dependency instance에 접근
  constructor({ foo }: InferDependencies<typeof Qux>) {
    foo.fooFoo()
  }
}

type QuuxDeps = InferDependencies<typeof Quux>

class Quux {
  static [inject] = { foo: Foo }

  // type alias와 object destructuring을 사용해 dependency instance에 접근
  constructor({ foo }: QuuxDeps) {
    foo.fooFoo()
  }
}

// 위 정의한 injectable class들을 di container에 등록하면 dependency 정의를 참조해
// resolution 가능 유무를 검증함 (resolution (instance 생성)을 하지는 않음.)
createContainer({ providers: [Bar, Baz, Qux, Quux] })
