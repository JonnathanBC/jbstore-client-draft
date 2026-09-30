# Carrito: guest vs usuario

Cómo manejar el carrito de un visitante sin sesión y el de un usuario logueado, y cómo
unificarlos. Compara tres enfoques y termina con una recomendación para `jb-store`.

> Contexto: se compra **sin exigir login hasta el checkout**. El carrito tiene que funcionar
> para un guest y sobrevivir al login sin perder nada.

---

## 0. Cómo está hoy

| | Guest | Usuario |
|---|---|---|
| Dónde vive | Cookie firmada `guest_cart` (RR, `guestCart.server.ts`) | Tabla `shoppingcart` (paquete `hardevine/shoppingcart`): **un blob serializado** por usuario |
| Qué guarda | `product_id`, `quantity`, `selected_features` | Items completos (precio, opciones, rowId) |
| Quién arma la vista | RR (`loadCart.server.ts` → `loadGuestCart`) | Laravel (`GET /api/cart/items`) |
| Login | `mergeGuestCartOnLogin` → `POST /api/cart/merge` → borra la cookie | — |

Es **la Opción 1** del documento. Funciona, pero ya muestra sus límites (ver §1).

---

## 1. Opción 1 — Cookie para guest, backend para usuario (actual)

```
Guest:   Navegador ─cookie guest_cart [{product_id, qty, features}]─▶ RR
                                                                     └─▶ GET productos por ids → arma el Cart
Usuario: RR ─Bearer─▶ Laravel /api/cart/items → Cart
Login:   RR lee la cookie → POST /api/cart/merge → borra la cookie
```

**¿Se unifica en `_app`?** Sí, y ya lo está: el loader de `_app` llama a
`loadCartCount(request, token)`, que elige la fuente, y cada pantalla usa `loadCart()`.

### A favor
- **Cero escrituras en la BD por visitantes anónimos.** Bots y curiosos no llenan tablas.
- Simple de arrancar: no hay tablas nuevas.
- La cookie es `httpOnly` y está firmada, así que el cliente no puede adulterarla sin que se note.

### En contra (con evidencia de tu código)
1. **Dos implementaciones del mismo carrito.** `loadGuestCart` en RR reimplementa lo que Laravel ya hace, y ya divergen:
   - ignora la **imagen y el stock de la variante** (las variantes no tienen precio propio; si algún día lo tienen, habrá que agregarlo en dos lugares);
   - deja `features: []`, así que el guest no ve qué talla o color eligió;
   - el `rowId` es el índice del array, no el `rowId` real, y las operaciones por fila se comportan distinto.

   Cada regla nueva (descuentos, envío gratis, impuestos) hay que escribirla **dos veces**.
2. **Límite de 4 KB por cookie.** `MAX_ITEMS = 50` con `selected_features`, firmado y en base64, puede pasarse de 4 KB. El navegador **descarta la cookie en silencio** y el carrito "desaparece".
3. **No hay multi-dispositivo** para el guest: el carrito queda atado al navegador.
4. **Cero analítica:** no podés saber qué hay en los carritos abandonados de los guests ni mandarles recordatorios.
5. **Validación tardía:** precio y stock recién se validan en el merge (en el login), así que el guest puede ver precios desactualizados.

---

## 2. Opción 2 — Carrito en el backend para todos (`carts` + `cart_items`)

El guest **también** tiene un carrito en la BD, identificado por un **token** en lugar de `user_id`.

```
Guest:   RR guarda cart_token (UUID) en cookie httpOnly ─X-Cart-Token─▶ Laravel → Cart
Usuario: RR ─Bearer─▶ Laravel → Cart del user_id
Login:   Laravel fusiona el cart del token en el cart del usuario → el del token queda "merged"
```

### Modelo de datos

```php
Schema::create('carts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->uuid('token')->unique();                  // identifica al guest (y al cart en general)
    $table->string('status', 20)->default('active');  // active | merged | converted | abandoned
    $table->unsignedInteger('version')->default(1);   // +1 en cada cambio de items: base de la clave de checkout (checkout.md §6.1)
    $table->timestamp('converted_at')->nullable();
    $table->timestamps();
    $table->index(['status', 'updated_at']);          // limpieza y carritos abandonados
});

Schema::create('cart_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_id')->constrained();
    $table->foreignId('variant_id')->nullable()->constrained();
    $table->unsignedInteger('quantity');
    $table->timestamps();
    $table->unique(['cart_id', 'product_id', 'variant_id']); // misma variante = misma fila, se suma qty
});

// Postgres: un solo carrito ACTIVO por usuario (índice único parcial)
DB::statement("CREATE UNIQUE INDEX carts_one_active_per_user ON carts (user_id) WHERE status = 'active' AND user_id IS NOT NULL");
```

> **El carrito NO guarda precios.** El precio se calcula siempre al leerlo, desde `products` o
> `variants`. Guardarlo en el carrito es la receta para cobrar un precio viejo. El precio se
> **congela** recién en la **orden**.

### Estados: ¿"vendido"? No. El carrito no se vende

Un error común es marcar el carrito como `sold`. **El carrito es una intención; la ORDEN es la venta.**

| Estado | Cuándo | Qué pasa |
|---|---|---|
| `active` | Carrito en uso | El único que se lee y modifica |
| `merged` | El guest inició sesión | Sus items pasaron al carrito del usuario; queda como historial |
| `converted` | Checkout exitoso | Se creó `orders` + `order_items` **con precios congelados** (snapshot); el usuario arranca con un carrito nuevo vacío |
| `abandoned` | Job diario: `active` sin tocar en N días | Emails de recuperación, métricas; después se purga |

Checkout = **transacción**: validar stock → crear `Order` con snapshot de nombre, precio y variante →
descontar stock → `cart.status = converted`. Si algo falla, no pasa nada de eso.

### Algoritmo de merge (en el login)

```
guestCart = Cart::active()->where('token', $token)->whereNull('user_id')->first()
userCart  = Cart::active()->firstOrCreate(['user_id' => $user->id])

si no hay guestCart → nada
si no hay items en userCart → reasignar: guestCart.user_id = user (sin copiar filas)
si no → por cada item del guest:
          existe misma (product_id, variant_id) en userCart → sumar qty, recortar a stock
          no existe → mover la fila
        guestCart.status = merged
todo dentro de DB::transaction
```

### API

| Método | Ruta | Nota |
|---|---|---|
| `GET` | `/api/cart` | Por Bearer o por `X-Cart-Token`. Si no existe, devuelve un carrito vacío (**no** lo crea) |
| `POST` | `/api/cart/items` | Crea el carrito **recién aquí** (lazy) y devuelve el `token` |
| `PATCH` | `/api/cart/items/{id}` | Cantidad |
| `DELETE` | `/api/cart/items/{id}` | |
| `POST` | `/api/cart/merge` | Con Bearer + `X-Cart-Token` |
| `GET` | `/api/cart/count` | Liviano, para el header |

**Creación lazy:** el carrito se crea con el primer "agregar", no al visitar la página. Así los
bots no generan filas.

### Lado React Router

```ts
// _app.tsx: una sola fuente, para guest o usuario
const cartToken = await cartTokenCookie.parse(request.headers.get('Cookie'))
const cartCount = await getCartCount({ token: auth?.token, cartToken }) // un endpoint, una lógica
```

`loadGuestCart` desaparece: RR solo **transporta** el token. Toda la lógica vive en Laravel.

### A favor
- **Una sola implementación**: el guest ve exactamente lo mismo que el usuario (variantes, imágenes, stock).
- Sin límite de 4 KB.
- Carritos abandonados medibles y recuperables (emails, métricas de conversión).
- Relacional: podés consultar "¿qué carritos tienen el producto X?" o reservar stock. Con un blob serializado no se puede.

### En contra
- Filas por visitantes anónimos → hace falta un **job de limpieza** (`abandoned` + purga a los 30–60 días).
- Más código de backend al inicio (tablas, merge, estados).
- Hay que proteger el token: un UUID v4 aleatorio en una cookie `httpOnly`. Si se filtra, alguien puede ver ese carrito (no es grave: no hay datos personales ni de pago).

---

## 3. Opción 3 — Cómo lo hace Amazon

Por lo que se observa desde afuera (su implementación interna no es pública):

1. **Carrito server-side también para anónimos**, identificado por una cookie de sesión (`session-id`). Es la Opción 2.
2. **Al iniciar sesión, fusiona** el carrito anónimo con el de la cuenta.
3. **Persistente y multi-dispositivo**: lo que agregás en el celular aparece en la PC.
4. **"Guardar para más tarde"**: una segunda lista separada del carrito activo (en la Opción 2, un flag `saved_for_later` en `cart_items`, o un segundo carrito).
5. **Revalidación continua**: si cambió el precio o no hay stock, lo **avisa en el carrito** ("El precio de X cambió de $20 a $18"). Nunca cobra sin mostrarlo.
6. **Stock no reservado al agregar**: se valida en el checkout. Agregar al carrito no bloquea inventario para nadie.
7. **El carrito ≠ la orden**: el checkout genera una orden con snapshot y el carrito sigue vivo con lo que no compraste.

**Amazon = Opción 2 + "guardar para más tarde" + avisos de cambio de precio o stock.** No es una
arquitectura distinta: es la Opción 2 bien terminada.

---

## 4. Comparación

| | Opción 1 (cookie) | Opción 2 (BD) | Amazon (2 + extras) |
|---|---|---|---|
| Implementaciones del carrito | 2 (RR + Laravel) | **1** | 1 |
| Guest ve variante, imagen y stock correctos | ❌ hoy no | ✅ | ✅ |
| Límite de tamaño | 4 KB | Ninguno | Ninguno |
| Multi-dispositivo (guest) | ❌ | ❌ (salvo login) | ❌ (salvo login) |
| Carritos abandonados / analítica | ❌ | ✅ | ✅ |
| Escrituras por anónimos | 0 | Sí (lazy + limpieza) | Sí |
| Complejidad inicial | Baja | Media | Media-alta |

---

## 5. Recomendación

**Opción 2 en el backend, agregando las ideas de Amazon a medida que hagan falta.**

¿Por qué? Porque el problema de fondo de la Opción 1 no es técnico: es **duplicar reglas de
negocio**. En un e-commerce el carrito crece siempre (cupones, envío, impuestos, promos "2x1") y
cada regla escrita dos veces es un bug esperando a pasar. Ya pasó: el guest no ve las variantes.

**¿Cuándo la Opción 1 sigue siendo válida?** En un MVP de pocos productos, sin variantes ni
promociones, donde no vas a medir abandono. No es el caso de `jb-store`.

### Plan de migración

1. Tablas `carts` + `cart_items` y el modelo `Cart` con los estados.
2. Endpoints nuevos que acepten Bearer **o** `X-Cart-Token`; creación lazy.
3. Merge en el login (transacción, suma de qty, recorte a stock).
4. RR: cookie `cart_token` en lugar de `guest_cart`; `_app` y `loadCart` llaman a un único endpoint; eliminar `loadGuestCart`.
5. Compatibilidad: durante una ventana, si llega la cookie vieja `guest_cart`, se convierte a un carrito en BD y se borra.
6. Job diario: marcar `abandoned` y purgar los guests viejos.
7. Retirar el paquete `shoppingcart` (blob serializado) cuando nada lo use.
8. Después: "guardar para más tarde" y avisos de cambio de precio (Amazon).
