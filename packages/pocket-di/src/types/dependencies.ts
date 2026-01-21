import type {
  InjectDeclaration,
  InjectDeclarationItem,
} from './inject-declaration.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { inject } from './symbols.ts'

export type Dependencies<D extends InjectDeclaration = InjectDeclaration> = {
  [K in keyof D]: D[K] extends InjectDeclarationItem<infer I> ? I : never
}

export type InferConstructorParams<IC extends InjectableConstructor> =
  IC extends { [inject]?: infer D extends InjectDeclaration }
    ? Dependencies<D>
    : never
