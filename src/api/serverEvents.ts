import { AxiosInstance } from 'axios';

export type ServerChange =
  | 'positions'
  | 'votes'
  | 'election'
  | 'schedule';

type Listener = (change: ServerChange) => void;

const listeners = new Set<Listener>();
let eventSource: EventSource | null = null;

function getEventsUrl(api: AxiosInstance): string {
  const baseURL = api.defaults.baseURL || '/api/v1';
  return new URL(`${baseURL.replace(/\/+$/, '')}/events`, window.location.origin).toString();
}

function connect(api: AxiosInstance): void {
  if (eventSource || typeof window === 'undefined' || !('EventSource' in window)) {
    return;
  }

  eventSource = new EventSource(getEventsUrl(api), { withCredentials: true });
  eventSource.addEventListener('change', (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent<string>).data) as { type?: ServerChange };
      if (payload.type) {
        listeners.forEach((listener) => listener(payload.type!));
      }
    } catch (error) {
      console.error('Could not parse server change event', error);
    }
  });
  eventSource.onerror = () => {
    // EventSource retries automatically; keep the connection for its reconnect.
  };
}

export function subscribeToServerChanges(api: AxiosInstance, listener: Listener): () => void {
  listeners.add(listener);
  connect(api);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
