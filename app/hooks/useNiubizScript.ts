import { useEffect, useState } from 'react'

export type NiubizCheckoutConfig = {
  sessiontoken: string
  channel: 'web'
  merchantid: string
  purchasenumber: string
  amount: number
  expirationminutes: string
  timeouturl: string
  merchantlogo?: string
  formbuttoncolor?: string
  action: string
}

declare global {
  interface Window {
    VisanetCheckout?: {
      configure: (config: NiubizCheckoutConfig) => void
      open: () => void
    }
  }
}

/**
 * open() inserta un iframe de Niubiz que tarda unos segundos en cargar.
 * Resuelve cuando ese iframe terminó de cargar (o a los 10s, por las dudas).
 */
export function waitForNiubizModal(
  timeoutMs = 10_000,
  signal?: AbortSignal,
): Promise<HTMLIFrameElement | null> {
  return new Promise((resolve) => {
    const done = (iframe: HTMLIFrameElement | null) => {
      observer.disconnect()
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      resolve(iframe)
    }
    const onAbort = () => done(null)
    const timer = setTimeout(() => done(null), timeoutMs)
    const observer = new MutationObserver((mutations) => {
      for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          const iframe =
            node instanceof HTMLIFrameElement
              ? node
              : node.querySelector('iframe')
          if (iframe) {
            iframe.addEventListener('load', () => done(iframe), { once: true })
            return
          }
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    signal?.addEventListener('abort', onAbort, { once: true })
    if (signal?.aborted) onAbort()
  })
}

export function waitForNiubizModalClose(
  iframe: HTMLIFrameElement,
  timeoutMs = 1_200_000,
  signal?: AbortSignal,
): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (closed: boolean) => {
      observer.disconnect()
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      resolve(closed)
    }
    const onAbort = () => done(false)
    const isVisible = () => {
      if (!iframe.isConnected || iframe.getClientRects().length === 0) {
        return false
      }

      for (
        let element: HTMLElement | null = iframe;
        element;
        element = element.parentElement
      ) {
        const style = window.getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false
        }
      }

      return true
    }
    const checkIfClosed = () => {
      if (!isVisible()) done(true)
    }
    const timer = setTimeout(() => done(false), timeoutMs)
    const observer = new MutationObserver(checkIfClosed)

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    })
    signal?.addEventListener('abort', onAbort, { once: true })
    if (signal?.aborted) onAbort()
    checkIfClosed()
  })
}

/**
 * React no ejecuta un <script> montado en el cliente, así que lo inyectamos
 * a mano una sola vez y avisamos cuando VisanetCheckout está disponible.
 */
export function useNiubizScript(src: string) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (window.VisanetCheckout) return setLoaded(true)

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    )
    if (!script) {
      script = document.createElement('script')
      script.src = src
      script.async = true
      document.body.appendChild(script)
    }

    const onLoad = () => setLoaded(true)
    script.addEventListener('load', onLoad)
    return () => script.removeEventListener('load', onLoad)
  }, [src])

  return loaded
}
