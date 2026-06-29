/**
 * AgentDiscoveryDetector
 *
 * Lightweight debug helper that logs to the console if WebMCP is available.
 * Session-gated capability telemetry is handled by App.tsx (fires once per
 * session after mount), so this module has no analytics responsibility.
 */
export const initDiscoveryDetection = () => {
  const mc = (document as any).modelContext || (navigator as any).modelContext;
  if (mc) {
    console.debug('[WebMCP] Capability detected at startup.');
  }
};
