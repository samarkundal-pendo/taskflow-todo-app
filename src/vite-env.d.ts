/// <reference types="vite/client" />

interface Pendo {
  track(eventName: string, properties?: Record<string, string | number | boolean | null>): void;
}

declare const pendo: Pendo;
