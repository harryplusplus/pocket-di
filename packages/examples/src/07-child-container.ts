// packages/examples/src/07-child-container.ts

import { createContainer, type InferConstructorParams, inject } from 'pocket-di'

// Shared services (registered in parent container)
class DatabaseService {
  query(sql: string) {
    console.log(`[DB] Query: ${sql}`)
    return { rows: [] }
  }
}

class ConfigService {
  get(key: string) {
    return `config-${key}`
  }
}

// Request-scoped service (registered in child container)
class RequestContext {
  readonly requestId

  constructor(requestId: string) {
    this.requestId = requestId
    console.log(`[REQUEST] Context created for request: ${requestId}`)
  }

  getRequestId() {
    return this.requestId
  }
}

// Service that uses both shared and request-scoped dependencies
class RequestHandler {
  static [inject] = {
    db: DatabaseService,
    config: ConfigService,
    context: RequestContext,
  }

  constructor(deps: InferConstructorParams<typeof RequestHandler>) {
    console.log(
      `[HANDLER] Handler created for request: ${deps.context.getRequestId()}`,
    )
  }

  handle() {
    console.log('[HANDLER] Processing request...')
  }
}

async function main() {
  console.log('=== Child Container Example ===\n')

  // Global container with shared services
  console.log('--- Creating parent container ---')
  const appContainer = createContainer({
    providers: [DatabaseService, ConfigService],
  })

  // Pre-initialize shared singletons
  await appContainer.resolve(DatabaseService)
  await appContainer.resolve(ConfigService)
  console.log('✓ Shared services initialized\n')

  // Simulate HTTP request handler
  console.log('--- Handling Request #1 ---')
  const request1Container = appContainer.createChild({
    providers: [
      { provide: RequestContext, useValue: new RequestContext('req-001') },
      RequestHandler,
    ],
  })

  const handler1 = await request1Container.resolve(RequestHandler)
  handler1.handle()

  // Another request with different context
  console.log('\n--- Handling Request #2 ---')
  const request2Container = appContainer.createChild({
    providers: [
      { provide: RequestContext, useValue: new RequestContext('req-002') },
      RequestHandler,
    ],
  })

  const handler2 = await request2Container.resolve(RequestHandler)
  handler2.handle()

  // Verify shared services are the same instance
  console.log('\n--- Verifying shared services ---')
  const db1 = await request1Container.resolve(DatabaseService)
  const db2 = await request2Container.resolve(DatabaseService)
  console.log('Same DatabaseService instance?', db1 === db2)

  // Clean up
  await request1Container.destroy()
  await request2Container.destroy()
  await appContainer.destroy()
}

void main()
