import type { ContainerImpl } from '../container.ts'
import { destroyChildren } from './destroy-children.ts'
import { destroySingletonRegistry } from './destroy-singleton-registry.ts'

export async function destroyContainer(context: {
  container: ContainerImpl
}): Promise<void> {
  const { container } = context
  const { children, singletonRegistry, providerRegistry } = container

  await destroyChildren({ children })
  await destroySingletonRegistry({ singletonRegistry }, { providerRegistry })

  providerRegistry.clear()
}
