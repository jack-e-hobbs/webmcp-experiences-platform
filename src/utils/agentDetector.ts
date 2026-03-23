/**
 * AgentDiscoveryDetector
 * 
 * Sets up traps on the navigator object to detect when an AI agent 
 * or browser extension is probing for WebMCP capabilities.
 * 
 * This is used for visual debugging in the console. 
 * Actual tracking is handled centrally in App.tsx to ensure 1-time 
 * firing and correct taxonomy.
 */
export const initDiscoveryDetection = () => {
  const probeNames = ['webmcp', 'modelContext'];
  const detected: Record<string, boolean> = {};

  probeNames.forEach(prop => {
    // Only set up the trap if the property doesn't already exist or 
    // if we want to wrap the existing one.
    const originalValue = (navigator as any)[prop];

    Object.defineProperty(navigator, prop, {
      get: function() {
        if (!detected[prop]) {
          detected[prop] = true;
          const msg = `[WebMCP Discovery] Agent probed for: navigator.${prop}`;
          console.log(`%c ${msg}`, 'background: #222; color: #00ff00; padding: 2px 5px; border-radius: 3px;');
          
          // NOTE: Amplitude tracking removed from here to prevent duplicate events.
          // App.tsx handles the authoritative 'WebMCP Discovery Attempted' event.
        }
        return originalValue;
      },
      configurable: true,
      enumerable: true
    });
  });
};
