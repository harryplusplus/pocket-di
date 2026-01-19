import type {
  InjectDeclaration,
  InjectDeclarationItem,
} from './inject-declaration.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { inject } from './symbols.ts'

export type Dependencies<ID extends InjectDeclaration = InjectDeclaration> = {
  [K in keyof ID]: ID[K] extends InjectDeclarationItem<infer I> ? I : never
}

export type InferDependencies<IC extends InjectableConstructor> = IC extends {
  [inject]?: infer ID extends InjectDeclaration
}
  ? Dependencies<ID>
  : never
