import type {
  DependencyDeclaration,
  DependencyDeclarationItem,
} from './dependency-declaration.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { inject } from './symbols.ts'

export type Dependencies<
  D extends DependencyDeclaration = DependencyDeclaration,
> = {
  [K in keyof D]: D[K] extends DependencyDeclarationItem<infer I> ? I : never
}

export type InferConstructorParams<IC extends InjectableConstructor> =
  IC extends { [inject]?: infer D extends DependencyDeclaration }
    ? Dependencies<D>
    : never
