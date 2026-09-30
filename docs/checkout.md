# Checkout y pagos

Diseño del checkout de `jb-store`: entidades en Laravel, rutas en React Router 7 e integración
con pasarelas de pago (Stripe, PayPal o una local). Complementa [`cart.md`](./cart.md) y
[`react-router-forms-modals.md`](./react-router-forms-modals.md).

---

## 0. Principios (lo que NO se negocia)

1. **El webhook es la fuente de verdad del pago.** La pantalla de "éxito" NO confirma nada: el usuario puede cerrar la pestaña, perder la conexión o falsear la URL.
2. **El precio lo calcula SIEMPRE el backend.** Nunca se aceptan montos ni precios del cliente.
3. **La orden congela los datos** (nombre, precio, variante, dirección). Si mañana cambia el precio del producto, la orden no cambia.
4. **Idempotencia en todo:** doble click, reintentos de red y webhooks duplicados no pueden crear dos órdenes ni cobrar dos veces. La BD lo hace cumplir con índices únicos (ver §6).
5. **Las claves secretas viven solo en Laravel.** RR nunca ve `STRIPE_SECRET` ni `PAYPAL_SECRET`.
6. **Pagos por redirect (páginas alojadas por la pasarela)** antes que formularios de tarjeta propios: el cumplimiento PCI lo carga la pasarela.

---

## 1. ⚠️ Elegir pasarela: el país importa

| Pasarela | Comercio en Ecuador | Nota |
|---|---|---|
| **Stripe** | ❌ No disponible (verificar en stripe.com/global) | Solo sirve si la empresa se constituye en un país soportado (EE. UU. vía Stripe Atlas, por ejemplo) |
| **PayPal** | ✅ Disponible (verificar las condiciones de retiro de fondos) | Muy conocido, comisiones altas |
| **Locales** (Payphone, Datafast, Kushki, Nuvei/Paymentez) | ✅ | Tarjetas locales, diferidos, cuotas; suelen convertir mejor en el mercado local |

**Consecuencia de diseño:** el dominio NO puede depender de Stripe. Se usa un **puerto** (`PaymentGateway`)
y un **adaptador** por pasarela (arquitectura hexagonal). Hoy Stripe en modo test para desarrollar;
mañana Payphone o PayPal en producción, **sin tocar el checkout**.

---

## 2. Entidades (Laravel)

```
carts ──(checkout)──▶ orders ──1:N──▶ order_items
                        │
                        └──1:N──▶ payments ◀── webhook_events (deduplicación)
```

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('number')->unique();                  // "JB-2026-000123", visible para el cliente
    $table->foreignId('user_id')->constrained();
    $table->foreignId('cart_id')->nullable()->constrained()->nullOnDelete();
    $table->string('idempotency_key', 64);               // clave de checkout (ver §6): unique con user_id
    $table->string('status', 30)->default('pending_payment');
    $table->char('currency', 3)->default('USD');
    $table->unsignedBigInteger('subtotal_cents');        // montos en CENTAVOS (enteros): nada de floats
    $table->unsignedBigInteger('shipping_cents')->default(0);
    $table->unsignedBigInteger('tax_cents')->default(0);
    $table->unsignedBigInteger('total_cents');
    $table->json('shipping_address');                    // SNAPSHOT: no una FK a addresses
    $table->timestamp('expires_at')->nullable();         // reserva de stock
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    $table->index(['user_id', 'created_at']);
});

Schema::create('order_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('variant_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name');                              // snapshot
    $table->json('options')->nullable();                 // snapshot: talla, color...
    $table->unsignedBigInteger('unit_price_cents');      // snapshot
    $table->unsignedInteger('quantity');
    $table->unsignedBigInteger('total_cents');
});

Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained();
    $table->string('provider', 20);                      // stripe | paypal | payphone
    $table->string('provider_ref')->index();             // checkout session id / paypal order id
    $table->string('status', 20)->default('pending');    // pending | succeeded | failed | refunded
    $table->unsignedBigInteger('amount_cents');
    $table->char('currency', 3);
    $table->json('raw')->nullable();                     // última respuesta del proveedor (auditoría)
    $table->timestamps();
    $table->unique(['provider', 'provider_ref']);
});

Schema::create('webhook_events', function (Blueprint $table) {
    $table->id();
    $table->string('provider', 20);
    $table->string('event_id');                          // id del evento en la pasarela
    $table->string('type');
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();
    $table->unique(['provider', 'event_id']);            // el mismo webhook dos veces = se ignora
});
```

**¿Por qué `shipping_address` es JSON y no una FK?** Porque si el usuario edita o borra la
dirección mañana, la orden de ayer tiene que seguir mostrando a dónde se envió.

**¿Por qué centavos enteros?** `0.1 + 0.2 = 0.30000000000000004`. Además, Stripe y la mayoría
de las pasarelas trabajan en la unidad mínima (centavos).

### Estados

```
Order:   pending_payment ──pago ok (webhook)──▶ paid ──▶ fulfilling ──▶ shipped ──▶ delivered
               │                                  └──▶ refunded
               ├──expira sin pagar──▶ expired   (libera stock)
               └──usuario cancela───▶ cancelled (libera stock)

Payment: pending ──▶ succeeded | failed ; succeeded ──▶ refunded
Cart:    active ──(orden pagada)──▶ converted       (ver cart.md)
```

**El carrito se marca `converted` cuando la orden se PAGA, no cuando se crea.** Si el usuario
cancela en la pasarela, vuelve y su carrito sigue intacto.

---

## 3. Puerto de pagos (hexagonal)

```php
namespace App\Modules\Payments\Contracts;

interface PaymentGateway
{
    /** Crea el pago en la pasarela y devuelve a dónde redirigir al usuario. */
    public function createPayment(Order $order, string $returnUrl, string $cancelUrl): PaymentRedirect;

    /** Verifica la firma y traduce el webhook a un evento del dominio. */
    public function parseWebhook(Request $request): PaymentEvent;
}

final class PaymentRedirect
{
    public function __construct(public string $providerRef, public string $url) {}
}

final class PaymentEvent
{
    public function __construct(
        public string $eventId,
        public string $providerRef,
        public PaymentEventType $type,   // Succeeded | Failed | Expired | Refunded | Ignored
        public ?int $amountCents = null,
    ) {}
}
```

Adaptadores: `StripeGateway`, `PaypalGateway`, `PayphoneGateway`. Se eligen con
`config('payments.default')`. **El controller y el servicio de órdenes no saben qué pasarela hay detrás.**

### Adaptador Stripe (Checkout alojado)

```php
public function createPayment(Order $order, string $returnUrl, string $cancelUrl): PaymentRedirect
{
    $session = $this->stripe->checkout->sessions->create([
        'mode' => 'payment',
        'client_reference_id' => (string) $order->id,
        'metadata' => ['order_id' => $order->id],
        'line_items' => $order->items->map(fn ($item) => [
            'quantity' => $item->quantity,
            'price_data' => [
                'currency' => strtolower($order->currency),
                'unit_amount' => $item->unit_price_cents,
                'product_data' => ['name' => $item->name],
            ],
        ])->all(),
        'success_url' => $returnUrl.'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $cancelUrl,
        'expires_at' => now()->addMinutes(30)->timestamp,     // mínimo permitido: 30 min
    ], ['idempotency_key' => 'order-'.$order->idempotency_key]);

    return new PaymentRedirect($session->id, $session->url);
}

public function parseWebhook(Request $request): PaymentEvent
{
    // Firma sobre el body CRUDO: si el body se parsea antes, la verificación falla
    $event = \Stripe\Webhook::constructEvent(
        $request->getContent(),
        $request->header('Stripe-Signature'),
        config('services.stripe.webhook_secret'),
    );

    $session = $event->data->object;

    return new PaymentEvent($event->id, $session->id ?? '', match ($event->type) {
        'checkout.session.completed' => $session->payment_status === 'paid'
            ? PaymentEventType::Succeeded : PaymentEventType::Ignored, // pagos asíncronos llegan después
        'checkout.session.async_payment_succeeded' => PaymentEventType::Succeeded,
        'checkout.session.async_payment_failed' => PaymentEventType::Failed,
        'checkout.session.expired' => PaymentEventType::Expired,
        default => PaymentEventType::Ignored,
    }, $session->amount_total ?? null);
}
```

### Adaptador PayPal (Orders API v2, también por redirect)

1. `createPayment` → `POST /v2/checkout/orders` (`intent: CAPTURE`, `return_url`, `cancel_url`) → se redirige al link `approve`.
2. El usuario aprueba en PayPal y vuelve a `return_url?token={paypal_order_id}`.
3. **Hay que CAPTURAR:** el loader de retorno pide a Laravel `POST /v2/checkout/orders/{id}/capture`. Sin captura no hay cobro (diferencia clave con Stripe).
4. El webhook `PAYMENT.CAPTURE.COMPLETED` se verifica con `POST /v1/notifications/verify-webhook-signature` y actúa como respaldo si el usuario cerró la pestaña antes del paso 3.

> PayPal también ofrece botones JS (`@paypal/react-paypal-js`). Usar el **flujo por redirect**
> mantiene un único patrón para todas las pasarelas y no carga su SDK en la tienda.

---

## 4. Flujo completo

```
/cart ──▶ /checkout/address ──▶ /checkout/review ──[Pagar]──▶ action RR
                                                                │ POST /api/checkout (Bearer + idempotency_key + address_id)
                                                                ▼
                                          Laravel, en TRANSACCIÓN:
                                            1. recalcula el carrito (precios y stock actuales)
                                            2. crea Order pending_payment + items (snapshot)
                                            3. reserva stock (expires_at = +30 min)
                                            4. gateway->createPayment() → Payment pending
                                          ◀── { redirect_url }
                                                                │
RR: return redirect(redirect_url)  ─────────────────────────────▶  Página de la pasarela
                                                                        │
             ┌────────────────── el usuario paga ───────────────────────┤
             ▼                                                          ▼
/checkout/success?session_id=…                      Webhook ──▶ Laravel /api/webhooks/{provider}
  loader: GET /api/orders/by-payment/…                             1. verifica la firma
  ¿paid?  → "¡Gracias!"                                             2. dedup por event_id
  ¿pending? → "Confirmando pago…" + revalidar cada 2 s              3. Payment succeeded + Order paid
                                                                    4. Cart converted
                                                                    5. job: email de confirmación
```

### Endpoints Laravel

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| `GET` | `/api/checkout/summary?address_id=` | Sanctum | Totales calculados (subtotal, envío, impuestos) |
| `POST` | `/api/checkout` | Sanctum | Crea la orden + el pago, devuelve `redirect_url` |
| `POST` | `/api/checkout/paypal/capture` | Sanctum | Captura (solo PayPal) |
| `GET` | `/api/orders` / `/api/orders/{number}` | Sanctum | Historial / detalle (scope del usuario) |
| `POST` | `/api/webhooks/{provider}` | **Sin auth** (firma) | Webhooks de la pasarela |

**El webhook apunta DIRECTO a Laravel, no a RR.** Es comunicación servidor a servidor: no hay
usuario ni sesión, y meter RR en el medio solo agrega un punto de falla.

### Webhook: idempotente y rápido

```php
public function __invoke(string $provider, Request $request, PaymentGatewayResolver $gateways)
{
    $event = $gateways->for($provider)->parseWebhook($request); // firma inválida → excepción → 400

    // Dedup: si el evento ya se registró, respondemos 200 y no hacemos nada
    $record = WebhookEvent::firstOrCreate(
        ['provider' => $provider, 'event_id' => $event->eventId],
        ['type' => $event->type->value],
    );
    if ($record->processed_at) return response()->noContent();

    ProcessPaymentEvent::dispatch($provider, $event); // trabajo pesado en cola
    return response()->noContent();                   // responder rápido: la pasarela reintenta si tarda
}
```

`ProcessPaymentEvent`, en una transacción con `lockForUpdate` sobre la orden: valida que
`amount == total_cents`, cambia estados (solo transiciones válidas: una orden `paid` no vuelve a
`pending`), marca el carrito `converted`, dispara el email y setea `processed_at`.

### Stock

- Se **reserva** al crear la orden (o se descuenta con vencimiento) y se **libera** con `checkout.session.expired` o con un job que vence las órdenes `pending_payment` con `expires_at` pasado.
- No se reserva al agregar al carrito (igual que Amazon): eso bloquearía inventario por carritos abandonados.

---

## 5. Rutas en React Router 7

```
app/routes/
├── _app.checkout.tsx                # layout: requireAuth, stepper, carrito vacío → redirect('/cart')
├── _app.checkout._index.tsx         # redirect('/checkout/address')
├── _app.checkout.address.tsx        # la actual /address (elegir / crear dirección)
├── _app.checkout.review.tsx         # resumen + action "Pagar"
├── _app.checkout.success.tsx        # confirmación (espera al webhook)
├── _app.checkout.paypal.return.tsx  # solo PayPal: captura y redirige a success
├── _app.orders._index.tsx           # "Mis pedidos"
└── _app.orders.$number.tsx          # detalle del pedido
```

### Layout: guardas en UN lugar

```tsx
// _app.checkout.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuth(request)            // aquí se exige login, no antes (cart.md)
  const cart = await loadCart(request, auth.token)
  if (cart.count === 0) throw redirect('/cart')      // no hay checkout sin productos
  return { cart }
}

export default function CheckoutLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CheckoutSteps />
        <Outlet />
      </div>
      <CartSummary cart={loaderData.cart} />         {/* ya existe en addresses/components */}
    </div>
  )
}
```

Las rutas hijas no repiten `requireAuth` ni el resumen: los hereda el layout. `CartSummary` sale
de `_app.address.tsx` y pasa a este layout.

### Review: el action que inicia el pago

```tsx
// _app.checkout.review.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const summary = await getCheckoutSummary(token)    // totales del BACKEND + dirección predeterminada
  if (!summary.address) throw redirect('/checkout/address')

  // La clave la da el BACKEND y depende de la versión del carrito (ver §6.1):
  // refresh, dos pestañas o doble click → misma clave → misma orden.
  // ❌ NO usar crypto.randomUUID() acá: cada render sería un "intento" nuevo.
  return { summary, idempotencyKey: summary.checkout_key }
}

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const form = await request.formData()

  const result = await placeOrder(token, {
    address_id: Number(form.get('address_id')),
    idempotency_key: String(form.get('idempotency_key')),
  })
  if (!result.ok) return fail(result.error, 'No se pudo iniciar el pago') // ActionResult (forms-modals.md)

  return redirect(result.data.redirect_url)          // RR también redirige a URLs externas
}

export default function Review({ loaderData }: Route.ComponentProps) {
  const { summary, idempotencyKey } = loaderData
  const navigation = useNavigation()
  const paying = navigation.state !== 'idle' && navigation.formAction === '/checkout/review'

  return (
    <Form method="post">
      <input type="hidden" name="address_id" value={summary.address.id} />
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />
      {/* dirección + link "Cambiar", items, envío, total */}
      <button disabled={paying}>{paying ? 'Redirigiendo al pago…' : `Pagar $${summary.total}`}</button>
    </Form>
  )
}
```

**`<Form>`, no `useFetcher`:** acá SÍ hay navegación (salimos a la pasarela). Y funciona sin JS.

**Los totales NO viajan en el form.** Solo `address_id` y la clave. Laravel recalcula todo.

### Success: esperar al webhook sin mentir

```tsx
// _app.checkout.success.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const ref = new URL(request.url).searchParams.get('session_id')
  if (!ref) throw redirect('/orders')

  const order = await getOrderByPaymentRef(token, ref) // 404 si no es del usuario (scope)
  return { order }
}

export default function Success({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData
  const revalidator = useRevalidator()

  // El webhook puede tardar unos segundos: re-ejecutamos el loader hasta que la orden esté pagada
  useEffect(() => {
    if (order.status !== 'pending_payment') return
    const id = setInterval(() => revalidator.revalidate(), 2000)
    return () => clearInterval(id)
  }, [order.status])

  if (order.status === 'paid') return <OrderConfirmed order={order} />
  if (order.status === 'pending_payment') return <p>Confirmando tu pago…</p>
  return <PaymentProblem order={order} />
}
```

Poné un **límite** al polling (por ejemplo 30 s). Después mostrá "Te avisaremos por email
cuando se confirme", que es verdad: el email lo dispara el webhook.

---

## 6. Cobrar UNA sola vez: defensa en capas

La idempotencia es el pilar, pero **una sola capa no alcanza**: cada capa cubre una falla
distinta. Si una falla, la siguiente la ataja.

| # | Capa | Dónde | Qué evita |
|---|---|---|---|
| 1 | Botón deshabilitado | RR | Doble click accidental. **Es UX, no seguridad** |
| 2 | Clave de checkout estable | Laravel → RR | Refresh, dos pestañas, reintento de red |
| 3 | Unique + misma respuesta ante una clave repetida | Laravel (BD) | Dos órdenes por el mismo intento |
| 4 | Lock por usuario | Laravel | Dos requests simultáneos que llegan antes del commit |
| 5 | Una orden abierta por carrito | Laravel (BD) | Nueva orden con la anterior aún pendiente |
| 6 | Una sesión de pago viva por orden | Laravel + pasarela | Pagar dos sesiones de la misma orden |
| 7 | Idempotency key hacia la pasarela | Laravel → pasarela | Crear el cobro dos veces si reintentamos la llamada |
| 8 | Webhook deduplicado + transiciones válidas | Laravel | Procesar el mismo pago dos veces |
| 9 | Pago de más → reembolso automático | Laravel (job) | El caso que pasó TODAS las capas |
| 10 | Conciliación periódica | Laravel (job) | Webhooks perdidos: orden cobrada pero marcada pendiente |

### 6.1 La clave de checkout: estable por intento, no por render

```php
// GET /api/checkout/summary → incluye la clave
$checkoutKey = hash('sha256', "{$cart->id}:{$cart->version}:{$addressId}");
```

- `cart.version` es un entero que se **incrementa en cada cambio** del carrito (agregar, quitar, cambiar cantidad).
- Mismo carrito + misma dirección = **misma clave**, sin importar cuántas veces recargues o cuántas pestañas abras.
- Si el usuario cambia el carrito, eso ES un intento nuevo, y la clave cambia sola.

### 6.2 Clave repetida → misma respuesta (con carrera incluida)

```php
public function placeOrder(User $user, string $key, int $addressId): PaymentRedirect
{
    // Capa 4: serializa los checkouts de un mismo usuario (dos requests simultáneos)
    return Cache::lock("checkout:user:{$user->id}", 10)->block(5, function () use ($user, $key, $addressId) {

        // Capa 3: ¿ya existe una orden para esta clave? → devolver la MISMA, no crear otra
        $existing = Order::where('user_id', $user->id)->where('idempotency_key', $key)->first();
        if ($existing) {
            return $this->resumePayment($existing); // misma sesión si sigue viva, o una nueva para la MISMA orden
        }

        try {
            return DB::transaction(function () use ($user, $key, $addressId) {
                $cart = $this->carts->activeFor($user)->lockForUpdate()->firstOrFail();

                // Capa 5: si hay otra orden pendiente de este carrito (versión vieja), se cancela primero
                $this->cancelOpenOrdersFor($cart); // también expira su sesión en la pasarela (capa 6)

                $order = $this->orders->createFromCart($cart, $addressId, $key); // recalcula precios, reserva stock
                return $this->startPayment($order);
            });
        } catch (UniqueConstraintViolationException) {
            // Red de seguridad si el lock falló: otro request ganó la carrera → devolvemos la suya
            return $this->resumePayment(Order::where('idempotency_key', $key)->firstOrFail());
        }
    });
}
```

```php
// Índices que hacen cumplir las reglas AUNQUE el código tenga un bug
$table->unique(['user_id', 'idempotency_key']);                                         // capa 3
DB::statement("CREATE UNIQUE INDEX orders_one_open_per_cart ON orders (cart_id) WHERE status = 'pending_payment'");     // capa 5
DB::statement("CREATE UNIQUE INDEX payments_one_pending_per_order ON payments (order_id) WHERE status = 'pending'");    // capa 6
```

> **El código puede tener bugs; la base de datos no negocia.** Los índices únicos son la última
> palabra: si dos procesos intentan romper la regla, uno recibe una excepción, no un cobro doble.

### 6.3 Una sesión de pago viva por orden

```php
private function resumePayment(Order $order): PaymentRedirect
{
    if ($order->status === 'paid') {
        throw new OrderAlreadyPaid($order); // RR redirige a /orders/{number}, NO a la pasarela
    }

    $pending = $order->payments()->where('status', 'pending')->latest()->first();

    // ¿La sesión anterior sigue viva? → misma URL (no se crea otro cobro)
    if ($pending && $this->gateway->isOpen($pending->provider_ref)) {
        return new PaymentRedirect($pending->provider_ref, $this->gateway->urlFor($pending));
    }

    // Expiró → se cierra EXPLÍCITAMENTE en la pasarela antes de abrir otra
    if ($pending) {
        $this->gateway->expire($pending->provider_ref);   // Stripe: checkout->sessions->expire()
        $pending->update(['status' => 'failed']);
    }

    return $this->startPayment($order);
}
```

### 6.4 Idempotencia hacia la pasarela

Si Laravel llama a la pasarela, hay un timeout y reintentamos, la pasarela tiene que reconocer
que es el mismo pedido:

| Pasarela | Mecanismo |
|---|---|
| Stripe | Opción `idempotency_key` en cada llamada que crea algo. Stripe guarda la respuesta al menos 24 h |
| PayPal | Header `PayPal-Request-Id` al crear o capturar la orden |

```php
// La clave incluye el número de intento: reintentar el MISMO intento = misma clave;
// una sesión NUEVA para la misma orden (la anterior expiró) = intento siguiente
['idempotency_key' => "order-{$order->id}-attempt-{$order->payments()->count()}"]
```

### 6.5 Webhook: procesar cada pago UNA vez

```php
// Job ProcessPaymentEvent
DB::transaction(function () use ($event) {
    $payment = Payment::where('provider_ref', $event->providerRef)->lockForUpdate()->firstOrFail();
    $order = $payment->order()->lockForUpdate()->first();

    if ($payment->status === 'succeeded') return;          // ya procesado: no-op

    if ($event->amountCents !== $order->total_cents) {
        $payment->update(['status' => 'failed']);
        report(new PaymentAmountMismatch($order, $event));  // alerta humana
        return;
    }

    $payment->update(['status' => 'succeeded']);

    // Capa 9: la orden YA estaba pagada con OTRO pago → cobro doble real → reembolso
    if ($order->status === 'paid') {
        RefundPayment::dispatch($payment);
        report(new DuplicatePaymentRefunded($order, $payment));
        return;
    }

    $order->markAsPaid();                                   // valida la transición (máquina de estados)
    $order->cart?->markAsConverted();
    SendOrderConfirmation::dispatch($order)->afterCommit();
});
```

### 6.6 Conciliación (capa 10)

Los webhooks se pierden (caídas, deploys, firewall). Un job cada 15 minutos:

```
órdenes pending_payment con más de 15 min
  → preguntar a la pasarela el estado real de su pago pendiente
  → pagado    → procesarlo como si hubiera llegado el webhook (mismo job, idempotente)
  → expirado  → orden expired, liberar stock
```

### 6.7 Frontend: lo que le toca a RR

- **Botón deshabilitado** con `useNavigation` (capa 1). Solo UX.
- **La clave viene del backend** (`summary.checkout_key`), en un hidden input. RR no la inventa.
- **Nunca reintentar automáticamente** un `POST /api/checkout` desde RR (sin retry de axios). El reintento lo hace el USUARIO, con la misma clave, y el backend devuelve lo mismo.
- **Si la orden ya está pagada**, la action redirige a `/orders/{number}`, nunca a la pasarela.
- **"Reintentar pago"** en `/orders/$number` para órdenes `pending_payment`: llama a `resumePayment` de ESA orden. No arma un checkout nuevo.
- Success/cancel **solo leen**: jamás cambian el estado de una orden.

---

## 7. Seguridad y casos borde

| Caso | Solución |
|---|---|
| Doble click, refresh, dos pestañas, reintento | Defensa en capas: ver §6 |
| El usuario cierra la pestaña después de pagar | El webhook marca la orden como pagada igual; el email llega |
| Webhook duplicado o desordenado | `webhook_events` único + solo transiciones de estado válidas |
| Webhook falso | Verificación de firma con el secret de la pasarela |
| Cambió el precio entre el carrito y el pago | El backend recalcula al crear la orden; la review muestra el total real |
| Monto pagado ≠ total de la orden | El job compara `amount_cents` con `total_cents`; si difiere, no marca `paid` y alerta |
| Sin stock al pagar | La reserva al crear la orden lo evita; si no se pudo reservar, error en la review, antes de cobrar |
| `address_id` ajeno | Scope `OwnedByUser` → 404 |
| Ver una orden ajena en `/checkout/success?session_id=` | La búsqueda por referencia filtra por `user_id` |

---

## 8. Desarrollo y pruebas

- **Stripe CLI:** `stripe listen --forward-to localhost/api/webhooks/stripe` reenvía los webhooks a local y te da el `whsec_...`.
- **Tarjetas de test (Stripe):** `4242 4242 4242 4242` (ok), `4000 0000 0000 9995` (fondos insuficientes), `4000 0025 0000 3155` (pide 3D Secure).
- **PayPal:** cuentas sandbox en developer.paypal.com.
- **Tests de Laravel:** mockear `PaymentGateway` (es una interfaz) y testear el servicio de órdenes y el job del webhook sin tocar la red: transiciones de estado, dedup y monto distinto.

---

## 9. Orden de implementación

1. Migrar el carrito a la Opción 2 de `cart.md` (`carts` / `cart_items`): el checkout parte del carrito del backend.
2. Tablas `orders`, `order_items`, `payments`, `webhook_events` + enums de estado.
3. `PaymentGateway` + `FakeGateway` (redirige directo a success y simula el webhook) para desarrollar sin pasarela.
4. `POST /api/checkout` con las capas de §6 + webhook + job + expiración + conciliación.
5. Rutas RR: layout `_app.checkout`, address (mover `/address`), review, success.
6. `/orders` y `/orders/$number`.
7. Adaptador real (Stripe test para aprender el flujo; la pasarela de producción según el país).
8. Emails transaccionales (confirmación, envío) en cola.
