# Checkout y órdenes: arquitectura segura

Guía general para construir el checkout y las órdenes de `jb-store`: escalable, difícil de
manipular y con **una sola fuente de verdad** para cada dato. Es el marco conceptual; los
detalles de pasarelas y rutas están en [`checkout.md`](./checkout.md), y los del carrito en
[`cart.md`](./cart.md).

> Es la lógica de negocio más peligrosa del sistema: un bug acá **cuesta dinero real**, ya sea
> cobrar de más, cobrar de menos o vender stock que no existe.

---

## 0. La regla de oro

> **El cliente envía INTENCIÓN. El servidor construye TODO lo demás.**

El cliente solo puede decir *"quiero el producto 12, variante 40, cantidad 10"*. El precio, los
subtotales, el descuento, el envío, los impuestos, el total y la disponibilidad **los calcula el
servidor desde su base de datos**, siempre, en cada paso.

### El ataque de la mochila

```jsonc
// Lo que manda un atacante (editando el request en DevTools o con curl)
POST /api/checkout
{ "items": [{ "product_id": 12, "quantity": 10, "price": 20 }], "total": 20 }
// 10 mochilas de $20 = $200 reales… pero dice que el total es $20
```

**Por qué NO funciona en este diseño:**

1. **`price` y `total` no existen en la API.** El `FormRequest` no los tiene en `rules()`, así que `$request->validated()` los descarta. Nunca se leen.
2. **El checkout ni siquiera recibe items.** Se construye desde el **carrito guardado en la BD** (`cart_items`: solo `product_id`, `variant_id`, `quantity`).
3. **El precio sale de `products`** en el momento de cotizar. Total = Σ(precio de la BD × cantidad).
4. **La pasarela cobra lo que dice la ORDEN** (creada por el servidor), y el webhook verifica que lo pagado == `order.total_cents`.

```php
// ❌ NUNCA
$total = $request->input('total');
$price = $item['price'];

// ✅ SIEMPRE
$product = Product::findOrFail($line->product_id);
$lineTotal = $product->price_cents * $line->quantity;
```

Si en algún lugar del código aparece un precio o un total que **vino del request**, es un bug de
seguridad. Sin excepciones.

---

## 1. Una sola fuente de verdad por dato

| Dato | Fuente de verdad | Qué NO es fuente de verdad |
|---|---|---|
| Identidad del usuario | Token (Sanctum) → `auth()->id()` | `user_id` en el body |
| Precio vigente | `products` en la BD, al cotizar | El carrito, el frontend, la cookie guest |
| Precio de una orden ya creada | Snapshot en `order_items` | `products` (puede haber cambiado) |
| Total a cobrar | `orders.total_cents` | Lo que diga el cliente o la URL de éxito |
| Stock | `products.stock` / `variants.stock` + `CHECK` en la BD | El carrito, el "quedan 3" que ve el usuario |
| ¿Se pagó? | La pasarela (webhook + conciliación) | La página de éxito, un query param |
| Dirección de envío de una orden | Snapshot JSON en `orders` | `addresses` (puede editarse o borrarse) |
| Pertenencia (¿es tuya?) | Scope `OwnedByUser` / policies | Que el id "venga del form correcto" |

Regla: **cada dato tiene UN dueño**. Los demás lo leen, nunca lo reescriben.

---

## 2. Módulos

Ya existen `Cart`, `Orders`, `Payments`, `Shipping`, `Products` y `Addresses` en `app/Modules`.
Propuesta de responsabilidades y dependencias:

```
                    ┌────────────┐
    HTTP  ─────────▶│  Checkout  │  orquesta el caso de uso "comprar"
                    └─────┬──────┘
        ┌────────┬────────┼─────────┬──────────┬──────────┐
        ▼        ▼        ▼         ▼          ▼          ▼
     Cart    Pricing  Inventory  Shipping   Orders    Payments ──▶ PaymentGateway (puerto)
      │         │         │                   ▲          │            ├ StripeGateway
      └────┬────┘         │                   │          │            ├ PaypalGateway
           ▼              │                   └──eventos─┘            └ PayphoneGateway
        Products ◀────────┘          PaymentSucceeded ─▶ Orders.markPaid
       (catálogo)                    OrderPaid        ─▶ Inventory.commit, Cart.convert, Notifications
```

| Módulo | Es dueño de | Expone | NO hace |
|---|---|---|---|
| **Products** | Catálogo: productos, variantes, `price_cents` | Lectura de producto/variante | Calcular totales |
| **Pricing** | Cálculo de montos | `quote(lines, address, coupon): Quote` (función pura) | Leer el request |
| **Inventory** | Stock y reservas | `reserve()`, `release()`, `commit()` atómicos | Saber de pagos |
| **Cart** | `carts`, `cart_items`, `version` | Líneas del carrito (ids + cantidades) | Guardar precios |
| **Shipping** | Tarifas de envío | `rateFor(address, lines)` | — |
| **Orders** | `orders`, `order_items`, máquina de estados | `createFromQuote()`, `markPaid()`, `expire()` | Hablar con Stripe |
| **Payments** | `payments`, `webhook_events`, gateways | `start(order)`, `handleWebhook()` | Tocar stock o carrito |
| **Checkout** | Nada propio: **orquesta** | `POST /api/checkout`, `GET /summary` | Lógica de dominio propia |

**Reglas de dependencia:**
- `Checkout` depende de todos; **nadie depende de `Checkout`**.
- `Orders` y `Payments` se comunican por **eventos de dominio** (`PaymentSucceeded`, `OrderPaid`), no con llamadas cruzadas. Agregar "sumar puntos de fidelidad" mañana es un listener nuevo, no un cambio en `Payments`.
- `Pricing` es **pura y determinística**: mismas entradas → mismo resultado. Se usa en el resumen **y** al crear la orden, así que no hay dos cálculos que diverjan.

---

## 3. Pricing: un solo cálculo, en centavos

```php
final class PricingService
{
    /** @param CartLine[] $lines  (solo product_id, variant_id, quantity) */
    public function quote(array $lines, ?Address $address, ?Coupon $coupon = null): Quote
    {
        $products = Product::with('variants')->findMany(array_column($lines, 'productId'))->keyBy('id');

        $quoteLines = array_map(function (CartLine $line) use ($products) {
            $product = $products[$line->productId] ?? throw new ProductUnavailable($line->productId);
            if (! $product->is_active) throw new ProductUnavailable($product->id); // requiere agregar is_active (hoy no existe)

            $variant = $line->variantId
                ? $product->variants->firstWhere('id', $line->variantId) ?? throw new VariantMismatch($line)
                : null;                                        // la variante DEBE pertenecer al producto

            $unit = $product->price_cents;                     // ← la ÚNICA fuente del precio
            return new QuoteLine($product, $variant, $line->quantity, $unit, $unit * $line->quantity);
        }, $lines);

        $subtotal = array_sum(array_map(fn ($l) => $l->totalCents, $quoteLines));
        $discount = $coupon?->discountFor($subtotal) ?? 0;     // nunca mayor que el subtotal
        $shipping = $this->shipping->rateFor($address, $quoteLines);
        $tax      = $this->tax->for($subtotal - $discount, $address);

        return new Quote($quoteLines, $subtotal, $discount, $shipping, $tax,
            total: max(0, $subtotal - $discount + $shipping + $tax));
    }
}
```

### Dinero: reglas

- **Enteros en centavos** (`bigint`), o `decimal(12,2)` + una librería de Money (`brick/money`). **Nunca `float`.**
  ⚠️ Hoy `products.price` es `float`: migrarlo a `price_cents bigint` antes de cobrar un solo centavo.
- Redondeo definido **una vez** (en impuestos y descuentos porcentuales), por línea o por total, pero siempre igual.
- Moneda explícita en la orden (`currency`); no se mezclan monedas.

### "El precio cambió" (como Amazon)

El cliente puede enviar el total que **vio**, pero **solo para detectar cambios**, nunca para cobrar:

```php
$quote = $pricing->quote(...);
if ($request->integer('expected_total_cents') !== $quote->total) {
    // 409: "Los precios cambiaron. Revisá tu pedido." → la review se recarga con el total nuevo
    throw new QuoteChanged($quote);
}
```

Así el usuario nunca paga un monto distinto del que vio, y el servidor nunca usa el monto del cliente.

---

## 4. Cantidades y stock

### 4.1 Validación de entrada (en cada endpoint que recibe cantidades)

```php
'product_id' => ['required', 'integer', 'exists:products,id'],
'variant_id' => ['nullable', 'integer'],                  // la pertenencia al producto se valida en el dominio
'quantity'   => ['required', 'integer', 'min:1', 'max:10'], // límite por línea: frena abusos y errores
```

Además:
- **Máximo de líneas por carrito** (por ejemplo 50) y **máximo de unidades por producto por cliente** para productos limitados (como Amazon).
- `quantity` **positiva**: `-5` mochilas = un "descuento" gratis si nadie lo valida.
- Producto **activo y comprable**, y variante **perteneciente a ese producto**. Tu `CartController::addItem` ya valida la coincidencia exacta de variante: bien.

### 4.2 Tres momentos de verificación de stock

| Momento | Tipo | Qué pasa si no hay |
|---|---|---|
| Agregar al carrito | **Blanda** | Se avisa o se limita la cantidad. ⚠️ Hoy está desactivada (`TODO` en `CartController`) |
| Resumen / review | **Blanda** | Se muestra "Solo quedan 3" y se ajusta la línea; el usuario confirma |
| Crear la orden | **DURA y ATÓMICA** | La orden no se crea. Esta es la que importa |

### 4.3 Descuento atómico: sin carreras

Dos clientes compran la última mochila **al mismo tiempo**. `if ($stock >= $qty) { $stock -= $qty; save(); }`
vende dos: ambos leen `stock = 1` antes de que el otro guarde.

```php
// ✅ Chequeo y descuento en UNA sentencia: la BD serializa
$affected = DB::table('variants')
    ->where('id', $variantId)
    ->where('stock', '>=', $qty)
    ->decrement('stock', $qty);

if ($affected === 0) {
    throw new OutOfStock($variantId);   // otro ganó la carrera: se hace rollback de toda la orden
}
```

Y como **última línea de defensa en la BD** (Postgres ignora `unsigned`):

```php
DB::statement('ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0)');
DB::statement('ALTER TABLE variants ADD CONSTRAINT variants_stock_non_negative CHECK (stock >= 0)');
```

Si un bug futuro se saltea la sentencia atómica, Postgres **rechaza** el stock negativo en lugar de vender de más.

### 4.4 Reserva y liberación

- Al **crear la orden** se descuenta el stock (reserva) con `orders.expires_at = +30 min`.
- **Pagada** → la reserva se confirma (no hay que hacer nada más).
- **Expirada o cancelada** → se devuelve el stock. **Una sola vez**: la devolución va atada a la transición de estado (§6), no a "cada vez que corre el job".

---

## 5. Idempotencia

### 5.1 Qué es y por qué es el pilar

Una operación es idempotente si **ejecutarla N veces tiene el mismo efecto que ejecutarla una**.
En pagos todo se reintenta: el usuario (doble click, refresh), la red (timeouts), el propio código
(retry de colas) y la pasarela (reenvía webhooks). Sin idempotencia, cada reintento es un cobro o
una orden duplicada.

### 5.2 Patrón general: `Idempotency-Key` para cualquier mutación crítica

Como lo hace Stripe con su propia API:

```php
Schema::create('idempotency_keys', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->string('key', 64);
    $table->string('request_hash', 64);          // hash del body: misma clave con otro body = error
    $table->unsignedSmallInteger('response_status')->nullable();
    $table->json('response_body')->nullable();
    $table->timestamp('locked_at')->nullable();  // request en curso
    $table->timestamps();
    $table->unique(['user_id', 'key']);
});
```

Middleware `Idempotent`:

```
1. Buscar (user_id, key)
   ├─ no existe            → insertar con locked_at = now (el unique frena la carrera) → ejecutar
   ├─ existe con respuesta → si request_hash coincide: devolver la MISMA respuesta guardada
   │                         si no coincide: 422 "clave reutilizada con otro contenido"
   └─ existe y está locked → 409 "en proceso, reintentá en un momento"
2. Guardar status y body de la respuesta; liberar el lock
3. Purgar claves de más de 24 h con un job
```

Se aplica a `POST /api/checkout`, a la captura de PayPal, a reembolsos y a acciones de admin
sobre dinero. Para el checkout, la clave sale del carrito (ver `checkout.md` §6.1).

### 5.3 Las capas

La idempotencia sola no alcanza. El detalle completo está en `checkout.md` §6:

| Capa | Mecanismo |
|---|---|
| Frontend | Botón deshabilitado (UX) + clave provista por el backend |
| API | `Idempotency-Key` + unique `(user_id, key)` |
| Concurrencia | Lock por usuario + atrapar `UniqueConstraintViolation` |
| Dominio | Una orden abierta por carrito; una sesión de pago viva por orden (índices únicos parciales) |
| Pasarela | `idempotency_key` (Stripe) / `PayPal-Request-Id` |
| Webhooks | `webhook_events` unique + `lockForUpdate` + transiciones válidas |
| Red de seguridad | Pago duplicado → reembolso automático; conciliación periódica |

---

## 6. Máquina de estados de la orden

Los estados no se asignan libremente (`$order->status = 'paid'`): se **transicionan**, y solo por
caminos válidos.

```php
enum OrderStatus: string
{
    case PendingPayment = 'pending_payment';
    case Paid = 'paid';
    case Fulfilling = 'fulfilling';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, match ($this) {
            self::PendingPayment => [self::Paid, self::Expired, self::Cancelled],
            self::Paid           => [self::Fulfilling, self::Refunded, self::Cancelled],
            self::Fulfilling     => [self::Shipped, self::Refunded],
            self::Shipped        => [self::Delivered, self::Refunded],
            default              => [],               // estados finales
        }, true);
    }
}
```

```php
// Transición atómica: el WHERE sobre el estado actual hace que solo UN proceso gane
public function transition(Order $order, OrderStatus $from, OrderStatus $to): bool
{
    if (! $from->canTransitionTo($to)) throw new InvalidOrderTransition($from, $to);

    $won = Order::whereKey($order->id)->where('status', $from)->update(['status' => $to]) === 1;
    if ($won) OrderStatusChanged::dispatch($order->id, $from, $to); // historial + listeners
    return $won;
}
```

Por qué importa: el job de expiración y el webhook de pago pueden correr **al mismo tiempo** sobre
la misma orden. Con el `WHERE status = pending_payment`, gana uno solo:
- **Gana el pago** → el job no hace nada.
- **Gana la expiración** → cuando llega el pago, la orden ya no está pendiente → reembolso automático (o re-reserva de stock, si hay), y alerta.

`status`, `total_cents` y `paid_at` **nunca** van en `$fillable`: solo cambian por estos métodos.

Guardá un **historial** (`order_events`: from, to, actor, motivo, fecha). Soporte y auditoría lo van a necesitar.

---

## 7. Webhooks

### 7.1 Pipeline

```
Pasarela ──▶ POST /api/webhooks/{provider}
               1. Verificar firma con el body CRUDO     → inválida: 400
               2. INSERT webhook_events (unique)       → duplicado: 200 y nada más
               3. Encolar ProcessPaymentEvent
               4. Responder 200 rápido                  (la pasarela reintenta si tardás o fallás)
                          │
                          ▼
             Job (reintentable, idempotente):
               - Opcional y recomendado: re-consultar el objeto a la API de la pasarela
                 (no confiar ciegamente en el payload)
               - lockForUpdate(payment, order)
               - monto pagado == order.total_cents  y  moneda == order.currency
               - transition(PendingPayment → Paid)
               - evento OrderPaid → Inventory.commit, Cart.convert, email (afterCommit)
               - webhook_events.processed_at = now
```

### 7.2 Reglas

- **Los eventos llegan desordenados y repetidos.** Un `refund` puede llegar antes de que procesaras el `succeeded`. El handler decide por el **estado actual** + la máquina de estados, no por el orden de llegada.
- **Los efectos externos van después del commit** (`afterCommit()` o el patrón outbox): si la transacción hace rollback, no se manda un email de "pago confirmado" falso.
- **El webhook no tiene usuario:** no hay `auth()`. Todo se resuelve por `provider_ref` → `payment` → `order`.
- **Conciliación periódica:** un job consulta a la pasarela las órdenes `pending_payment` viejas. Los webhooks se pierden.
- **Guardá el payload** (`payments.raw`) para auditoría y disputas.

---

## 8. Seguridad transversal

| Riesgo | Defensa |
|---|---|
| Manipular precio, total o descuento | §0: el servidor recalcula; `validated()` descarta campos extra |
| IDOR (ver o pagar una orden ajena) | Scope por `user_id` en TODA consulta de órdenes, direcciones y pagos; 404, no 403 (no revelar que existe) |
| Mass assignment | `status`, `total_cents`, `user_id`, `paid_at` fuera de `$fillable` |
| Cantidad negativa, cero o gigante | `integer`, `min:1`, `max:N` |
| Cupones: reutilización o carrera | Uso por usuario con unique `(coupon_id, user_id)` + contador atómico (`WHERE uses < max_uses`) |
| Fuerza bruta de cupones | Rate limit por usuario e IP |
| Spam al checkout | `RateLimiter` en `POST /api/checkout` (ej. 10/min por usuario) |
| Webhook falso | Firma verificada; secret por entorno |
| Órdenes enumerables | El `number` visible puede ser secuencial, pero toda lectura pasa por la autorización |
| Float y redondeo | Centavos enteros; redondeo definido una vez |
| Datos de tarjeta | Nunca tocan nuestros servidores: páginas alojadas por la pasarela (PCI SAQ A) |
| CSRF en actions de RR con cookie de sesión | Cookie `sameSite: 'lax'` (ya configurada) + las actions de dinero solo aceptan POST |
| Logs con datos sensibles | No loguear tokens, datos de pago ni direcciones completas |
| Admin cambia el precio a mitad de una compra | La orden ya tiene el snapshot; el checkout nuevo detecta el cambio (409) |

---

## 9. Casos borde

| Caso | Qué hace el sistema |
|---|---|
| Producto desactivado o borrado entre el carrito y el pago | `quote()` lanza `ProductUnavailable` → la review lo marca y lo quita |
| Precio cambió entre la review y el click en "Pagar" | `expected_total_cents` ≠ quote → 409 → la review muestra el total nuevo |
| Pedís 5 y quedan 3 | La review ajusta a 3 y avisa (Amazon); la orden solo se crea con lo que hay |
| Dos clientes y una sola unidad | Descuento atómico: uno recibe `OutOfStock` antes de pagar |
| El pago llega después de que la orden expiró | La transición falla → reembolso automático + alerta (o re-reserva si hay stock) |
| Webhook antes de que el usuario vuelva a success | Normal: success lee la orden ya pagada |
| El usuario nunca vuelve a success | El webhook confirma igual; el email llega |
| Orden de $0 (cupón del 100%) | Se salta la pasarela: pasa directo a `Paid` por la misma transición |
| Dirección editada o borrada después de comprar | La orden tiene el snapshot |
| Pago parcial o monto distinto | No se marca `Paid`; alerta humana |
| Reembolso parcial | `payments` admite montos parciales; la orden sigue `Paid` hasta que el reembolso es total |
| Deploy o caída durante un webhook | La pasarela reintenta; dedup + conciliación |
| Cupón vence a mitad del checkout | `quote()` lo revalida al crear la orden → 409 como un cambio de precio |

---

## 10. Cómo lo hace Amazon (referencia)

Lo observable desde afuera (la implementación interna no es pública):

- **Carrito persistente server-side**, fusionado al iniciar sesión. Ver `cart.md`.
- **Precios siempre recalculados**: si cambió el precio de algo en tu carrito, te lo avisa arriba ("El precio de X cambió de… a…").
- **Límites por cliente** en productos con demanda alta ("Límite de 2 por cliente").
- **"Solo quedan N"**: stock visible, pero la verificación real ocurre al confirmar.
- **Autorizar ahora, cobrar al enviar:** al confirmar el pedido la tarjeta se **autoriza** (se retiene el monto) y el **cobro** se hace cuando el producto se despacha. Si no se envía, la retención se libera y nunca hubo cobro.
  Equivalente: Stripe `capture_method: manual` (la autorización de tarjeta dura unos días; revisá el plazo vigente) o PayPal `intent: AUTHORIZE`. Es un paso avanzado: arrancá con cobro inmediato.
- **Cancelación gratis antes del envío:** la máquina de estados lo permite desde `Paid` / `Fulfilling`.
- **Número de pedido no adivinable** y siempre protegido por la autorización.
- **Emails transaccionales** en cada transición (confirmado, enviado, entregado).

---

## 11. Tests que tienen que existir

Tests de Feature en Laravel que **atacan** el checkout:

- [ ] Enviar `price`, `total` o `discount` en el body → se ignoran; el total es el de la BD.
- [ ] `quantity: -1`, `0`, `1000`, `"abc"` → 422.
- [ ] `variant_id` de otro producto → error de dominio.
- [ ] `address_id` de otro usuario → 404.
- [ ] Misma `Idempotency-Key` dos veces → una sola orden y la misma respuesta.
- [ ] Misma clave con otro body → 422.
- [ ] Dos checkouts concurrentes por la última unidad → una orden, un `OutOfStock`.
- [ ] Webhook con firma inválida → 400, sin cambios.
- [ ] El mismo webhook dos veces → se procesa una vez.
- [ ] Webhook con monto ≠ total → no se marca `Paid`.
- [ ] Pago sobre una orden `Expired` → reembolso despachado.
- [ ] La expiración devuelve el stock exactamente una vez.
- [ ] Transiciones inválidas (`Delivered → PendingPayment`) → excepción.

Con `FakeGateway` (implementa `PaymentGateway`), todo esto corre sin red.

---

## 12. Checklist antes de producción

- [ ] `products.price` migrado a centavos enteros.
- [ ] `CHECK (stock >= 0)` en `products` y `variants`.
- [ ] Validación de stock del carrito reactivada (`TODO` en `CartController::addItem`).
- [ ] Carrito en la BD (`cart.md`, Opción 2).
- [ ] `Pricing` único, usado en el resumen y en la orden.
- [ ] Middleware `Idempotent` + índices únicos parciales.
- [ ] Máquina de estados + `order_events`.
- [ ] Webhooks: firma, dedup, cola, afterCommit, conciliación.
- [ ] Rate limits en checkout y cupones.
- [ ] Todos los tests de §11 en verde.
