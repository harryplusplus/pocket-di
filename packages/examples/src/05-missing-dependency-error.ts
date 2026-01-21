// packages/examples/src/05-missing-dependency-error.ts

import {
  createContainer,
  defineFactoryProvider,
  type InferConstructorParams,
  inject,
  token,
} from 'pocket-di'

// Define interfaces and tokens
interface IEmailService {
  send(to: string, message: string): void
}

interface IPaymentService {
  processPayment(amount: number): void
}

const EMAIL_SERVICE = token<IEmailService>('EMAIL_SERVICE')
const PAYMENT_SERVICE = token<IPaymentService>('PAYMENT_SERVICE')

// This service depends on PAYMENT_SERVICE
class OrderService {
  static [inject] = {
    email: EMAIL_SERVICE,
    payment: PAYMENT_SERVICE, // PAYMENT_SERVICE is NOT registered!
  }

  constructor(_deps: InferConstructorParams<typeof OrderService>) {
    console.log('OrderService created')
  }

  createOrder(orderId: string) {
    console.log(`Order ${orderId} created`)
  }
}

// Factory that depends on PAYMENT_SERVICE
const notificationProvider = defineFactoryProvider({
  provide: 'NOTIFICATION_SERVICE',
  inject: { payment: PAYMENT_SERVICE }, // PAYMENT_SERVICE is NOT registered!
  useFactory: (_deps) => {
    return { notify: (message: string) => console.log(message) }
  },
})

async function main() {
  console.log('=== Missing Dependency Error Example ===\n')

  console.log('--- Attempting to create container ---')
  console.log('OrderService depends on: EMAIL_SERVICE, PAYMENT_SERVICE')
  console.log('Only EMAIL_SERVICE is registered!\n')

  try {
    // This will throw an error at createContainer time
    // because OrderService declares PAYMENT_SERVICE as dependency
    // but PAYMENT_SERVICE is not registered
    const container = createContainer({
      providers: [
        // EMAIL_SERVICE is registered
        {
          provide: EMAIL_SERVICE,
          useFactory: () => ({
            send(to: string, message: string) {
              console.log(`[EMAIL] To: ${to}, Message: ${message}`)
            },
          }),
        },
        // PAYMENT_SERVICE is NOT registered!
        // OrderService depends on it, so container creation will fail
        OrderService,
      ],
    })

    await container.destroy()
  } catch (error) {
    console.error('✗ Error during container creation:')
    console.error('  ', error instanceof Error ? error.message : error)
    console.log(
      '\n💡 All dependencies must be registered before creating container!',
    )
  }

  console.log('\n--- Example with factory provider ---')
  try {
    const container = createContainer({
      providers: [
        // notificationProvider depends on PAYMENT_SERVICE which is not registered
        notificationProvider,
      ],
    })

    await container.destroy()
  } catch (error) {
    console.error('✗ Error during container creation:')
    console.error('  ', error instanceof Error ? error.message : error)
  }
}

void main()
