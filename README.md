# AmazingExperiences: Agent-Native Discovery & Booking

AmazingExperiences is a reference implementation of the **WebMCP (Web Model Context Protocol)** standard. It demonstrates how to transform a web application from a collection of "scraped" pixels into a first-class participant in the AI agent economy.

## From Brittle Scraping to Intentional Discovery

Most AI agents currently interact with the web by "reading" the DOM—guessing what buttons do based on visual heuristics. WebMCP provides a formal handshake where the website explicitly declares its capabilities to the browser.

| Capability | Legacy Scraping | Agent-Native WebMCP |
| :--- | :--- | :--- |
| **Reliability** | Fails when UI classes change | Deterministic (API Contract) |
| **Data Efficiency** | High (parsing full HTML tokens) | Low (direct JSON transport) |
| **Security** | Implicit (simulated clicks) | Explicit (Human-in-the-Loop Consent) |
| **State Awareness** | Inferred from text | Synchronized via `provideContext` |

---

## Technical Architecture

This prototype implements WebMCP across three distinct layers, providing a comprehensive blueprint for agent integration:

### 1. Declarative Discovery (HTML)
The search interface utilizes native WebMCP HTML attributes. By tagging form elements with `toolname` and `tooldescription`, the browser discovers application capabilities instantly as the HTML parses, requiring zero JavaScript execution for initial agent awareness.

### 2. Imperative Action (JavaScript)
We register high-fidelity business logic tools via `navigator.modelContext.registerTool`. Each tool (e.g., `initiate_booking`, `search_experiences`) is backed by a strict JSON Schema contract, ensuring deterministic agent interaction and eliminating the brittle nature of DOM-based "simulated clicks."

### 3. State Awareness (Context Injection)
Using `provideContext`, the application actively pushes its internal state to the browser assistant. This eliminates redundant "discovery" steps—when a user is on a product page, the agent already "sees" the active experience ID and description, enabling immediate, context-aware execution.

---

## Analytics & Attribution (Amplitude)

A core focus of this project is measuring the **"Silent Agent"**—users who browse and interact via LLM sidecars rather than the traditional UI.

*   **Capabilities Tracking:** Every event is tagged with a `webmcp_enabled` global property, allowing us to segment our data into "Agent-Capable" vs. "Legacy" sessions.
*   **Interaction Attribution:** We distinguish between `interaction_source: Human` and `interaction_source: AI Agent`, providing a side-by-side funnel analysis of how agents convert compared to humans.
*   **Visual Auditing:** Amplitude Session Replay is active at a 100% sample rate to visually verify and debug how agents manipulate the UI state.

---

## Live Interaction Guide

To see the agent-native logic in action, point a WebMCP-capable browser (e.g., Chrome Canary with the `#web-mcp` flag) at the [hosted demo](https://jack-e-hobbs.github.io/webmcp-experiences-platform/).

### Local Debugging
If you are developing without a Canary browser, the app exposes its tool definitions to the global scope. You can inspect the intended logic by running:
```javascript
console.table(window.__webmcp_tools);
```

## 📚 Resources
*   [**Agent User Journeys**](./agent_journeys.md) - Detailed breakdown of the 5 demo scenarios and why they work.
*   [**Amplitude Tracking Plan**](./amplitude_tracking_plan.md) - The technical data taxonomy for agentic attribution.
*   [**WebMCP Tool Definitions**](./docs/webmcp-tools.jsonc) - The raw JSON schemas for the registered tools.
