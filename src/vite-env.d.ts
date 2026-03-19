/// <reference types="vite/client" />

interface Pendo {
  track(eventName: string, properties?: Record<string, unknown>): void;
}

declare global {
  interface Window {
    pendo?: Pendo;
  }
  var pendo: Pendo | undefined;
}
