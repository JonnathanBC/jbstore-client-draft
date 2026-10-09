export type PaymentResponse = {
  accessToken: string
}

export type PaymentSessionTokenResponse = {
  sessionKey: string
  // Lo genera Laravel: es la llave de idempotencia del pago
  purchaseNumber: string
  amount: number
}

// El monto no viaja: Laravel cobra el que fijó al iniciar la sesión
export type CapturePaymentPayload = {
  transactionToken: string
  purchaseNumber: string
}

// Respuesta de la autorización de Niubiz (api.authorization/v3/authorization).
export type NiubizAuthorizationHeader = {
  ecoreTransactionUUID: string
  ecoreTransactionDate: number // epoch en milisegundos
  millis: number
}

export type NiubizAuthorizationFulfillment = {
  channel: string
  merchantId: string
  terminalId: string
  captureType: string
  countable: boolean
  fastPayment: boolean
  signature: string
}

export type NiubizAuthorizationOrder = {
  tokenId: string
  purchaseNumber: string
  amount: number
  installment: number
  currency: string
  authorizedAmount: number
  authorizationCode: string
  actionCode: string // '000' = aprobada
  traceNumber: string
  transactionDate: string // yyMMddHHmmss
  transactionId: string
}

// Todos los valores llegan como string, incluso los numéricos (AMOUNT).
export type NiubizAuthorizationDataMap = {
  TERMINAL: string
  BRAND_ACTION_CODE: string
  BRAND_HOST_DATE_TIME: string
  TRACE_NUMBER: string
  CARD_TYPE: string
  ECI_DESCRIPTION: string
  SIGNATURE: string
  CARD: string // enmascarada: 545546******4260
  MERCHANT: string
  STATUS: string
  ACTION_DESCRIPTION: string
  ID_UNICO: string
  AMOUNT: string
  BRAND_HOST_ID: string
  AUTHORIZATION_CODE: string
  YAPE_ID: string
  CURRENCY: string // código ISO numérico: '0604' = PEN
  TRANSACTION_DATE: string
  ACTION_CODE: string
  CVV2_VALIDATION_RESULT: string
  ECI: string
  ID_RESOLUTOR: string
  BRAND: string
  ADQUIRENTE: string
  BRAND_NAME: string
  PROCESS_CODE: string
  TRANSACTION_ID: string
}

// En un rechazo Niubiz manda un `data` parecido al dataMap, pero cualquier
// campo puede faltar (y en errores de autenticación no viene `data`).
export type NiubizRejectionData = Partial<NiubizAuthorizationDataMap>

export type AuthorizePaymentResponse = {
  header: NiubizAuthorizationHeader
  fulfillment: NiubizAuthorizationFulfillment
  order: NiubizAuthorizationOrder
  dataMap: NiubizAuthorizationDataMap
}
