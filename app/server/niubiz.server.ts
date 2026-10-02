const scriptUrl = process.env.NIUBIZ_URL_JS
const merchantId = process.env.NIUBIZ_MERCHANT_ID

if (!scriptUrl || !merchantId) {
  throw new Error('NIUBIZ_URL_JS y NIUBIZ_MERCHANT_ID son requeridas')
}

/**
 * Config pública de Niubiz: viaja al cliente vía loaderData.
 * NUNCA agregar acá credenciales de la API (usuario/contraseña).
 */
export const niubizPublicConfig = { scriptUrl, merchantId }
