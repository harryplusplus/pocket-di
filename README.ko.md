# pocket-di

빌드리스 타입스크립트를 위한 간단한 DI 라이브러리.

[English](https://github.com/harryplusplus/pocket-di) | **한국어**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [빌드리스 타입스크립트란 무엇인가요?](#%EB%B9%8C%EB%93%9C%EB%A6%AC%EC%8A%A4-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80%EC%9A%94)
- [왜 다른 DI 라이브러리를 사용하지 않고, 신규 DI 라이브러리를 만들었나요?](#%EC%99%9C-%EB%8B%A4%EB%A5%B8-di-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%A7%80-%EC%95%8A%EA%B3%A0-%EC%8B%A0%EA%B7%9C-di-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A5%BC-%EB%A7%8C%EB%93%A4%EC%97%88%EB%82%98%EC%9A%94)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 빌드리스 타입스크립트란 무엇인가요?

빌드리스 타입스크립트는 자바스크립트 파일을 생성을 건너뛰고 런타임(Node.js, Bun, Deno)에서 타입스크립트를 실행하는 것을 의미합니다.
장점은 빌드 시간 감소 및 트랜스파일링을 거치지 않는 것에서 오는 불필요한 복잡성의 감소입니다.
이 단순성은 빠른 빌드 및 배포가 중요한 미션에서 빛을 발합니다.

## 왜 다른 DI 라이브러리를 사용하지 않고, 신규 DI 라이브러리를 만들었나요?

다른 DI 라이브러리는 크게 3가지 부류로 나뉩니다.
타입스크립트 legacy decorators를 사용하는 것, 타입스크립트 legacy decorators를 사용하지 않는 자바스크립트 라이브러리, 그리고 Effect가 있습니다.

타입스크립트 legacy decorators를 사용하는 대표적인 라이브러리는 Nest.js, tsyringe 등이 있습니다.
대부분의 라이브러리들이 여기에 속합니다.
문제는 런타임이 legacy decorators를 이해하지 못한다는 것입니다.
그래서 다양한 트랜스파일러를 사용해 런타임이 이해할 수 있는 자바스크립트 파일을 변환 및 생성한 후 실행합니다.

프론트엔드의 경우는 트랜스파일 과정을 통해 번들링, 미니피케이션, 트리셰이킹 등을 수행할 수 있다는 장점이 있습니다.
하지만 백엔드의 경우 소스 코드를 변형시키는 트랜스파일은 불필요한 복잡함을 추가해 안정성과 예측성을 훼손시킵니다.
예를 들어 다음과 같습니다.
호출 스택의 경우, 트랜스파일한 자바스크립트 기준이며, 소스맵을 통해 매핑해줘야 합니다.
클래스 이름의 경우, 옵션에 따라 변경되기도 합니다.
전역 객체 특히 스키마 객체의 경우, 번들링에 따라 순환 객체 참조로 변경되어 실행이 불가능하기도 합니다.
이런 문제는 스크립트 언어를 사용하는 장점을 완전히 삭제합니다.
스크립트 언어를 사용하는 이유는 개발 편의성도 있지만, 소스 코드가 곧 실행 코드이기 때문에 문제 발생시 추적을 용이하게 만듭니다.
대표적으로 파이썬이 있습니다.
반대로 컴파일 과정을 거쳐 추가적인 최적화로 성능을 향상시킬 수 있는 언어들도 있습니다.
대표적으로 자바가 있습니다.

타입스크립트를 트랜스파일 과정없이 실행할 수 있는 것을 핵심 가치로 지닌 Deno, Bun도 있습니다.
이러한 런타임의 등장은 타입스크립트의 트랜스파일 과정이 문제이며 개선 대상이라는 것을 상기시킵니다.
그리고 타입스크립트 5.8에 [erasableSyntaxOnly](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html#the---erasablesyntaxonly-option)만 사용하는 기능이 추가됐습니다.
결국에 Node.js도 [Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively) 기능이 추가됐습니다.

간단한 백엔드 어플리케이션의 경우 수동 의존성 주입이 좋습니다.
수동 의존성 주입은 유지보수성을 크게 향상시킵니다.
하지만 어플리케이션 내에 10개 이상의 서비스가 생기거나, 생성자를 통해 5개 이상의 의존성을 주입하기 시작하면, 이 복잡성도 관리대상이 됩니다.
그런 경우에 DI 라이브러리를 사용하는 것이 좋습니다.

자바스크립트 DI 라이브러리는 타입 및 인터페이스 기능이 부족해 타입스크립트를 사용하는 장점을 퇴색시킵니다.

Effect는 함수형 프로그래밍 방식 중 더 특별한 경우입니다.
Nest.js와 같은 프로그래밍 방식과 사뭇 다르기 때문에 도입유무에 팀의 조율이 필요한 라이브러리입니다.
