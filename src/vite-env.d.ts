/// <reference types="vite/client" />

interface Pendo {
  track(eventName: string, properties?: Record<string, string | number | boolean | null>): void;
}

interface Window {
  pendo?: Pendo;
}

declare var pendo: Pendo | undefined;
