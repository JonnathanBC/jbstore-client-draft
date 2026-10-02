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
export function waitForNiubizModal(timeoutMs = 10_000): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      observer.disconnect()
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(done, timeoutMs)
    const observer = new MutationObserver((mutations) => {
      for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          const iframe =
            node instanceof HTMLIFrameElement
              ? node
              : node.querySelector('iframe')
          if (iframe) return iframe.addEventListener('load', done)
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
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
