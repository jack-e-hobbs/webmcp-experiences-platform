# Agent-Native Demonstration Scenarios

This document outlines the five core interaction patterns verified on the AmazingExperiences platform. These scenarios demonstrate how WebMCP allows agents to move beyond surface-level "reading" into deep application integration.

---

## 1. Filtered Search via Logic Contract
**The Prompt:** *"Find me a romantic picnic in Melbourne for 4 people next weekend."*

### How it works:
*   **Mechanism:** `search_experiences` tool.
*   **Technical Detail:** Instead of the agent guessing which input boxes to fill, it calls a formal logic contract.
*   **Rich Data Return:** The tool returns a JSON payload containing the `id`, `name`, and `keywords` of every match.
*   **Outcome:** The agent receives the specific ID (`mel-picnic-001`) immediately and can proceed to the next step without asking the user for clarification.

---

## 2. Context-Aware Availability & Booking
**The Prompt:** (While viewing a product) *"Is this available on April 4th? If so, book it."*

### How it works:
*   **Mechanism:** `navigator.modelContext.provideContext`
*   **Technical Detail:** As the user navigates, the app actively pushes the `active_experience_id` into the agent's context window.
*   **Implicit Intent:** Because the agent already "sees" the product ID, it resolves the word "this" to the active state and calls `get_availability` instantly.

---

## 3. Data-Driven Wishlist Reasoning
**The Prompt:** *"Look at my wishlist and tell me which one is best for a family with kids."*

### How it works:
*   **Mechanism:** `get_wishlist` + `get_experience_details`.
*   **Technical Detail:** The `get_wishlist` tool returns enriched data, allowing the agent to map names to IDs. It then fetches full `description` and `inclusions` text for deep reasoning.
*   **Outcome:** The agent identifies Taronga Zoo's "Seal shows" and "Family tickets" from the raw data to provide a logical recommendation.

---

## 4. Cross-Platform Handoff (Calendar Sync)
**The Prompt:** (On the confirmation page) *"Add this to my Google Calendar."*

### How it works:
*   **Mechanism:** `generate_calendar_url` with persistent context.
*   **Technical Detail:** Upon booking, the app pushes a `last_booking` object into the WebMCP context. The tool uses a **Ref Fallback** to pull the date, 11:00 AM start time, and location if they aren't explicitly provided by the agent.
*   **Outcome:** The user receives a pre-filled calendar link without re-entering data.

---

## 5. High-Velocity State Manipulation
**The Prompt:** *"Find all the tours in Sydney and save them to my wishlist for later."*

### How it works:
*   **Mechanism:** `toggle_wishlist` tool.
*   **Technical Detail:** The tool is exposed as a discrete action that updates the central React state.
*   **Outcome:** A task requiring dozens of manual clicks is performed by the agent in seconds. The UI hearts turn green in real-time, providing immediate visual confirmation of the agent's background work.

---

## Technical Architecture Summary
| Integration Layer | WebMCP Component | Core Benefit |
| :--- | :--- | :--- |
| **Discovery** | Declarative HTML Attributes | Immediate agent awareness of page capabilities. |
| **Action** | Imperative `registerTool` | Deterministic execution of business logic. |
| **Vision** | `provideContext` | Eliminates redundant discovery and "What ID?" questions. |
| **Persistence** | `localStorage` Fallbacks | Ensures tool reliability across tab refreshes. |
