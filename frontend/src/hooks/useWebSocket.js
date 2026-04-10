import { useEffect, useRef, useCallback } from "react";
import { WS_BASE } from "../utils/constants";

export default function useWebSocket(onMessage) {
  const wsRef         = useRef(null);
  const reconnectRef  = useRef(null);
  const mountedRef    = useRef(true);

  const connect = useCallback(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        console.warn("[WS] Failed to parse message", event.data);
      }
    };

    ws.onerror = (err) => {
      console.warn("[WS] Error", err);
    };

    ws.onclose = (event) => {
      console.log("[WS] Closed", event.code);
      if (mountedRef.current && event.code !== 1000) {
        // auto-reconnect after 3s unless clean close
        reconnectRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 3000);
      }
    };
  }, [onMessage]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "component unmount");
      }
    };
  }, [connect]);
}