import { type InferConstructorParams, inject } from 'pocket-di'

// dependency class
class Foo {
  fooFoo() {}
}

class Bar {
  // inject symbol을 사용해서 static variable에 [$type, ...] 형태로 dependency tuple
  // ($array as const)을 정의
  // NOTE: dependency object 형태와 비교했을 때 name을 지정할 필요가 없다는 것이 장점
  static [inject] = [Foo] as const

  // InferConstructorParams<typeof $self>을 사용해 class의 constructor parameter를
  // inject symbol로부터 추론
  constructor(dependencies: InferConstructorParams<typeof Bar>) {
    // type safely dependency instance를 사용
    // NOTE: dependency object 형태와 비교했을 때 name이 없기 때문에 index로 접근하는 것이
    // NOTE: 단점 (하지만 밑의 tuple destructuring을 사용하면 간소화할 수 있음)
    dependencies[0].fooFoo()
  }
}

// InferDependencies가 장황할 경우 type alias를 정의
type BazDeps = InferConstructorParams<typeof Baz>

class Baz {
  static [inject] = [Foo] as const

  // type alias를 사용해 class의 constructor parameter를 inject symbol로부터 추론
  constructor(deps: BazDeps) {
    // type safely dependency instance를 사용
    deps[0].fooFoo()
  }
}

class Qux {
  static [inject] = [Foo] as const

  // tuple destructuring을 사용해 class의 constructor parameter의 이름 참조없이 직접
  // dependency instance에 접근
  constructor([foo]: InferConstructorParams<typeof Qux>) {
    foo.fooFoo()
  }
}

type QuuxDeps = InferConstructorParams<typeof Quux>

class Quux {
  static [inject] = [Foo] as const

  // type alias와 tuple destructuring을 사용해 dependency instance에 접근
  // NOTE: dependency object 형태와 비교했을 때 정의시 name을 지정하지 않아도 되고 사용 시점에
  // NOTE: 지정할 수 있음
  // NOTE: 하지만 일반 문자열 타입이나 instance.get(key)와 같은 일반적인 interface의
  // NOTE: dependency instance일 경우 이름이 없기 때문에 실수의 여지가 큼
  constructor([foo]: QuuxDeps) {
    foo.fooFoo()
  }
}
