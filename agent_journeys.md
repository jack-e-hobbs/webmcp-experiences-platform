# Agent-Native User Journeys: AmazingExperiences

This document summarises the five core user journeys enabled by the WebMCP integration on the AmazingExperiences platform. These journeys demonstrate the shift from "Scraping" to "Native Intelligence."

---

## 1. The Semantic Researcher
**The Prompt:** *"Find me a romantic picnic in Melbourne for 4 people next weekend."*

### Why it works:
*   **The Tool:** `search_experiences`
*   **The Logic:** Instead of the agent guessing which input boxes to fill, it calls a formal logic contract.
*   **Rich Data Return:** Unlike legacy APIs that return "Success," our tool returns a **Data-Rich JSON string** containing the `id`, `name`, and `keywords` of every match.
*   **Outcome:** The agent receives the specific ID (`mel-picnic-001`) immediately and can proceed to the next step without asking the user for clarification.

---

## 2. The Contextual Assistant
**The Prompt:** (While viewing a product) *"Is this available on April 4th? If so, book it."*

### Why it works:
*   **The Mechanism:** `navigator.modelContext.provideContext`
*   **State Sync:** As the user navigates, the app actively pushes the `active_experience_id` into the agent's short-term memory.
*   **Implicit Intent:** Because the agent "sees" the ID in its context window, it doesn't need to ask "Which picnic?". It map the word "this" to the injected ID and calls `get_availability` instantly.

---

## 3. The Intelligent Curator
**The Prompt:** *"Look at my wishlist and tell me which one is best for a family with kids."*

### Why it works:
*   **Enriched Retrieval:** The `get_wishlist` tool doesn't just return a list of IDs; it returns IDs, Names, and **Keywords**.
*   **Reasoning-on-Data:** By calling `get_experience_details`, the agent retrieves the full `description` and `inclusions`. 
*   **Outcome:** The agent can see that Taronga Zoo includes "Seal shows" and "Family ferry tickets," allowing it to provide a logical, data-backed recommendation rather than a generic summary.

---

## 4. The Multi-Site Orchestrator
**The Prompt:** (On the confirmation page) *"Add this to my Google Calendar."*

### Why it works:
*   **Success Context:** Upon a successful booking, the app pushes a `last_booking` object into the WebMCP context.
*   **Zero-Shot Execution:** The `generate_calendar_url` tool is configured with a **Ref Fallback**. If the agent doesn't provide details, the tool automatically pulls the date, 11:00 AM start time, and location from the persistent context.
*   **Outcome:** The user gets a pre-filled calendar link without re-entering a single piece of information.

---

## 5. The Bulk Automator
**The Prompt:** *"Find all the tours in Sydney and save them to my wishlist for later."*

### Why it works:
*   **Atomic Tooling:** The `toggle_wishlist` tool is exposed as a discrete action.
*   **Visual Feedback Loop:** Because the tool updates the central React state, the hearts on the UI turn red in real-time as the agent loops through the results.
*   **Outcome:** A task that would take a human 10+ clicks is performed by the agent in seconds, with the UI serving as a live progress monitor.

---

## Technical Summary
| Feature | WebMCP Component | Benefit |
| :--- | :--- | :--- |
| **Discovery** | Declarative HTML Attributes | Near-instant agent awareness of page capabilities. |
| **Action** | Imperative `registerTool` | Deterministic execution of business logic. |
| **Vision** | `provideContext` | Eliminates redundant "Discovery" questions. |
| **Robustness** | `localStorage` Fallbacks | Ensures agent tools work even after a hard refresh. |
