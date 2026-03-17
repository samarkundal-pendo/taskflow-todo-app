/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    pendo?: {
      track(eventName: string, properties?: Record<string, unknown>): void;
    };
  }
  var pendo: {
    track(eventName: string, properties?: Record<string, unknown>): void;
  } | undefined;
}
