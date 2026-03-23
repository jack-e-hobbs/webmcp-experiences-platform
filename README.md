# AmazingExperiences Platform: WebMCP Agent-Native Prototype

This is a demonstration platform built to showcase the **WebMCP (Web Model Context Protocol)** standard. It demonstrates how a modern web application can move beyond brittle screen scraping to provide a deterministic, high-fidelity interface for AI agents.

## 🚀 The Paradigm Shift: Scraping vs. Discovery

Traditional AI agents interact with the web by "scraping" the DOM—guessing what buttons do based on visual heuristics. **WebMCP** replaces this with **Discovery**: the browser discovers a formal contract (tools and context) provided directly by the website.

| Feature | Legacy Scraping | Agent-Native WebMCP |
| :--- | :--- | :--- |
| **Reliability** | Fails on UI updates | 100% Deterministic (API Contract) |
| **Token Efficiency** | High (10,000s of HTML tokens) | Low (100s of JSON tokens) |
| **Security** | Implicit (Simulated clicks) | Explicit (Human-in-the-Loop Consent) |
| **Context** | Inferred from text | Injected via `provideContext` |

---

## 🛠 WebMCP Integration Patterns

This prototype incorporates three primary WebMCP patterns:

### 1. The Imperative API (`navigator.modelContext`)
We register six core business logic tools that agents can call directly:
*   `search_experiences`: Semantic filtering of the catalog.
*   `get_wishlist`: Retrieval of user-saved history.
*   `toggle_wishlist`: Direct actuation with UI feedback.
*   `get_availability`: Real-time data verification.
*   `initiate_booking`: One-click transition to secure checkout.
*   `generate_calendar_url`: Multi-site orchestration (Handoff to Google/Outlook).

### 2. The Declarative API (HTML Attributes)
The search inputs on the Home Page utilize zero-code attributes:
*   `toolname`: Explicitly identifies the field's purpose to the agent.
*   `tooldescription`: Provides natural language metadata for the LLM.
*   **Benefit:** Allows the browser to understand the form logic instantly as the HTML parses.

### 3. Context Injection (`provideContext`)
The platform actively synchronizes its state with the agent's "short-term memory":
*   **PDP Sync:** Navigating to a product page automatically pushes the `experience_id` and `name` to the agent.
*   **Implicit Intent:** Users can say "Book this" instead of copy-pasting IDs, as the agent already "sees" the active product via the injected context.

---

## 📊 Analytics & Attribution (Amplitude)

A core pillar of this demo is **measuring the invisible user**. Every interaction is instrumented to distinguish between human and agent behaviour:

*   **Interaction Source:** Every event is tagged as `interaction_source: Human` or `interaction_source: AI Agent`.
*   **Discovery Tracking:** Relying on `webmcp_enabled` global property across all automated and manual events.
*   **Funnel Parity:** Allows analysts to compare conversion rates and search efficacy between humans and agents in real-time.
*   **Session Replay:** 100% capture rate to visually validate agent-driven UI state changes.

---

## 🛠 Development & Setup

### Prerequisites
*   **Google Chrome Canary** (with `#web-mcp` flag enabled).
*   **Node.js** (v18+).

### Installation
```bash
npm install
npm run build
```

### Running the Demo
```bash
./test_and_run.sh
```

---

## 📚 Resources
*   **User Journeys:** `agent_journeys.md` (Detailed breakdown of the 5 demo scenarios)
*   **Tool Docs:** `docs/webmcp-tools.jsonc`
*   **Tracking Plan:** `amplitude_tracking_plan.md`
