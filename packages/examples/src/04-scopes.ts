// packages/examples/src/04-scopes.ts

import { createContainer, type InferConstructorParams, inject } from 'pocket-di'

let singletonInstanceCount = 0
let transientInstanceCount = 0

// Default: Singleton (same instance every time)
class SingletonService {
  instanceId: number

  constructor() {
    this.instanceId = ++singletonInstanceCount
    console.log(`[SINGLETON] Created instance #${this.instanceId}`)
  }

  getId() {
    return this.instanceId
  }
}

// Transient: new instance every time
class TransientService {
  instanceId: number

  constructor() {
    this.instanceId = ++transientInstanceCount
    console.log(`[TRANSIENT] Created instance #${this.instanceId}`)
  }

  getId() {
    return this.instanceId
  }
}

class AppService {
  static [inject] = { singleton: SingletonService, transient: TransientService }

  constructor(deps: InferConstructorParams<typeof AppService>) {
    console.log('[APP] Singleton ID:', deps.singleton.getId())
    console.log('[APP] Transient ID:', deps.transient.getId())
  }
}

async function main() {
  console.log('=== Scopes Example ===\n')

  const container = createContainer({
    providers: [
      // Default scope: singleton
      SingletonService,

      // Explicitly specify transient scope
      {
        provide: TransientService,
        useClass: TransientService,
        scope: 'transient',
      },

      AppService,
    ],
  })

  console.log('--- First resolve ---')
  const singleton1 = await container.resolve(SingletonService)
  const transient1 = await container.resolve(TransientService)

  console.log('\n--- Second resolve ---')
  const singleton2 = await container.resolve(SingletonService)
  const transient2 = await container.resolve(TransientService)

  console.log('\n--- Comparison ---')
  console.log('Singleton same instance?', singleton1 === singleton2)
  console.log('Transient same instance?', transient1 === transient2)

  console.log('\n--- Resolving AppService ---')
  await container.resolve(AppService)

  await container.destroy()
}

void main()
