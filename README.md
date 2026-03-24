# AmazingExperiences: Agent-Native Discovery & Booking

**[🚀 Live Demo](https://jack-e-hobbs.github.io/webmcp-experiences-platform/)**

This demo was built in order to trial the new **WebMCP (Web Model Context Protocol)** standard. 
It provides a sandbox for how this new tech might be utilised, as well as provides an example of the ways that web analytics (in this case, Amplitude) can be applied to these agent interactions.

---

## 🤖 How to Interact (Agent-First)

To experience the full agent-native functionality, you must use a browser equipped with WebMCP capabilities.

1.  **Use Chrome Canary:** Download and install [Chrome Canary](https://www.google.com/chrome/canary/).
2.  **Enable the MCP Flag:** Navigate to `chrome://flags/#web-mcp` and set it to **Enabled**.
3.  **Install the Extension:** Install the [WebMCP Chrome Extension](https://github.com/GoogleChromeLabs/webmcp-tools) (needs a Gemini API key).
4.  **Try a Prompt:** Open the [Live Demo](https://jack-e-hobbs.github.io/webmcp-experiences-platform/) and ask your agent side-panel: *"Find me a romantic picnic in Melbourne for next weekend."*

---

## Why WebMCP?

A relatively new initiative, webMCP is being actively refined and enhanced by a working group. Progress can be followed here: https://github.com/webmachinelearning/webmcp.

Most AI agents currently interact with the web by "reading" the DOM—guessing what buttons do based on visual heuristics. WebMCP provides a formal handshake where the website explicitly declares its capabilities to the browser.

| Capability | Legacy Scraping | Agent-Native WebMCP |
| :--- | :--- | :--- |
| **Reliability** | Fails when UI classes change | Deterministic (API Contract) |
| **Data Efficiency** | High (parsing full HTML tokens) | Low (direct JSON transport) |
| **Security** | Implicit (simulated clicks) | Explicit (Human-in-the-Loop Consent) |
| **State Awareness** | Inferred from text | Synchronized via `provideContext` |

---

## Technical Architecture

This demo implements WebMCP across three distinct layers:

### 1. Declarative Discovery (HTML)
The search interface utilizes native WebMCP HTML attributes (`toolname` and `tooldescription`). The browser discovers application capabilities instantly as the HTML parses, requiring zero JavaScript execution for initial agent awareness.

### 2. Imperative Action (JavaScript)
We register high-fidelity business logic tools via `navigator.modelContext.registerTool`. Each tool (e.g., `initiate_booking`, `search_experiences`) is backed by a strict JSON Schema contract, ensuring deterministic agent interaction.

### 3. State Awareness (Context Injection)
Using `provideContext`, the application actively pushes its internal state to the browser assistant. When a user is on a product page, the agent already "sees" the active experience ID, enabling immediate, context-aware execution.

---

## Analytics & Attribution (Amplitude)

A core focus of this project is measuring and distinguishing between pure humans users, and users who interact via LLM sidecars rather than the traditional UI.

*   **Capabilities Tracking:** Every event is tagged with a `webmcp_enabled` global property to segment "Agent-Capable" sessions.
*   **Interaction Attribution:** Distinguishes between `interaction_source: Human` and `interaction_source: AI Agent` for side-by-side funnel analysis.
*   **Visual Auditing:** Amplitude Session Replay is active at a 100% sample rate to verify how agents manipulate the UI state.

---

## 📚 Resources
*   [**Demonstration Scenarios**](./docs/agent_journeys.md) - Verified interaction patterns and prompt sequences.
*   [**Amplitude Tracking Plan**](./docs/amplitude_tracking_plan.md) - Data taxonomy for agentic attribution.
*   [**WebMCP Tool Definitions**](./docs/webmcp-tools.jsonc) - Raw JSON schemas for the registered tools.

### Local Debugging
If you are developing without a Canary browser, the app exposes its tool definitions to the global scope. Inspect them via:
```javascript
console.table(window.__webmcp_tools);
```
