import type { ContainerImpl } from '../container-impl.ts'
import { destroyChildren } from './destroy-children.ts'
import { destroySingletonRegistry } from './destroy-singleton-registry.ts'

export async function destroyContainer(context: {
  container: ContainerImpl
}): Promise<void> {
  const { container } = context
  const { children, singletons, providers } = container

  await destroyChildren({ children })
  await destroySingletonRegistry({ singletons }, { providers })

  providers.clear()
}
