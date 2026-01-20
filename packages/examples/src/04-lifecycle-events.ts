// packages/examples/src/04-lifecycle-events.ts

import {
  createContainer,
  defineProvider,
  postConstruct,
  type PostConstructable,
  preDestroy,
  type PreDestroyable,
  token,
} from 'pocket-di'

// Class-based lifecycle - implements interfaces and symbol methods
class DatabaseConnection implements PostConstructable, PreDestroyable {
  private connected = false

  // postConstruct - called after instance creation
  async [postConstruct]() {
    console.log('[DB] Connecting to database...')
    await new Promise((resolve) => setTimeout(resolve, 100))
    this.connected = true
    console.log('[DB] Connected!')
  }

  // preDestroy - called when container is destroyed
  async [preDestroy]() {
    console.log('[DB] Disconnecting...')
    await new Promise((resolve) => setTimeout(resolve, 100))
    this.connected = false
    console.log('[DB] Disconnected!')
  }

  query(sql: string) {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    console.log(`[DB] Query: ${sql}`)
  }
}

class CacheService implements PostConstructable, PreDestroyable {
  [postConstruct]() {
    console.log('[CACHE] Initializing cache...')
    console.log('[CACHE] Ready!')
  }

  [preDestroy]() {
    console.log('[CACHE] Clearing cache...')
    console.log('[CACHE] Cleared!')
  }

  set(key: string, value: string) {
    console.log(`[CACHE] Set ${key} with value ${value}`)
  }
}

// useFactory-style preDestroy with typed token
interface ILogger {
  log(message: string): void
  close(): void
}

const LOGGER_TOKEN = token<ILogger>('LOGGER')

// Define provider outside container (token type is inferred from provide)
const loggerProvider = defineProvider({
  provide: LOGGER_TOKEN,
  useFactory: () => {
    console.log('[LOGGER] Creating logger')
    return {
      log(message: string) {
        console.log(`[LOGGER] ${message}`)
      },
      close() {
        console.log('[LOGGER] Closing logger')
      },
    }
  },
  // preDestroy callback
  preDestroy: (logger) => {
    logger.close()
  },
})

async function main() {
  console.log('=== Lifecycle Events Example ===\n')

  const container = createContainer({
    providers: [DatabaseConnection, CacheService, loggerProvider],
  })

  console.log('--- Resolving services (postConstruct will be called) ---')
  const db = await container.resolve(DatabaseConnection)
  const cache = await container.resolve(CacheService)
  const logger = await container.resolve(LOGGER_TOKEN)

  console.log('\n--- Using services ---')
  db.query('SELECT * FROM users')
  cache.set('key1', 'value1')
  logger.log('Application running')

  console.log('\n--- Destroying container (preDestroy will be called) ---')
  await container.destroy()
}

void main()
